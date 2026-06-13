import { MenuExtractionError, type FullExtractionResult } from "./menu-extraction"
import { parsePrice, summarizeExtraction, type ExtractedMenuCategory, type ExtractedMenuItem } from "./menu-extraction-utils"
import { assertSafeUrl } from "./url-guard"

const USER_AGENT = "Mozilla/5.0 (compatible; MenuP-Importer/1.0; +https://menu-p.com)"
const FETCH_TIMEOUT_MS = 20_000
const MAX_ENDPOINT_BYTES = 4 * 1024 * 1024

interface SessionState {
  cookies: Map<string, string>
  csrfToken: string | null
  finalUrl: string
}

interface MenusSaCategory {
  id: string
  name: string
  endpoint: string
  image_url: string | null
}

export interface MenusSaThemeSnapshot {
  primary: string
  secondary: string
  accent: string
  background: string
}

export interface MenusSaInspection {
  finalUrl: string
  restaurantName: string
  logoUrl: string | null
  theme: MenusSaThemeSnapshot
  categories: Array<{
    id: string
    name: string
    image_url: string | null
  }>
}

interface MenusSaResponse {
  success?: boolean
  data?: {
    html?: string
  }
}

function decodeHtml(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

function stripTags(html: string): string {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim()
}

function getAttr(tag: string, name: string): string | null {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = tag.match(new RegExp(`\\s${escaped}=(["'])(.*?)\\1`, "i"))
  return match ? decodeHtml(match[2]) : null
}

function absoluteUrl(value: string | null, baseUrl: string): string | null {
  if (!value || value === "javascript:;" || value.startsWith("data:")) return null
  try {
    return new URL(decodeHtml(value), baseUrl).toString()
  } catch {
    return null
  }
}

function cookieHeader(cookies: Map<string, string>): string {
  return Array.from(cookies.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ")
}

function storeCookies(cookies: Map<string, string>, headers: Headers): void {
  const getSetCookie = (headers as unknown as { getSetCookie?: () => string[] }).getSetCookie
  const raw = typeof getSetCookie === "function" ? getSetCookie.call(headers) : []
  const setCookieHeaders = raw.length > 0 ? raw : [headers.get("set-cookie")].filter(Boolean)
  for (const header of setCookieHeaders) {
    const firstPart = header?.split(";")[0]
    const eq = firstPart?.indexOf("=") ?? -1
    if (!firstPart || eq <= 0) continue
    cookies.set(firstPart.slice(0, eq), firstPart.slice(eq + 1))
  }
}

async function fetchWithSession(
  url: string,
  session: SessionState,
  init: RequestInit = {},
  redirectsLeft = 5
): Promise<{ body: string; url: string; contentType: string; status: number }> {
  const safe = await assertSafeUrl(url)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  let res: Response

  try {
    res = await fetch(safe.toString(), {
      ...init,
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json,text/html,*/*",
        Cookie: cookieHeader(session.cookies),
        ...(init.headers ?? {}),
      },
    })
  } catch (err) {
    throw new MenuExtractionError("fetch_failed", `Could not fetch menus-sa URL: ${(err as Error).message}`)
  } finally {
    clearTimeout(timeout)
  }

  storeCookies(session.cookies, res.headers)

  if (res.status >= 300 && res.status < 400) {
    if (redirectsLeft <= 0) {
      throw new MenuExtractionError("fetch_failed", "menus-sa returned too many redirects")
    }
    const location = res.headers.get("location")
    if (!location) throw new MenuExtractionError("fetch_failed", "menus-sa returned an invalid redirect")
    return fetchWithSession(new URL(location, safe).toString(), session, init, redirectsLeft - 1)
  }

  const contentLength = Number(res.headers.get("content-length") || 0)
  if (contentLength > MAX_ENDPOINT_BYTES) {
    throw new MenuExtractionError("file_too_large", "menus-sa response is too large")
  }

  const body = await res.text()
  if (body.length > MAX_ENDPOINT_BYTES) {
    throw new MenuExtractionError("file_too_large", "menus-sa response is too large")
  }

  return {
    body,
    url: safe.toString(),
    contentType: (res.headers.get("content-type") || "").toLowerCase(),
    status: res.status,
  }
}

export function isMenusSaUrl(rawUrl: string): boolean {
  try {
    const host = new URL(rawUrl).hostname.toLowerCase()
    return host === "menus-sa.com" || host.endsWith(".menus-sa.com")
  } catch {
    return false
  }
}

function extractCsrf(html: string): string | null {
  return html.match(/<meta[^>]+name=["']csrf-token["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? null
}

function extractMetaContent(html: string, name: string): string | null {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return (
    html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i"))?.[1] ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, "i"))?.[1] ??
    null
  )
}

function extractRestaurantName(html: string, url: string): string {
  const fromMeta = extractMetaContent(html, "og:title") || extractMetaContent(html, "twitter:title")
  const fromTitle = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
  const raw = stripTags(fromMeta || fromTitle || "")
    .replace(/\s*[-|]\s*(menus-sa|MENU|قائمة الطلبات).*$/i, "")
    .trim()
  if (raw) return raw

  try {
    const host = new URL(url).hostname.split(".")[0]
    return host.replace(/[-_]+/g, " ").trim() || "قائمة المطعم"
  } catch {
    return "قائمة المطعم"
  }
}

function extractLogoUrl(html: string, baseUrl: string): string | null {
  const ogImage = absoluteUrl(extractMetaContent(html, "og:image"), baseUrl)
  const imageCandidates = Array.from(html.matchAll(/<img\b([^>]*)>/gi)).map((match, index) => {
    const attrs = match[1]
    const src = absoluteUrl(getAttr(attrs, "src") || getAttr(attrs, "data-src") || getAttr(attrs, "data-original"), baseUrl)
    const label = `${getAttr(attrs, "class") || ""} ${getAttr(attrs, "id") || ""} ${getAttr(attrs, "alt") || ""} ${src || ""}`.toLowerCase()
    return { src, label, index }
  })

  const usable = imageCandidates.filter(({ src, label }) => {
    if (!src) return false
    return !/(favicon|loader|placeholder|spinner|flag|apple-touch|qr|google|facebook|instagram)/i.test(label)
  })

  const explicitLogo = usable.find(({ label }) => /(logo|brand|merchant|restaurant|store|مطعم|شعار)/i.test(label))
  if (explicitLogo?.src) return explicitLogo.src
  if (ogImage && !/(favicon|placeholder|default)/i.test(ogImage)) return ogImage
  return usable[0]?.src ?? null
}

function isNeutralHex(hex: string): boolean {
  const value = hex.replace("#", "")
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  return max - min < 18 || max > 245 || max < 30
}

function extractThemeSnapshot(html: string): MenusSaThemeSnapshot {
  const themeColor = extractMetaContent(html, "theme-color")
  const colors = Array.from(html.matchAll(/#[0-9a-f]{6}\b/gi)).map((match) => match[0].toUpperCase())
  const ranked = Array.from(new Set([themeColor, ...colors].filter(Boolean) as string[])).filter((color) => !isNeutralHex(color))
  const primary = ranked[0] || "#2F3A28"
  const secondary = ranked[1] || "#8E2A3C"
  const accent = ranked[2] || "#C49A42"
  return {
    primary,
    secondary,
    accent,
    background: "#FBF5EC",
  }
}

function extractCategories(html: string, baseUrl: string): MenusSaCategory[] {
  const matches = Array.from(
    html.matchAll(/<div\b(?=[^>]*\bmainCategory\b)(?=[^>]*\bdata-url=)([^>]*)>/gi)
  )
  const categories: MenusSaCategory[] = []

  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index]
    const attrs = match[1]
    const endpoint = absoluteUrl(getAttr(attrs, "data-url"), baseUrl)
    if (!endpoint || endpoint.includes("/all-products/")) continue

    const start = (match.index ?? 0) + match[0].length
    const end = matches[index + 1]?.index ?? html.indexOf("master-products", start)
    const segment = html.slice(start, end > start ? end : start + 1000)
    const name = stripTags(segment)
    if (!name) continue

    const id = getAttr(attrs, "data-spy")?.replace(/^#/, "") || endpoint.match(/get-products\/([^/]+)/)?.[1] || name
    const imageMatch = segment.match(/<img[^>]+src=(["'])(.*?)\1/i)
    categories.push({
      id,
      name,
      endpoint,
      image_url: absoluteUrl(imageMatch?.[2] ?? null, baseUrl),
    })
  }

  const seen = new Set<string>()
  return categories.filter((category) => {
    const key = category.endpoint
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

async function loadMenusSaLanding(rawUrl: string): Promise<{ session: SessionState; body: string; safeUrl: URL }> {
  const safe = await assertSafeUrl(rawUrl)
  const session: SessionState = {
    cookies: new Map(),
    csrfToken: null,
    finalUrl: safe.toString(),
  }

  await fetchWithSession(safe.toString(), session)
  const second = await fetchWithSession(safe.toString(), session, {
    headers: { Referer: safe.toString() },
  })

  if (second.status !== 200) {
    throw new MenuExtractionError("fetch_failed", `menus-sa page failed with HTTP ${second.status}`)
  }

  session.finalUrl = second.url
  session.csrfToken = extractCsrf(second.body)
  return { session, body: second.body, safeUrl: safe }
}

export async function inspectMenusSaMenu(rawUrl: string): Promise<MenusSaInspection> {
  const { session, body } = await loadMenusSaLanding(rawUrl)
  const categories = extractCategories(body, session.finalUrl)
  if (categories.length === 0) {
    throw new MenuExtractionError("empty_extraction", "لم نتمكن من العثور على أقسام menus-sa في هذا الرابط")
  }

  return {
    finalUrl: session.finalUrl,
    restaurantName: extractRestaurantName(body, session.finalUrl),
    logoUrl: extractLogoUrl(body, session.finalUrl),
    theme: extractThemeSnapshot(body),
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      image_url: category.image_url,
    })),
  }
}

function productCardChunks(html: string): string[] {
  const starts = Array.from(html.matchAll(/<div\b[^>]*class=(["'])[^"']*\bproduct_card\b[^"']*\1[^>]*>/gi)).map(
    (match) => match.index ?? 0
  )
  return starts.map((start, index) => html.slice(start, starts[index + 1] ?? html.length))
}

function extractProductImage(cardHtml: string, baseUrl: string): { imageUrl: string | null; alt: string | null } {
  const imageBlock = cardHtml.match(/<div\b[^>]*class=(["'])[^"']*\bproduct_image\b[^"']*\1[^>]*>[\s\S]*?<\/div>/i)?.[0] ?? cardHtml
  const img = imageBlock.match(/<img\b([^>]*)>/i)?.[1] ?? ""
  return {
    imageUrl: absoluteUrl(getAttr(img, "src"), baseUrl),
    alt: getAttr(img, "alt"),
  }
}

function extractAllergens(cardHtml: string): string[] {
  const block = cardHtml.match(/<div\b[^>]*class=(["'])[^"']*\ballergen\b[^"']*\1[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i)?.[2] ?? ""
  const titles = Array.from(block.matchAll(/<img\b[^>]*\btitle=(["'])(.*?)\1/gi)).map((match) => stripTags(match[2]))
  const labels = Array.from(block.matchAll(/<p\b[^>]*class=(["'])[^"']*\bpopup-toolbar-title\b[^"']*\1[^>]*>([\s\S]*?)<\/p>/gi)).map((match) => stripTags(match[2]))
  return Array.from(new Set([...titles, ...labels].filter(Boolean)))
}

function extractProduct(cardHtml: string, baseUrl: string): ExtractedMenuItem | null {
  const contentHtml =
    cardHtml.match(/<div\b[^>]*class=(["'])[^"']*\bproduct_content\b[^"']*\1[^>]*>([\s\S]*)/i)?.[2] ?? cardHtml
  const { imageUrl, alt } = extractProductImage(cardHtml, baseUrl)
  const name =
    stripTags(
      contentHtml.match(/<p\b(?=[^>]*\bmb-0\b)(?![^>]*\bdescription\b)(?![^>]*\bproduct_price\b)[^>]*>([\s\S]*?)<\/p>/i)?.[1] ??
        ""
    ) || alt?.trim() || ""
  if (!name) return null

  const description = stripTags(
    contentHtml.match(/<p\b[^>]*class=(["'])[^"']*\bdescription\b[^"']*\1[^>]*>([\s\S]*?)<\/p>/i)?.[2] ?? ""
  )
  const priceText = stripTags(
    contentHtml.match(/<p\b[^>]*class=(["'])[^"']*\bproduct_price\b[^"']*\1[^>]*>([\s\S]*?)<\/p>/i)?.[2] ?? ""
  )
  const parsedPrice = parsePrice(priceText)
  const plainText = stripTags(cardHtml)
  const calories = plainText.match(/(\d+(?:\.\d+)?)\s*سعرات\s*حراريه?/i)?.[0]
  const allergens = extractAllergens(cardHtml)
  const extraNotes = [description, calories, allergens.length ? `الحساسية: ${allergens.join("، ")}` : ""].filter(Boolean)

  return {
    name,
    name_en: null,
    description: extraNotes.length ? extraNotes.join("\n") : null,
    price: parsedPrice.price,
    image_url: imageUrl,
    currency: "SAR",
    confidence: 1,
    flags: parsedPrice.flags,
  }
}

function parseProductsHtml(html: string, category: MenusSaCategory, baseUrl: string): ExtractedMenuCategory | null {
  const items = productCardChunks(html)
    .map((card) => extractProduct(card, baseUrl))
    .filter((item): item is ExtractedMenuItem => Boolean(item))

  if (items.length === 0) return null
  return {
    name: category.name,
    name_en: null,
    description: null,
    confidence: 1,
    items,
  }
}

async function fetchProductsHtml(category: MenusSaCategory, session: SessionState): Promise<string> {
  const res = await fetchWithSession(category.endpoint, session, {
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      Referer: session.finalUrl,
    },
  })
  if (res.status !== 200) {
    throw new MenuExtractionError("fetch_failed", `menus-sa category failed with HTTP ${res.status}`)
  }
  const payload = JSON.parse(res.body) as MenusSaResponse
  const html = payload.data?.html
  if (!payload.success || !html) {
    throw new MenuExtractionError("empty_extraction", "menus-sa category returned no products")
  }
  return html
}

export async function extractMenusSaMenu(rawUrl: string): Promise<FullExtractionResult & { finalUrl: string }> {
  const { session, body, safeUrl } = await loadMenusSaLanding(rawUrl)

  const categories = extractCategories(body, session.finalUrl)
  if (categories.length === 0) {
    throw new MenuExtractionError("empty_extraction", "لم نتمكن من العثور على أقسام menus-sa في هذا الرابط")
  }

  const parsedCategories: ExtractedMenuCategory[] = []
  for (const category of categories) {
    const html = await fetchProductsHtml(category, session)
    const parsed = parseProductsHtml(html, category, session.finalUrl)
    if (parsed) parsedCategories.push(parsed)
  }

  const extraction = {
    categories: parsedCategories,
    detected_language: safeUrl.pathname.includes("/en") ? "en" : "ar",
    currency_guess: "SAR",
  }

  if (extraction.categories.length === 0) {
    throw new MenuExtractionError("empty_extraction", "لم نتمكن من العثور على أصناف menus-sa في هذا الرابط")
  }

  return {
    raw: extraction,
    verified: extraction,
    summary: summarizeExtraction(extraction),
    finalUrl: session.finalUrl,
  }
}

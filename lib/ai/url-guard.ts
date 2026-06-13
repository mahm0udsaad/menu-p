/**
 * SSRF guard + safe remote fetch for the URL menu-import path.
 *
 * User-supplied URLs are fetched server-side, so every URL (and every redirect
 * hop) must be validated to a PUBLIC http(s) destination before we touch it.
 * Blocks loopback, private, link-local and other reserved ranges — including
 * the cloud metadata endpoint (169.254.169.254).
 */

import dns from "dns/promises"
import net from "net"

export type UrlGuardErrorCode =
  | "invalid_url"
  | "bad_scheme"
  | "blocked_host"
  | "dns_failed"
  | "too_many_redirects"
  | "fetch_failed"
  | "too_large"
  | "empty"

export class UrlGuardError extends Error {
  readonly code: UrlGuardErrorCode
  constructor(code: UrlGuardErrorCode, message: string) {
    super(message)
    this.name = "UrlGuardError"
    this.code = code
  }
}

const MAX_REDIRECTS = 5
const MAX_BYTES = 15 * 1024 * 1024 // a touch above the AI 12MB ceiling
const FETCH_TIMEOUT_MS = 20_000

// Reserved / private IPv4 ranges expressed as [network, maskBits].
const BLOCKED_V4: Array<[string, number]> = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local incl. cloud metadata 169.254.169.254
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved
]

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0
}

function isBlockedV4(ip: string): boolean {
  const addr = ipv4ToInt(ip)
  return BLOCKED_V4.some(([net, bits]) => {
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0
    return (addr & mask) === (ipv4ToInt(net) & mask)
  })
}

function isBlockedV6(ip: string): boolean {
  const lower = ip.toLowerCase()
  if (lower === "::1" || lower === "::") return true // loopback / unspecified
  if (lower.startsWith("fe80")) return true // link-local
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true // unique local
  // IPv4-mapped (::ffff:a.b.c.d) — validate the embedded v4 address
  const mapped = lower.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isBlockedV4(mapped[1])
  return false
}

function isBlockedIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isBlockedV4(ip)
  if (net.isIPv6(ip)) return isBlockedV6(ip)
  return true // unknown format → block
}

/**
 * Validate that a URL is a public http(s) destination. Throws UrlGuardError
 * otherwise. Returns the parsed URL on success.
 */
export async function assertSafeUrl(rawUrl: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new UrlGuardError("invalid_url", "الرابط غير صالح")
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UrlGuardError("bad_scheme", "يُسمح فقط بروابط http/https")
  }

  // A literal IP host must itself be public.
  const host = url.hostname
  if (net.isIP(host)) {
    if (isBlockedIp(host)) throw new UrlGuardError("blocked_host", "وجهة الرابط غير مسموح بها")
    return url
  }

  // Resolve the hostname and ensure EVERY resolved address is public.
  let addresses: { address: string }[]
  try {
    addresses = await dns.lookup(host, { all: true })
  } catch {
    throw new UrlGuardError("dns_failed", "تعذر الوصول إلى الرابط")
  }
  if (addresses.length === 0) throw new UrlGuardError("dns_failed", "تعذر الوصول إلى الرابط")
  for (const { address } of addresses) {
    if (isBlockedIp(address)) throw new UrlGuardError("blocked_host", "وجهة الرابط غير مسموح بها")
  }
  return url
}

export interface RemoteFile {
  bytes: Uint8Array
  contentType: string
  finalUrl: string
}

/**
 * Fetch a remote file with SSRF-safe manual redirect handling (each hop is
 * re-validated), a byte cap and a timeout. Returns the raw bytes and the
 * resolved Content-Type.
 */
export async function fetchRemoteFile(rawUrl: string): Promise<RemoteFile> {
  let current = rawUrl
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const safe = await assertSafeUrl(current)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    let res: Response
    try {
      res = await fetch(safe.toString(), {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          // A real UA avoids trivial bot blocks on legit restaurant sites.
          "User-Agent":
            "Mozilla/5.0 (compatible; MenuP-Importer/1.0; +https://menu-p.com)",
          Accept: "application/pdf,image/*,text/html,*/*",
        },
      })
    } catch (err) {
      throw new UrlGuardError("fetch_failed", `تعذر تحميل الرابط: ${(err as Error).message}`)
    } finally {
      clearTimeout(timeout)
    }

    // Follow redirects manually so each new host is re-validated.
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location")
      if (!location) throw new UrlGuardError("fetch_failed", "إعادة توجيه غير صالحة")
      current = new URL(location, safe).toString()
      continue
    }

    if (!res.ok) {
      throw new UrlGuardError("fetch_failed", `تعذر تحميل الرابط (HTTP ${res.status})`)
    }

    const contentType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase()
    const declaredLength = Number(res.headers.get("content-length") || 0)
    if (declaredLength > MAX_BYTES) {
      throw new UrlGuardError("too_large", "حجم الملف أكبر من الحد المسموح")
    }

    const buffer = new Uint8Array(await res.arrayBuffer())
    if (buffer.byteLength === 0) throw new UrlGuardError("empty", "الرابط لا يحتوي على محتوى")
    if (buffer.byteLength > MAX_BYTES) {
      throw new UrlGuardError("too_large", "حجم الملف أكبر من الحد المسموح")
    }

    return { bytes: buffer, contentType, finalUrl: safe.toString() }
  }
  throw new UrlGuardError("too_many_redirects", "عدد كبير من عمليات إعادة التوجيه")
}

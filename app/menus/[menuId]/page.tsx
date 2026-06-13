import type { Metadata } from "next"
import { notFound } from "next/navigation"
import PublicMenuView from "@/components/public-menu/public-menu-view"
import type { LanguageOption } from "@/components/public-menu/language-control"
import { languageLabel, resolveLanguage } from "@/components/public-menu/i18n"
import { categoriesForLanguage } from "@/components/public-menu/types"
import { resolveMenuTheme } from "@/lib/theming/theme"
import { loadPublicMenu } from "./_lib/load"

/**
 * Public menu — the page existing QR codes point at (/menus/{publishedMenuId}).
 * Renders the live HTML menu (no PDF embed) themed from the restaurant brand.
 */

interface MenuPageProps {
  params: Promise<{ menuId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ menuId: string }>
}): Promise<Metadata> {
  const { menuId } = await params
  const data = await loadPublicMenu(menuId)
  if (!data) {
    return {
      title: "القائمة غير موجودة | Menu-P",
      description: "تعذّر العثور على هذه القائمة.",
      robots: { index: false },
    }
  }
  const title = `${data.restaurant.name} — ${data.menu.name || "القائمة"}`
  const description = `تصفّح قائمة ${data.restaurant.name}: الأصناف والأسعار محدّثة دائماً. ${
    data.restaurant.category ? `(${data.restaurant.category}) ` : ""
  }عبر Menu-P.`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(data.restaurant.logo_url ? { images: [{ url: data.restaurant.logo_url }] } : {}),
    },
  }
}

export default async function MenuPage({ params, searchParams }: MenuPageProps) {
  const [{ menuId }, query] = await Promise.all([params, searchParams])
  const data = await loadPublicMenu(menuId)
  if (!data) notFound()

  const langParam = typeof query.lang === "string" ? query.lang : undefined
  const available = data.languages.map((l) => l.code)
  const lang = resolveLanguage(langParam, undefined, available, data.sourceLanguage)
  const hasExplicitLang = Boolean(langParam && available.includes(langParam))

  const categories = categoriesForLanguage(
    data.categories,
    data.translations,
    data.sourceLanguage,
    lang,
  )
  const theme = await resolveMenuTheme(data.restaurant, data.customizations)

  // Sibling published_menus rows keep their own URL (their PDF lives there);
  // translation-only languages render on this row via ?lang=.
  const languageOptions: LanguageOption[] = data.languages.map((l) => ({
    code: l.code,
    label: languageLabel(l.code),
    href: `/menus/${l.menuId ?? menuId}?lang=${encodeURIComponent(l.code)}`,
  }))
  const pdfUrl = data.languages.find((l) => l.code === lang)?.pdfUrl ?? data.menu.pdfUrl

  return (
    <PublicMenuView
      theme={theme}
      restaurant={data.restaurant}
      menuName={data.menu.name}
      pdfUrl={pdfUrl}
      categories={categories}
      lang={lang}
      languageOptions={languageOptions}
      hasExplicitLang={hasExplicitLang}
    />
  )
}

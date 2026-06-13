import { notFound } from "next/navigation"
import PublicMenuView from "@/components/public-menu/public-menu-view"
import { languageLabel } from "@/components/public-menu/i18n"
import type { PublicMenuCategory, PublicRestaurant } from "@/components/public-menu/types"
import { buildMenuTheme } from "@/lib/theming/theme"

/**
 * Dev-only visual fixture for the public menu (never ships to production).
 * /menus/preview-fixture          → Arabic menu
 * /menus/preview-fixture?splash=1 → language splash state
 */

function svgImage(from: string, to: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)"/><circle cx="100" cy="100" r="56" fill="rgba(255,255,255,.22)"/><circle cx="100" cy="100" r="34" fill="rgba(255,255,255,.3)"/></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const restaurant: PublicRestaurant = {
  id: "fixture",
  name: "مطعم الياسمين",
  category: "مأكولات شامية",
  currency: "EGP",
  address: "١٢ شارع النيل، الزمالك، القاهرة",
  phone: "+20 100 123 4567",
  website: null,
  logo_url: null,
  color_palette: { primary: "#0f766e", secondary: "#134e4a", accent: "#b45309" },
}

let order = 0
function item(
  name: string,
  description: string | null,
  price: number | null,
  opts: { image?: string; featured?: boolean; unavailable?: boolean; tags?: string[] } = {},
) {
  return {
    id: `i${++order}`,
    name,
    description,
    price,
    image_url: opts.image ?? null,
    is_featured: Boolean(opts.featured),
    is_available: !opts.unavailable,
    dietary_info: opts.tags ?? [],
    display_order: order,
  }
}

const categories: PublicMenuCategory[] = [
  {
    id: "c1",
    name: "المقبلات",
    description: "بداية شهية على الطريقة الشامية",
    display_order: 1,
    items: [
      item("حمص بالطحينة", "حمص مهروس بالطحينة وزيت الزيتون البكر مع حبات الحمص الكاملة والكمون", 45, {
        image: svgImage("#d9b38c", "#a9743f"),
        tags: ["نباتي"],
      }),
      item("متبل باذنجان", "باذنجان مشوي على الفحم مع طحينة ولبن ورمان", 50, { tags: ["نباتي"] }),
      item("شوربة عدس", "شوربة العدس التقليدية مع الليمون والخبز المحمّص", 40, {
        image: svgImage("#e3a857", "#b06f2a"),
      }),
    ],
  },
  {
    id: "c2",
    name: "المشاوي",
    description: "مشاوي على الفحم تُقدَّم مع الخبز والمقبلات",
    display_order: 2,
    items: [
      item(
        "مشاوي مشكلة الياسمين",
        "تشكيلة كباب حلبي وشيش طاووق وريش غنم تكفي شخصين، مع أرز شرقي وصحن سلطة",
        320,
        { image: svgImage("#9a3b3b", "#5c1a1a"), featured: true },
      ),
      item("كباب حلبي", "لحم غنم مفروم مع البقدونس والبهارات الحلبية، ١٠ أسياخ", 180, {
        image: svgImage("#a8552f", "#6e2f14"),
      }),
      item("شيش طاووق", "مكعبات دجاج متبلة بالثوم والليمون مع صوص الثومية", 150),
      item("ريش غنم", "ريش غنم طازجة متبلة بالأعشاب الجبلية", 260, { unavailable: true }),
    ],
  },
  {
    id: "c3",
    name: "المشروبات",
    description: null,
    display_order: 3,
    items: [
      item("عصير ليمون بالنعناع", "ليمون طازج مع أوراق النعناع والثلج المجروش", 35, {
        image: svgImage("#9ccc65", "#558b2f"),
      }),
      item("شاي مغربي بالنعناع", "إبريق شاي أخضر منعنع يقدَّم مع الصنوبر", 30, { tags: ["ساخن"] }),
    ],
  },
]

export default async function PreviewFixturePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  if (process.env.NODE_ENV === "production") notFound()
  const query = await searchParams
  const theme = buildMenuTheme(restaurant, {
    font_settings: { arabic: { font: "almarai", weight: "bold" } },
  })
  return (
    <PublicMenuView
      theme={theme}
      restaurant={restaurant}
      menuName="قائمة الطعام الرئيسية"
      pdfUrl="#fixture-pdf"
      categories={categories}
      lang="ar"
      languageOptions={["ar", "en"].map((code) => ({
        code,
        label: languageLabel(code),
        href: `/menus/preview-fixture?lang=${code}`,
      }))}
      hasExplicitLang={true}
      forceSplash={query.splash === "1"}
    />
  )
}

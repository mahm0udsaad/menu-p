/**
 * Full public-menu composition (server component): themed root, sticky
 * header + category pill bar, item sections, footer, language splash.
 * Used by app/menus/[menuId]/page.tsx and the dev preview fixture.
 */

import type { MenuTheme } from "@/lib/theming/theme"
import MenuStyles from "./menu-styles"
import MenuHeader from "./menu-header"
import CategoryNav from "./category-nav"
import MenuSections from "./menu-sections"
import MenuFooter from "./menu-footer"
import LanguageControl, { type LanguageOption } from "./language-control"
import { getStrings, isRtl } from "./i18n"
import type { PublicMenuCategory, PublicRestaurant } from "./types"

export interface PublicMenuViewProps {
  theme: MenuTheme
  restaurant: PublicRestaurant
  menuName: string
  pdfUrl: string | null
  categories: PublicMenuCategory[]
  lang: string
  languageOptions: LanguageOption[]
  hasExplicitLang: boolean
  /** Preview/testing only: open the language splash immediately. */
  forceSplash?: boolean
}

export default function PublicMenuView({
  theme,
  restaurant,
  menuName,
  pdfUrl,
  categories,
  lang,
  languageOptions,
  hasExplicitLang,
  forceSplash = false,
}: PublicMenuViewProps) {
  const strings = getStrings(lang)
  const dir = isRtl(lang) ? "rtl" : "ltr"

  return (
    <>
      <MenuStyles cssVars={theme.cssVars} />
      <div className="pm-root" dir={dir} lang={lang}>
        <header className="pm-sticky">
          <MenuHeader
            restaurant={restaurant}
            menuName={menuName}
            pdfUrl={pdfUrl}
            strings={strings}
            languageSlot={
              <LanguageControl
                options={languageOptions}
                current={lang}
                hasExplicitLang={hasExplicitLang}
                restaurantName={restaurant.name}
                logoUrl={restaurant.logo_url}
                strings={strings}
                forceSplash={forceSplash}
              />
            }
          />
          <CategoryNav categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
        </header>
        <main className="pm-main">
          <MenuSections
            categories={categories}
            currency={restaurant.currency}
            lang={lang}
            strings={strings}
          />
        </main>
        <MenuFooter restaurant={restaurant} strings={strings} />
      </div>
    </>
  )
}

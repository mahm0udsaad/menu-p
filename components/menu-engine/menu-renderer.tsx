/**
 * MenuRenderer — the single source of truth for menu output (v1).
 *
 * Emits the fixed DOM from docs/MENU-THEME-CONTRACT.md, injects the resolved
 * theme CSS + token CSS-variables + layout data-* flags. The SAME component
 * renders the live editor preview and (via renderToStaticMarkup) the PDF — so
 * they can never drift.
 *
 * The editor makes it interactive through `slots`: optional render-props that
 * inject editable fields, drag handles and add-buttons WITHOUT changing the
 * `.menu__*` structure. With no slots it renders a clean, static menu.
 *
 * No "use client", no hooks — safe to server-render for PDF.
 */

import type { CSSProperties, HTMLAttributes, ReactNode } from "react"
import { currencyLabel, formatAmount, toArabicDigits } from "@/lib/posters/poster-utils"
import { tokensToCssVars, type RenderMenu, type RenderMenuCategory, type RenderMenuItem } from "@/lib/menu-themes/types"
import type { ResolvedTheme } from "@/lib/menu-themes/registry"

export interface SlotCtx {
  categoryId: string
  index: number
}

export interface MenuRendererSlots {
  itemName?: (item: RenderMenuItem, ctx: SlotCtx) => ReactNode
  itemDesc?: (item: RenderMenuItem, ctx: SlotCtx) => ReactNode
  itemPrice?: (item: RenderMenuItem, ctx: SlotCtx) => ReactNode
  /** extra nodes inside the <li> (e.g. drag handle, delete button) */
  itemExtra?: (item: RenderMenuItem, ctx: SlotCtx) => ReactNode
  /** attributes spread onto the <li> (e.g. dnd refs/listeners, onClick) */
  itemProps?: (item: RenderMenuItem, ctx: SlotCtx) => HTMLAttributes<HTMLLIElement>
  categoryName?: (cat: RenderMenuCategory, index: number) => ReactNode
  categoryDesc?: (cat: RenderMenuCategory, index: number) => ReactNode
  categoryExtra?: (cat: RenderMenuCategory, index: number) => ReactNode
  categoryProps?: (cat: RenderMenuCategory, index: number) => HTMLAttributes<HTMLElement>
  /** node after a category's items (e.g. "add item" button) */
  afterItems?: (cat: RenderMenuCategory, index: number) => ReactNode
  /** node after all categories (e.g. "add category" button) */
  afterCategories?: () => ReactNode
  headerExtra?: () => ReactNode
}

export interface MenuRendererProps {
  menu: RenderMenu
  theme: ResolvedTheme
  slots?: MenuRendererSlots
  /** when true (default), include the <style> tag. Set false if injecting CSS elsewhere. */
  withStyle?: boolean
  className?: string
}

function priceParts(price: number | null | undefined, currency: string) {
  if (price == null || !Number.isFinite(price)) return null
  return { value: toArabicDigits(formatAmount(price)), currency: currencyLabel(currency) }
}

export function MenuRenderer({ menu, theme, slots, withStyle = true, className }: MenuRendererProps) {
  const { layout, tokens, css, id } = theme
  const rootStyle = tokensToCssVars(tokens) as CSSProperties

  return (
    <>
      {withStyle && <style data-menu-theme={id} dangerouslySetInnerHTML={{ __html: css }} />}
      <div
        className={`menu${className ? ` ${className}` : ""}`}
        dir="rtl"
        data-columns={layout.columns}
        data-item={layout.item}
        data-images={layout.images}
        data-dividers={layout.dividers}
        data-density={layout.density}
        style={rootStyle}
      >
        <header className="menu__header">
          {menu.logoUrl ? <img className="menu__logo" src={menu.logoUrl} alt="" /> : null}
          <h1 className="menu__title">{menu.restaurantName}</h1>
          {menu.tagline ? <p className="menu__tagline">{menu.tagline}</p> : null}
          {slots?.headerExtra?.()}
        </header>

        <main className="menu__body">
          {menu.categories.map((cat, ci) => {
            const catProps = slots?.categoryProps?.(cat, ci) ?? {}
            return (
              <section className="menu__category" key={cat.id} {...catProps}>
                <header className="menu__category-head">
                  <h2 className="menu__category-name">{slots?.categoryName?.(cat, ci) ?? cat.name}</h2>
                  {cat.description || slots?.categoryDesc ? (
                    <p className="menu__category-desc">{slots?.categoryDesc?.(cat, ci) ?? cat.description}</p>
                  ) : null}
                  {slots?.categoryExtra?.(cat, ci)}
                </header>

                <ul className="menu__items">
                  {cat.items.map((item, ii) => {
                    const ctx: SlotCtx = { categoryId: cat.id, index: ii }
                    const liProps = slots?.itemProps?.(item, ctx) ?? {}
                    const pp = priceParts(item.price, menu.currency)
                    const showMedia = layout.images === "on" && !!item.imageUrl
                    return (
                      <li className="menu__item" key={item.id} {...liProps}>
                        {showMedia ? (
                          <div className="menu__item-media">
                            <img className="menu__item-img" src={item.imageUrl as string} alt="" />
                          </div>
                        ) : null}
                        <div className="menu__item-body">
                          <h3 className="menu__item-name">{slots?.itemName?.(item, ctx) ?? item.name}</h3>
                          {item.description || slots?.itemDesc ? (
                            <p className="menu__item-desc">{slots?.itemDesc?.(item, ctx) ?? item.description}</p>
                          ) : null}
                        </div>
                        {slots?.itemPrice ? (
                          slots.itemPrice(item, ctx)
                        ) : pp ? (
                          <div className="menu__item-price">
                            <span className="menu__item-price-value">{pp.value}</span>
                            {pp.currency ? <span className="menu__item-price-currency">{pp.currency}</span> : null}
                          </div>
                        ) : null}
                        {slots?.itemExtra?.(item, ctx)}
                      </li>
                    )
                  })}
                </ul>

                {slots?.afterItems?.(cat, ci)}
              </section>
            )
          })}
          {slots?.afterCategories?.()}
        </main>

        {menu.footerText ? (
          <footer className="menu__footer">
            <p className="menu__footer-text">{menu.footerText}</p>
          </footer>
        ) : null}
      </div>
    </>
  )
}

export default MenuRenderer

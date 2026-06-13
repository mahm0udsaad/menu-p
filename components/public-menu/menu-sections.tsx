/**
 * Category sections + item cards for the public menu (server components —
 * pure markup, all theming via the `--menu-*` CSS variables).
 */

import { formatPrice, type MenuStrings } from "./i18n"
import type { PublicMenuCategory, PublicMenuItem } from "./types"

function ItemCard({
  item,
  currency,
  lang,
  strings,
}: {
  item: PublicMenuItem
  currency: string | null
  lang: string
  strings: MenuStrings
}) {
  const price = formatPrice(item.price, currency, lang)
  const initial = item.name.trim().charAt(0) || "•"
  return (
    <article className="pm-card" data-unavailable={item.is_available ? undefined : "true"}>
      {item.image_url ? (
        <img
          className="pm-card-img"
          src={item.image_url}
          alt={item.name}
          loading="lazy"
          decoding="async"
          width={96}
          height={96}
        />
      ) : (
        <div className="pm-card-mono" aria-hidden="true">
          {initial}
        </div>
      )}
      <div className="pm-card-body">
        <div className="pm-card-top">
          <h3>{item.name}</h3>
          {!item.is_available ? (
            <span className="pm-unavail">{strings.unavailable}</span>
          ) : price ? (
            <span className="pm-price">{price}</span>
          ) : null}
        </div>
        {item.description ? <p className="pm-card-desc">{item.description}</p> : null}
        {(item.is_featured || item.dietary_info.length > 0) && (
          <div className="pm-tags">
            {item.is_featured && (
              <span className="pm-featured">
                <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" aria-hidden="true">
                  <path d="M12 2l2.9 6.26L21.5 9.27l-4.75 4.37L18.2 20 12 16.56 5.8 20l1.45-6.36L2.5 9.27l6.6-1.01L12 2z" />
                </svg>
                {strings.featured}
              </span>
            )}
            {item.dietary_info.slice(0, 3).map((tag) => (
              <span key={tag} className="pm-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export default function MenuSections({
  categories,
  currency,
  lang,
  strings,
}: {
  categories: PublicMenuCategory[]
  currency: string | null
  lang: string
  strings: MenuStrings
}) {
  if (categories.length === 0) {
    return <p className="pm-empty">{strings.emptyMenu}</p>
  }
  return (
    <>
      {categories.map((cat) => (
        <section key={cat.id} id={`pm-cat-${cat.id}`} className="pm-section" aria-label={cat.name}>
          <div className="pm-section-head">
            <h2>{cat.name}</h2>
          </div>
          {cat.description ? <p>{cat.description}</p> : null}
          <div className="pm-items">
            {cat.items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                currency={currency}
                lang={lang}
                strings={strings}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}

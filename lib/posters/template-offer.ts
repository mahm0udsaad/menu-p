/**
 * Offer-mode poster bodies (Phase 4): offer-single (hero product) and
 * offer-multi (2-4 product grid). Pure HTML/CSS string builders — all user
 * text is escaped, prices rendered in Arabic-Indic digits.
 */

import {
  discountBadgeText,
  escapeHtml,
  formatPrice,
  type OfferPayload,
  type OfferProduct,
  type PosterSize,
} from "./poster-utils"

function priceRowHtml(product: OfferProduct, currency: string, className: string): string {
  const hasOld = product.oldPrice != null && product.oldPrice > product.newPrice
  const oldHtml = hasOld
    ? `<span class="price-old">${escapeHtml(formatPrice(product.oldPrice as number, currency))}</span>`
    : ""
  return `<div class="${className}">${oldHtml}<span class="price-new">${escapeHtml(
    formatPrice(product.newPrice, currency)
  )}</span></div>`
}

function badgeHtml(product: OfferProduct): string {
  const text = discountBadgeText(product.oldPrice, product.newPrice)
  return text ? `<div class="discount-badge"><span>${escapeHtml(text)}</span></div>` : ""
}

export function offerSingleBody(payload: OfferPayload, size: PosterSize): string {
  const product = payload.products[0]
  if (!product) return ""
  const headline = payload.headline?.trim() || "عرض خاص"
  const image = product.imageUrl
    ? `<div class="hero-image-ring"><img class="hero-image" src="${escapeHtml(product.imageUrl)}" alt=""></div>`
    : ""
  return `
  <section class="offer-single ${size === "story" ? "story" : "square"}">
    ${badgeHtml(product)}
    <p class="offer-headline">${escapeHtml(headline)}</p>
    ${image}
    <h1 class="product-name">${escapeHtml(product.name)}</h1>
    ${priceRowHtml(product, payload.currency, "price-row")}
  </section>`
}

export function offerMultiBody(payload: OfferPayload, size: PosterSize): string {
  const products = payload.products.slice(0, 4)
  const headline = payload.headline?.trim() || "عروض مميزة"
  const cards = products
    .map((product) => {
      const image = product.imageUrl
        ? `<img class="card-image" src="${escapeHtml(product.imageUrl)}" alt="">`
        : `<div class="card-image card-image-empty">✦</div>`
      return `
      <article class="offer-card">
        ${badgeHtml(product)}
        ${image}
        <h2 class="card-name">${escapeHtml(product.name)}</h2>
        ${priceRowHtml(product, payload.currency, "price-row price-row-sm")}
      </article>`
    })
    .join("")
  return `
  <section class="offer-multi ${size === "story" ? "story" : "square"}">
    <p class="offer-headline">${escapeHtml(headline)}</p>
    <div class="offer-grid cols-${products.length <= 2 ? 1 : 2}">${cards}</div>
  </section>`
}

export const OFFER_CSS = `
  .offer-single, .offer-multi {
    position: relative; display: flex; flex-direction: column; align-items: center;
    justify-content: center; text-align: center; flex: 1; min-height: 0;
    padding: 16px 70px; gap: 22px;
  }
  .offer-headline {
    font-weight: 800; font-size: 44px; color: #fff; margin: 0;
    background: var(--secondary); padding: 8px 40px; border-radius: 999px;
    box-shadow: 0 10px 30px rgba(0,0,0,.35);
  }
  .story .offer-headline { font-size: 60px; padding: 10px 46px; }
  .hero-image-ring {
    width: 400px; height: 400px; border-radius: 50%; padding: 12px; flex-shrink: 0;
    background: linear-gradient(135deg, var(--accent), var(--secondary));
    box-shadow: 0 24px 60px rgba(0,0,0,.45);
  }
  .offer-single.story .hero-image-ring { width: 600px; height: 600px; }
  .hero-image { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
  .product-name {
    font-weight: 900; font-size: 66px; line-height: 1.15; color: #fff; margin: 0;
    text-shadow: 0 4px 18px rgba(0,0,0,.55); max-width: 900px;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }
  .offer-single.story .product-name { font-size: 92px; }
  .price-row { display: flex; align-items: baseline; gap: 28px; direction: rtl; }
  .price-old {
    font-size: 44px; font-weight: 700; color: rgba(255,255,255,.75);
    text-decoration: line-through; text-decoration-color: var(--accent); text-decoration-thickness: 5px;
  }
  .price-new {
    font-size: 76px; font-weight: 900; color: var(--accent);
    text-shadow: 0 4px 16px rgba(0,0,0,.5);
  }
  .story .price-old { font-size: 52px; }
  .story .price-new { font-size: 92px; }
  .discount-badge {
    position: absolute; top: 0; left: 48px; width: 180px; height: 180px; border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, var(--accent), var(--accent-deep));
    display: flex; align-items: center; justify-content: center; transform: rotate(-12deg);
    box-shadow: 0 14px 36px rgba(0,0,0,.45); z-index: 3;
  }
  .discount-badge span { font-size: 40px; font-weight: 900; color: #3b0a16; line-height: 1.2; padding: 0 12px; }
  .offer-grid { display: grid; gap: 30px; width: 100%; max-width: 920px; }
  .offer-grid.cols-1 { grid-template-columns: 1fr; max-width: 620px; }
  .offer-grid.cols-2 { grid-template-columns: 1fr 1fr; }
  .offer-card {
    position: relative; background: rgba(255,255,255,.94); border-radius: 32px;
    padding: 24px 24px 20px; display: flex; flex-direction: column; align-items: center; gap: 12px;
    box-shadow: 0 18px 44px rgba(0,0,0,.4);
  }
  .offer-card .discount-badge { width: 120px; height: 120px; top: -22px; left: -16px; }
  .offer-card .discount-badge span { font-size: 26px; }
  .card-image { width: 100%; max-width: 320px; height: 150px; object-fit: cover; border-radius: 20px; display: block; }
  .offer-multi.story .card-image { height: 260px; }
  .card-image-empty { display:flex; align-items:center; justify-content:center; background: var(--primary-soft); color: var(--primary); font-size: 56px; }
  .card-name {
    font-size: 36px; font-weight: 800; color: #1f1f1f; margin: 0; line-height: 1.2;
    display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
  }
  .price-row-sm { gap: 18px; }
  .price-row-sm .price-old { font-size: 28px; color: #8a8a8a; }
  .price-row-sm .price-new { font-size: 44px; color: var(--secondary); text-shadow: none; }
  .offer-multi.story .card-name { font-size: 42px; }
  .offer-multi.story .price-row-sm .price-new { font-size: 52px; }
`

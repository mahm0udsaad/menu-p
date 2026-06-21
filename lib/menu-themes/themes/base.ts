/**
 * Base theme — the engine's reference implementation of the theme contract.
 * It wires every --menu-* token and honors every data-* layout flag with
 * neutral, unopinionated styling. Designer themes override the look by
 * supplying their own tokens + css; this guarantees the engine renders a
 * correct, usable menu even before any designer theme is installed.
 *
 * Mechanics only (grid/flags/spacing/variable plumbing) — aesthetics belong to
 * designer-authored themes.
 */

import type { ThemeDefinition } from "../types"

export const BASE_CSS = `
.menu {
  direction: rtl;
  background: var(--menu-bg, #ffffff);
  color: var(--menu-ink, #1f2937);
  font-family: var(--menu-font-body, 'Cairo', sans-serif);
  padding: var(--menu-pad, 32px);
  font-size: calc(1rem * var(--menu-scale, 1));
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  box-sizing: border-box;
}
.menu * { box-sizing: border-box; }

/* Header */
.menu__header { text-align: center; margin-bottom: var(--menu-gap-section, 40px); }
.menu__logo { max-height: 96px; width: auto; margin: 0 auto 12px; display: block; object-fit: contain; }
.menu__title {
  font-family: var(--menu-font-display, 'Cairo', sans-serif);
  font-size: var(--menu-fs-title, 40px);
  color: var(--menu-ink, #111827);
  margin: 0;
}
.menu__tagline { color: var(--menu-muted, #6b7280); margin: 6px 0 0; font-size: var(--menu-fs-desc, 15px); }

/* Body + categories */
.menu__body { display: flex; flex-direction: column; gap: var(--menu-gap-section, 40px); }
.menu__category-head { margin-bottom: 16px; }
.menu__category-name {
  font-family: var(--menu-font-display, 'Cairo', sans-serif);
  font-size: var(--menu-fs-category, 26px);
  color: var(--menu-primary, #9f1239);
  margin: 0;
}
.menu__category-desc { color: var(--menu-muted, #6b7280); margin: 4px 0 0; font-size: var(--menu-fs-desc, 14px); }

/* Items grid — honors data-columns */
.menu__items { display: grid; grid-template-columns: 1fr; gap: var(--menu-gap-item, 16px); list-style: none; margin: 0; padding: 0; }
.menu[data-columns="2"] .menu__items { grid-template-columns: 1fr 1fr; }
.menu[data-columns="3"] .menu__items { grid-template-columns: 1fr 1fr 1fr; }

/* Item — row layout (default) */
.menu__item { display: flex; align-items: center; gap: 14px; padding: 10px 0; }
.menu__item-media { flex: 0 0 auto; width: 64px; height: 64px; border-radius: var(--menu-radius, 10px); overflow: hidden; }
.menu__item-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.menu__item-body { flex: 1 1 auto; min-width: 0; }
.menu__item-name { font-size: var(--menu-fs-item, 18px); color: var(--menu-ink, #1f2937); margin: 0; font-weight: 700; }
.menu__item-desc { font-size: var(--menu-fs-desc, 14px); color: var(--menu-muted, #6b7280); margin: 3px 0 0; }
.menu__item-price { flex: 0 0 auto; color: var(--menu-price, #9f1239); font-size: var(--menu-fs-price, 18px); font-weight: 800; white-space: nowrap; }
.menu__item-price-currency { font-size: 0.7em; margin-inline-start: 2px; opacity: 0.8; }

/* Dividers — honors data-dividers */
.menu[data-dividers="on"] .menu__item + .menu__item { border-top: 1px solid var(--menu-divider, #e5e7eb); }

/* Card layout — honors data-item="card" */
.menu[data-item="card"] .menu__item {
  flex-direction: column;
  align-items: stretch;
  text-align: center;
  background: var(--menu-surface, #f9fafb);
  border-radius: var(--menu-radius, 12px);
  padding: 14px;
  gap: 10px;
}
.menu[data-item="card"] .menu__item-media { width: 100%; height: 130px; }
.menu[data-item="card"] .menu__item-price { align-self: center; }
.menu[data-item="card"][data-dividers="on"] .menu__item + .menu__item { border-top: 0; }

/* Images off — honors data-images="off" */
.menu[data-images="off"] .menu__item-media { display: none; }

/* Density */
.menu[data-density="compact"] { --menu-gap-section: 24px; --menu-gap-item: 8px; }
.menu[data-density="compact"] .menu__item { padding: 6px 0; }

/* Footer */
.menu__footer { margin-top: var(--menu-gap-section, 40px); text-align: center; }
.menu__footer-text { color: var(--menu-muted, #6b7280); font-size: var(--menu-fs-desc, 14px); margin: 0; }
`

export const BASE_THEME: ThemeDefinition = {
  id: "base",
  name: "أساسي",
  category: "basic",
  css: BASE_CSS,
  layoutDefaults: { columns: 1, item: "row", images: "on", dividers: "on", density: "comfortable" },
  tokens: {
    color: {
      bg: "#ffffff",
      surface: "#f9fafb",
      ink: "#1f2937",
      muted: "#6b7280",
      primary: "#9f1239",
      accent: "#e11d48",
      price: "#9f1239",
      divider: "#e5e7eb",
    },
    type: {
      fontDisplay: "'Cairo', sans-serif",
      fontBody: "'Cairo', sans-serif",
      scale: 1,
      fsTitle: "40px",
      fsCategory: "26px",
      fsItem: "18px",
      fsDesc: "14px",
      fsPrice: "18px",
    },
    shape: {
      radius: "10px",
      gapSection: "40px",
      gapItem: "16px",
      pad: "32px",
    },
  },
}

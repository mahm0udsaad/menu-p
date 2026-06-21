# Menu Theme Contract (v1)

The centralized menu engine renders **one fixed DOM structure** for every theme. A
theme never ships React or PDF components — it ships only **design tokens** (default
CSS-variable values) and a **CSS stylesheet** that styles the fixed classes below.

This is what makes the editor work uniformly: the engine owns the structure (so
add / edit / drag-drop / column layout behave the same on every theme), and the user's
live edits (colors, fonts, background, layout) are just CSS-variable overrides the
engine writes onto the root. Live preview and the PDF are produced by the **same
renderer**, so they can never drift.

---

## 1. The fixed DOM

The engine always emits exactly this structure (classes are the contract — a theme may
NOT rename or restructure them, only style them and decorate with `::before`/`::after`):

```html
<div class="menu" data-columns="1" data-item="row" data-images="on" data-dividers="on" data-density="comfortable">
  <header class="menu__header">
    <img class="menu__logo" />                <!-- omitted if no logo -->
    <h1 class="menu__title">اسم المطعم</h1>
    <p  class="menu__tagline">وصف قصير</p>     <!-- optional -->
  </header>

  <main class="menu__body">
    <section class="menu__category">
      <header class="menu__category-head">
        <h2 class="menu__category-name">القسم</h2>
        <p  class="menu__category-desc">وصف القسم</p>   <!-- optional -->
      </header>

      <ul class="menu__items">
        <li class="menu__item">
          <div class="menu__item-media">                <!-- present only when data-images="on" AND item has image -->
            <img class="menu__item-img" />
          </div>
          <div class="menu__item-body">
            <h3 class="menu__item-name">اسم الصنف</h3>
            <p  class="menu__item-desc">وصف الصنف</p>     <!-- optional -->
          </div>
          <div class="menu__item-price">
            <span class="menu__item-price-value">٤٥</span>
            <span class="menu__item-price-currency">ج.م</span>
          </div>
        </li>
        <!-- more items -->
      </ul>
    </section>
    <!-- more categories -->
  </main>

  <footer class="menu__footer">
    <p class="menu__footer-text">شكراً لزيارتكم</p>   <!-- optional -->
  </footer>
</div>
```

Notes for the designer:
- The root is `.menu`. **Scope every selector under `.menu`** (e.g. `.menu__title`, `.menu[data-item="card"] .menu__item`). Do not style bare element selectors or `body`.
- Decorations (frames, flourishes, watermarks, section ornaments) are welcome via
  `::before`/`::after` on `.menu`, `.menu__header`, `.menu__category-head`, etc.
- The document is **RTL / Arabic-first**. Design for `direction: rtl`. Keep an LTR-safe
  fallback for prices/numbers (they are rendered with the `.menu__item-price-*` spans).

---

## 2. Layout flags (root `data-*` attributes)

The user toggles these live; **your CSS must honor all of them**:

| Attribute        | Values                          | Meaning |
|------------------|---------------------------------|---------|
| `data-columns`   | `1` \| `2` \| `3`               | How many columns the **items grid** (`.menu__items`) flows into. |
| `data-item`      | `row` \| `card`                 | `row` = name/desc on one side, price on the other. `card` = boxed, image-led. |
| `data-images`    | `on` \| `off`                   | When `off`, `.menu__item-media` is not rendered; layout must look right without it. |
| `data-dividers`  | `on` \| `off`                   | Show/hide separators between items/categories. |
| `data-density`   | `comfortable` \| `compact`      | Spacing scale (compact = tighter for long menus). |

Minimum required rules:
```css
.menu__items { display: grid; gap: var(--menu-gap-item); grid-template-columns: 1fr; }
.menu[data-columns="2"] .menu__items { grid-template-columns: 1fr 1fr; }
.menu[data-columns="3"] .menu__items { grid-template-columns: 1fr 1fr 1fr; }
.menu[data-item="card"] .menu__item { /* boxed treatment */ }
.menu[data-images="off"] .menu__item-media { display: none; }
.menu[data-dividers="off"] .menu__item + .menu__item { border: 0; }
```

---

## 3. Design tokens (CSS variables)

The engine sets these on the `.menu` root (theme defaults, then user overrides on top).
**Read every value through `var(--token, fallback)`** so user edits apply live. Do not
hardcode colors/fonts/sizes that should be user-editable.

### Color
| Variable           | Purpose |
|--------------------|---------|
| `--menu-bg`        | Page background. May be a color, gradient, or `url(...)`. |
| `--menu-surface`   | Item/card surface background. |
| `--menu-ink`       | Primary text (titles, item names). |
| `--menu-muted`     | Secondary text (descriptions, taglines). |
| `--menu-primary`   | Brand color (category headings, accents). |
| `--menu-accent`    | Secondary accent (badges, ornaments). |
| `--menu-price`     | Price color. |
| `--menu-divider`   | Divider / border color. |

### Typography
| Variable             | Purpose |
|----------------------|---------|
| `--menu-font-display`| Headings font-family (title, categories). |
| `--menu-font-body`   | Body font-family (items, descriptions). |
| `--menu-scale`       | Global size multiplier (e.g. `1`). Multiply your `font-size`s by this. |
| `--menu-fs-title`    | Restaurant title size. |
| `--menu-fs-category` | Category heading size. |
| `--menu-fs-item`     | Item name size. |
| `--menu-fs-desc`     | Description size. |
| `--menu-fs-price`    | Price size. |

Available bundled Arabic fonts (already loaded): **Cairo**, **Amiri**. English: Roboto,
Open Sans. Use these family names in `--menu-font-*` defaults.

### Shape & spacing
| Variable             | Purpose |
|----------------------|---------|
| `--menu-radius`      | Corner radius for cards/images. |
| `--menu-gap-section` | Vertical gap between categories. |
| `--menu-gap-item`    | Gap between items. |
| `--menu-pad`         | Inner padding of the menu page. |

---

## 4. What a theme delivers

A theme is registered as:

```ts
{
  id: "borcelle",                 // kebab-case, unique
  name: "بورسيل",                 // Arabic display name
  category: "cafe",               // grouping
  tokens: { /* default values for the CSS variables above */ },
  layoutDefaults: { columns: 1, item: "row", images: "on", dividers: "on", density: "comfortable" },
  css: "/* the stylesheet, scoped under .menu */",
  thumbnail: "url-or-path"        // a small preview image
}
```

The **AI designer produces `tokens`, `layoutDefaults`, and `css`** for the fixed DOM
above. The engineer wires that object into `lib/menu-themes/registry.ts`. Nothing else.

---

## 5. Hard rules (so the engine stays in control)

1. Do **not** change class names or nesting. Style only.
2. Scope **all** selectors under `.menu`. No global/element/`body` selectors, no `@import`,
   no external network fonts (use the bundled families).
3. Read user-editable values through the `--menu-*` variables; honor all `data-*` flags.
4. No JavaScript. No `position: fixed`. The menu must render correctly inside a flowing
   page (screen) and a fixed-size print page (PDF) — avoid viewport units; prefer `em`/`rem`/`%`.
5. Keep it print-safe: real colors via `--menu-*`, and assume `print-color-adjust: exact`.

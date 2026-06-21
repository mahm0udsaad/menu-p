# AI Designer Prompt — Menu Theme

Paste everything below into your AI designer. Fill in the **THEME BRIEF** at the top
(one run = one theme). The designer returns a single theme object (`tokens`,
`layoutDefaults`, `css`) that drops straight into `lib/menu-themes/registry.ts`.

You can run it multiple times with different briefs to build a theme library.

---

## THEME BRIEF (edit this part)

- **id**: `borcelle` (kebab-case, unique)
- **name (Arabic)**: `بورسيل`
- **category**: `cafe`
- **vibe**: e.g. "warm specialty-coffee shop, cream + espresso browns, elegant serif
  headings, soft rounded cards, subtle grain texture, cozy and premium"
- **default layout**: columns = 1, item = row, images = on, dividers = on, density = comfortable

---

## PROMPT (do not edit below)

You are designing a **digital restaurant menu theme**. The app renders ONE fixed HTML
structure for every theme; your job is to supply **design tokens** and a **CSS
stylesheet** that styles that fixed structure into the aesthetic described in the THEME
BRIEF. You do NOT write HTML or JavaScript. The menu is **Arabic-first / RTL**.

### The fixed DOM you are styling (do not change class names or nesting)

```html
<div class="menu" data-columns="1" data-item="row" data-images="on" data-dividers="on" data-density="comfortable">
  <header class="menu__header">
    <img class="menu__logo" />
    <h1 class="menu__title">اسم المطعم</h1>
    <p  class="menu__tagline">وصف قصير</p>
  </header>
  <main class="menu__body">
    <section class="menu__category">
      <header class="menu__category-head">
        <h2 class="menu__category-name">القسم</h2>
        <p  class="menu__category-desc">وصف القسم</p>
      </header>
      <ul class="menu__items">
        <li class="menu__item">
          <div class="menu__item-media"><img class="menu__item-img" /></div>
          <div class="menu__item-body">
            <h3 class="menu__item-name">اسم الصنف</h3>
            <p  class="menu__item-desc">وصف الصنف</p>
          </div>
          <div class="menu__item-price">
            <span class="menu__item-price-value">٤٥</span>
            <span class="menu__item-price-currency">ج.م</span>
          </div>
        </li>
      </ul>
    </section>
  </main>
  <footer class="menu__footer"><p class="menu__footer-text">شكراً لزيارتكم</p></footer>
</div>
```

### CSS variables (tokens) — read every editable value through these

Colors: `--menu-bg` (page bg; color/gradient/url), `--menu-surface` (card bg), `--menu-ink`
(primary text), `--menu-muted` (secondary text), `--menu-primary` (brand/category),
`--menu-accent` (secondary accent/ornaments), `--menu-price`, `--menu-divider`.

Type: `--menu-font-display` (headings), `--menu-font-body`, `--menu-scale` (size
multiplier), `--menu-fs-title`, `--menu-fs-category`, `--menu-fs-item`, `--menu-fs-desc`,
`--menu-fs-price`.

Shape/space: `--menu-radius`, `--menu-gap-section`, `--menu-gap-item`, `--menu-pad`.

Fonts available (no network fonts): Arabic = **Cairo**, **Amiri**; Latin = Roboto, Open Sans.

### Layout flags your CSS MUST honor (root `data-*`)

- `data-columns` = `1|2|3` → number of columns in `.menu__items`.
- `data-item` = `row|card` → list rows vs boxed cards.
- `data-images` = `on|off` → when off, `.menu__item-media` is hidden; must still look right.
- `data-dividers` = `on|off` → separators on/off.
- `data-density` = `comfortable|compact` → spacing scale.

### Hard rules

1. Style ONLY the classes above; never rename or restructure them. Decorate with
   `::before`/`::after` if you like.
2. **Scope every selector under `.menu`** (e.g. `.menu__title`, `.menu[data-item="card"] .menu__item`).
   No `body`/global/element selectors, no `@import`, no external fonts, no JS.
3. Read editable values through `var(--menu-*, fallback)`. Honor ALL `data-*` flags
   (include the required rules for columns / card / images-off / dividers / density).
4. Print-safe: avoid viewport units and `position: fixed`; use `em`/`rem`/`%`. Assume RTL.
5. Make it genuinely beautiful and on-brief — this is a premium product. Pay attention to
   Arabic typography (line-height, letter-spacing off for Arabic), spacing rhythm, and
   the header treatment.

### Output format (return EXACTLY this, ready to paste)

```ts
{
  id: "<id from brief>",
  name: "<arabic name>",
  category: "<category>",
  layoutDefaults: { columns: 1, item: "row", images: "on", dividers: "on", density: "comfortable" },
  tokens: {
    color: { bg: "...", surface: "...", ink: "...", muted: "...", primary: "...", accent: "...", price: "...", divider: "..." },
    type:  { fontDisplay: "...", fontBody: "...", scale: 1, fsTitle: "...", fsCategory: "...", fsItem: "...", fsDesc: "...", fsPrice: "..." },
    shape: { radius: "...", gapSection: "...", gapItem: "...", pad: "..." }
  },
  css: `
    /* full stylesheet, every selector scoped under .menu, honoring all data-* flags */
  `
}
```

Return only that object. The `tokens` are the theme's defaults (the app lets users tweak
them live); the `css` is the look. Make sure the menu looks complete and styled even
using ONLY the tokens' default values.
```

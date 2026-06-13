# Menu-P V2 — Changelog

## Phase 1 — Foundations (2026-06-10)

**Migration:** `supabase/migrations/20260610100000_v2_foundations.sql` — applied to Supabase project `qsjbthmydzcwogjgyarp` as `v2_foundations`.

### Tables added

| Table | Purpose | Notes |
|-------|---------|-------|
| `image_assets` | AI/uploaded image gallery for reuse | `restaurant_id` NULL = shared/stock asset; GIN index on `tags` |
| `menu_import_jobs` | AI menu extraction jobs | status: pending → extracting → verifying → review → imported/failed |
| `posters` | Generated posters/fliers (offer + greeting) | `art_asset_id` → `image_assets` (on delete set null) |
| `social_accounts` | Connected Meta/TikTok accounts | tokens stored encrypted; unique (restaurant_id, platform, account_ref) |
| `social_posts` | Posts of menu/menu-page/poster/QR | FK to `social_accounts` |

All tables: uuid PK, `created_at`/`updated_at` + `set_updated_at` trigger, indexes on FKs, RLS enabled.

### Storage

- New public bucket `menu-images` with public-read + authenticated insert/update/delete policies (same pattern as `restaurant-logos`).

### RLS

- `image_assets`: owner (via `owns_restaurant`) full CRUD; SELECT also allowed when `restaurant_id is null` (shared assets). Shared-asset inserts are service-role only.
- `menu_import_jobs`, `posters`, `social_accounts`, `social_posts`: owner-only for all operations, no public read.

### Test results (via Supabase MCP, all in rolled-back transactions)

| Test | Result |
|------|--------|
| Owner (sub `11111111-…`) inserts one row into each of the 5 tables for restaurant `22222222-…` | PASS |
| Foreign user (sub `99999999-…`) inserts `image_assets` for that restaurant | PASS (blocked, 42501 RLS violation) |
| Shared asset (`restaurant_id` NULL) inserted as postgres, SELECT-visible to authenticated user | PASS |
| Authenticated user inserts shared asset (`restaurant_id` NULL) | PASS (blocked, 42501 RLS violation) |

## Phase 2 — AI Menu Import (2026-06-10)

**Flow:** `/dashboard/import` → upload old menu (PDF/JPG/PNG ≤10MB) to `menu-images/imports/{restaurantId}/…` → `createImportJob` runs multi-pass Gemini extraction → review screen (low-confidence rows amber + ⚠) → `applyImport` writes `menu_categories`/`menu_items`.

### Files added

| File | Purpose |
|------|---------|
| `lib/ai/menu-extraction-utils.ts` | Pure logic: Arabic/Eastern-numeral price parsing (`٤٥`, `45 ج.م`, ranges, decimal comma), name-key normalization (tashkeel/alef folding), pass merging, confidence flagging, summary. No deps — unit-testable in plain node. |
| `lib/ai/menu-extraction.ts` | `extractMenu`, `verifyExtraction`, `extractAndVerifyMenu`. `generateObject` + `@ai-sdk/google`, file passed as bytes (PDF/image native). Model chain: `GEMINI_TEXT_MODEL` → `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-2.0-flash-exp`. Prices extracted as printed text (`price_text`) and parsed in code — more reliable than schema unions on Gemini. Typed `MenuExtractionError` (auth / rate_limit / fetch_failed / file_too_large / empty_extraction / model_error). |
| `lib/actions/menu-import.ts` | Server actions `createImportJob`, `getImportJob`, `applyImport`. Ownership verified via `restaurants.user_id = auth user` on every action; `applyImport` re-validates the edited extraction with zod, sets `display_order` **and** legacy `sort_order` on categories (items have `display_order` only — no `sort_order` column), continues numbering after existing categories, marks job `imported`. |
| `app/dashboard/import/page.tsx` | Server page: auth + restaurant fetch, renders wizard. |
| `components/menu-import/import-client.tsx` | Wizard state machine (upload → processing → review → success), RTL, Arabic `STRINGS` per component. |
| `components/menu-import/upload-step.tsx` | Drag-drop + type/size validation + progress phases (uploading → extracting → verifying). |
| `components/menu-import/review-step.tsx` + `review-item-row.tsx` | Collapsible categories, editable name/description/price rows, amber low-confidence highlight + ⚠ badge, per-item "تم" check, summary header, primary CTA "استيراد إلى القائمة". |
| `components/menu-import/success-step.tsx` | Counts + links to menu editor. |
| `lib/ai/__tests__/menu-extraction.test.mjs` | 27 assertions: price parsing edge cases, pass-disagreement flagging, empty-category dropping, fuzzy cross-pass matching. Run: `node --experimental-strip-types lib/ai/__tests__/menu-extraction.test.mjs`. |

### Integration points (outside phase dirs)

- `components/dashboard-client.tsx`: one quick-action button "استيراد قائمة قديمة (AI)" → `/dashboard/import` (grid widened to `lg:grid-cols-4`). Nothing else touched.

### Multi-pass + confidence rules

- Pass 2 re-reads the document with pass-1 JSON attached and returns the full corrected extraction; merge keys are diacritic/alef-normalized names.
- Flags: `price_mismatch` (passes disagree → confidence ≤ 0.5), `added_in_verification`, `not_verified` (pass-1-only, confidence ×0.6), `price_range`, `missing_price`, `unparseable_price`; anything < 0.8 confidence ⇒ `low_confidence` ⇒ amber in review.
- `menu_import_jobs` gets `raw_extraction`, `verified_extraction` (merged), `confidence_summary`; status pending→extracting→review→imported / failed (+`error`).

### Test results

| Test | Result |
|------|--------|
| `npx tsc --noEmit` on sandbox copy | 349 errors before = 349 after; **0 errors in new files** (one pre-existing dashboard-client error shifted line numbers only) |
| Unit tests (merge/confidence/price) | **27/27 pass** |
| Live Gemini extraction | **BLOCKED in sandbox** — DNS for `generativelanguage.googleapis.com` does not resolve. Needs a live run on Saad's machine (key already in `.env.local`). |

### Notes for Phase 3 (image pipeline)

- Uploaded source menus land in `menu-images/imports/{restaurantId}/` — exclude that prefix from the gallery, or register them in `image_assets` with a dedicated kind if you want them browsable.
- `lib/ai/menu-extraction.ts#modelChain` + `classifyAiError` are reusable patterns for `image-generation.ts` (same env-driven chain idea with `GEMINI_IMAGE_MODEL`).
- Imported items have `image_url = null` — they are the prime candidates for the "generate/recommend image" flow; extraction stores `name_en` in `verified_extraction` JSON (not in `menu_items`), useful for English image-prompt building while jobs are retained.

## Phase 3 — Image Pipeline (2026-06-10)

**Flow:** item editor → "صورة الطبق" control → picker dialog with 3 tabs: **مقترحة** (gallery matches for this exact dish, shown before any generation), **المعرض** (searchable own + shared assets + upload drop-zone), **توليد بالذكاء الاصطناعي** (Gemini image generation with live preview / regenerate / style hint). Every generated/uploaded image becomes a reusable `image_assets` row — same dish is never generated twice unless the owner explicitly regenerates.

### Image-generation API decision (verified against installed SDK)

`ai@4.3.16` exports `experimental_generateImage`, but `@ai-sdk/google@1.2.19` has **no `imageModel()`** (no Imagen support in its `.d.ts`), so that path is unusable. The supported v4 path for Gemini image-output models is **`generateText` + `providerOptions.google.responseModalities = ["TEXT","IMAGE"]`**; images come back in `result.files` as `GeneratedFile` ({base64, uint8Array, mimeType}). Model chain: `GEMINI_IMAGE_MODEL` env → `gemini-3.1-flash-image` → `gemini-2.5-flash-image` → `gemini-2.0-flash-exp`. Aspect ratio is steered via prompt (this API takes no size params).

### Files added

| File | Purpose |
|------|---------|
| `lib/ai/image-asset-utils.ts` | Pure logic (unit-testable): `buildAssetTags` (normalized AR/EN name keys + tokens + kind), `scoreAssetMatch` (1.0 exact dish via `normalizeNameKey` folding from menu-extraction-utils, else token-overlap fraction), `rankAssets` (threshold 0.5 recommend / 0.34 search, ties → usage_count), `fileSlug`. |
| `lib/ai/image-generation.ts` | `generateFoodImage({itemName, itemNameEn?, description?, kind: 'menu_item'\|'poster_art', style?, aspect?})` → bytes + mimeType + prompt + model + suggested tags. Consistent food-photography style tokens, explicit "no text/no people/no watermark" rules, square default; poster_art variant leaves negative space for overlay text. Typed `ImageGenerationError` (auth / rate_limit / no_image / model_error), model chain like Phase 2. |
| `lib/actions/image-assets.ts` | Server actions (ownership via `restaurants.user_id`): `findAssets` (own + `restaurant_id is null` shared, free-text tag search), `recommendForItem` (top 8 ≥0.5 before generating), `generateAndSaveAsset` (generate → upload `menu-images/assets/{restaurantId}/…` → insert row with prompt/model/tags), `uploadAsset` (FormData ≤8MB JPG/PNG/WebP, registered in gallery too), `useAsset` (usage_count bump — tolerated failure on shared rows, which are not owner-updatable under RLS). All errors in Arabic. |
| `components/image-picker/image-picker-dialog.tsx` | RTL dialog, rose palette, 3 tabs, debounced gallery search, selection → `useAsset` → `onSelect(public_url)`. |
| `components/image-picker/asset-grid.tsx` | Grid with skeleton loaders, AI/مرفوعة + مشتركة badges, usage counts, friendly Arabic empty states. |
| `components/image-picker/generate-tab.tsx` | Style-hint input, generate/regenerate, live preview, "استخدام هذه الصورة". |
| `components/image-picker/upload-zone.tsx` | Drag-drop upload inside the gallery tab; auto-selects the uploaded image. |
| `lib/ai/__tests__/image-assets.test.mjs` + `register-ts.mjs` | 17 assertions on Arabic-normalized matching/ranking. Run: `node --experimental-strip-types --import ./lib/ai/__tests__/register-ts.mjs lib/ai/__tests__/image-assets.test.mjs` (the register hook lets node resolve extension-less TS imports). |

### Integration point (single, inside the item editor)

`components/editor/editable-menu-item.tsx`: added `image_url` to its local item type, a "صورة الطبق" control in edit mode (thumbnail + "إضافة/تغيير الصورة" button opening the picker), and `handleImageSelected` → `quickUpdateItem(item.id, 'image_url', url)` + `onUpdate`. Hidden for unsaved temporary items (no DB id yet). Nothing else in the editor touched.

### Test results

| Test | Result |
|------|--------|
| `npx tsc --noEmit` on sandbox copy | 349 errors before = 349 after (re-verified with the editor edit stashed); **0 errors in new files** |
| Unit tests (tags/matching/ranking, Arabic folding) | **17/17 pass** |
| Live Gemini image generation | **BLOCKED in sandbox** — `generativelanguage.googleapis.com` DNS does not resolve; needs a live run on Saad's machine. Verify `gemini-3.1-flash-image` model id then; fallbacks are in the chain. |

### Notes for Phase 4 (poster studio)

- Reuse `generateFoodImage(..., kind: 'poster_art', aspect: 'portrait')` — the poster prompt branch already reserves clean top/bottom space for RTL text overlay and bans baked-in text.
- Save poster art through `generateAndSaveAsset` (kind `poster_art`) so `posters.art_asset_id` can reference the `image_assets` row; gallery search already filters by kind.
- Greeting mode (no products): pass the occasion as `itemName` (e.g. "عيد الفطر") + a style hint; tags will make occasion art reusable across years.

## Phase 4 — Poster Studio (2026-06-10)

**Flow:** `/dashboard/posters` (entry: "استوديو البوسترات" quick action on the dashboard) → wizard: mode (عرض / تهنئة) → offer: 1-4 menu items as chips + per-item old/new price or quick discount % (badge previewed live) | greeting: occasion chips (عيد الفطر، عيد الأضحى، رمضان، الكريسماس، اليوم الوطني، custom) with smart default messages → template + size (1080×1080 / 1080×1920) + optional art style hint → `createPoster` → gallery with download / delete / disabled "نشر على السوشيال" (Phase 5 wires it).

**Core rule honored:** the AI model only paints the background (`kind: 'poster_art'`, reuses Phase 3 `generateAndSaveAsset` so art lands in the shared gallery); ALL text — logo, restaurant name, prices, greeting — is composited via RTL HTML/CSS and screenshotted, so Arabic glyphs are never model-rendered (no garbling).

### Files added

| File | Purpose |
|------|---------|
| `lib/posters/poster-utils.ts` | Pure data-binding: `escapeHtml`, `toArabicDigits` (٤٥٫٥), `formatPrice` + currency labels (ج.م/ر.س/…), `discountPercent`/`discountBadgeText` (خصم ٢٥٪), `sanitizePalette` (hex-only — CSS injection blocked), `hexToRgba`. Payload types (`OfferPayload`/`GreetingPayload`). |
| `lib/posters/occasions.ts` | 5 occasions with Arabic labels, smart default greetings, and English art subjects/directions for reusable prompts. |
| `lib/posters/templates.ts` | Registry (`POSTER_TEMPLATES`, `POSTER_SIZES`) + HTML shell (art layer, palette scrim, brand header/footer) + `renderPosterHtml`. Throws on template/mode mismatch. |
| `lib/posters/template-offer.ts` / `template-greeting.ts` | The 4 layouts: offer-single (hero ring + struck old price + rotated discount badge), offer-multi (2-4 card grid), greeting-centered (Cairo Black), greeting-elegant (Amiri, double golden frame + corner ornaments). Sized to never overflow either canvas (verified by screenshots). |
| `lib/posters/renderer.ts` | `renderPosterPng(html, w, h)` — playwright-core (same engine/flags family as pdf-generator, screenshot mode, per-render launch+close; `POSTER_CHROMIUM_PATH`/`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` env override). Cairo + Amiri TTFs from `public/fonts` inlined as base64 `@font-face` (offline-safe). `renderAndStorePoster` uploads to `menu-images/posters/{rid}/` and flips the row to `ready` (takes a structural `PosterStoreClient` so the module stays importable outside Next). |
| `lib/ai/poster-generation.ts` | `buildPosterArtRequest(mode, subject, style, size)` → `GenerateFoodImageParams` (kind `poster_art`, aspect square/portrait; greeting gets occasion-specific English art direction); `buildPosterArtPrompt` for the final prompt string. |
| `lib/actions/posters.ts` | `createPoster` (validate/normalize Arabic-error-first → insert `generating` → **gallery-first art reuse**: `findAssets(kind 'poster_art')` top score ≥ 0.5 reused + usage bump, else `generateAndSaveAsset` → `renderAndStorePoster` → `ready`; any failure marks the row `failed`), `listPosters`, `deletePoster` (also removes the rendered PNG via `payload.render.storage_path`). Ownership via `restaurants.user_id` on every action. |
| `app/dashboard/posters/page.tsx` | Server page: auth + restaurant (logo/palette/currency) + active categories/items + existing posters. |
| `components/poster-studio/*` | `poster-studio-client` (wizard state), `mode-step`, `offer-step`, `greeting-step`, `style-step`, `poster-gallery` (skeleton while generating, download, placeholder share). All RTL, rose palette, < 300 lines each. |
| `lib/posters/__tests__/posters.test.mjs` | 21 assertions: escaping (incl. malicious art URL attributes), Arabic-Indic digits, discount math edges, palette injection, occasions, exact template sizes, full-document binding. Run: `node --experimental-strip-types --import ./lib/ai/__tests__/register-ts.mjs lib/posters/__tests__/posters.test.mjs`. |

### Integration point (outside phase dirs)

- `components/dashboard-client.tsx`: one quick-action Link "استوديو البوسترات" → `/dashboard/posters` (grid `lg:grid-cols-4` → `lg:grid-cols-5`). Nothing else touched.

### Test results

| Test | Result |
|------|--------|
| `npx tsc --noEmit` on sandbox copy | 349 errors before = 349 after; **0 errors in new files** |
| Unit tests (binding/escaping/digits/discount) | **21/21 pass** |
| Render test (sandbox headless-shell, fixture gradient art) | **PASS** — offer-single + greeting-centered exact 1080×1080 PNGs; offer-multi (4 products) + greeting-elegant story (1080×1920) also smoke-rendered; overflow bugs found by eyeballing screenshots and fixed (hero/card sizes). Outputs: `poster-offer.png`, `poster-greeting.png`, `poster-multi.png`, `poster-elegant-story.png` in session outputs. |
| Live Gemini poster-art generation | **BLOCKED in sandbox** (same DNS block as Phases 2-3) — `createPoster` path needs one live run on Saad's machine; art errors surface as Arabic messages and mark the poster `failed`. |

### Notes for Phase 5 (Social Connect)

- A publishable poster = `posters` row with `status='ready'`: `final_image_url` (public PNG in `menu-images`), `kind` (offer/greeting), `title` (ready-made Arabic caption seed), `payload.data` (products + prices or occasion + message — enough to auto-write a caption), `payload.size` (`square` → feed post, `story` → story format), `payload.render.storage_path` (re-download bytes server-side without re-fetching the public URL).
- The gallery's "نشر على السوشيال" button in `components/poster-studio/poster-gallery.tsx` is the disabled placeholder to wire to the post composer.
- Posters are square 1080×1080 or story 1080×1920 — already Instagram/Facebook/TikTok-native sizes; no resizing needed.

## Phase 6 — Public Menu & Logo Theming (2026-06-10)

**Flow:** scan QR → `/menus/{publishedMenuId}` (URL contract unchanged — existing QR codes keep working) → first visit with multiple language versions shows a centered typographic splash (العربية / English …) → fast mobile-first **HTML** menu (no PDF embed), themed from the restaurant's brand colors. Old iframe-PDF client (`menu-client.tsx`) and the `/select-language` route were deleted; the stored PDF survives as a compact "PDF ⬇" header action.

### Files

| File | Purpose |
|------|---------|
| `lib/theming/palette.ts` | Pure color math: WCAG 2.1 luminance/contrast, `ensureContrast` (pushes toward whichever pole actually reaches the ratio — fixed a bug where mid-gray backgrounds picked white and capped at 4.48:1), `buildThemePalette` (brand → `{primary, secondary, accent, bg, text, onPrimary}` with AA enforced: text/bg ≥ 4.5+, onPrimary/primary ≥ 4.5), dominant-color quantizer (`extractBrandColorsFromPixels` — skips transparency/paper-white, saturation-weighted scoring), `extractPaletteFromLogo` (fetch + pure-TS PNG decode). |
| `lib/theming/png.ts` | Minimal pure-TS PNG decoder (no native deps) for the fast extraction path. |
| `lib/theming/browser-extract.ts` | Any-format fallback: playwright-core (same launch flags as the pdf/poster renderers) renders the logo in a tiny page, samples a 64×64 canvas via `getImageData`, reuses the same quantizer. Honors `POSTER_CHROMIUM_PATH`/`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. |
| `lib/theming/apply-theme.ts` | `applyLogoTheme(restaurantId)` server action: ownership check via `restaurants.user_id` → PNG path then browser path → writes `restaurants.color_palette` (+ returns a derived preview palette). Arabic error messages. |
| `lib/theming/theme.ts` | `resolveMenuTheme`: `color_palette` (source of truth) → logo extraction (only when palette empty) → Menu-P rose default; merges `menu_customizations.font_settings` (Cairo/Almarai/Amiri/Noto Kufi ids → CSS stacks, Almarai root-layout var as fallback) and emits the `--menu-*` CSS custom properties. |
| `components/public-menu/types.ts` | Pure types + `categoriesForLanguage` (translation snapshot merged **by id** over live data: names/descriptions from `menu_translations.translated_data`, prices/availability/images/order always live). |
| `components/public-menu/i18n.ts` | Language labels, RTL set, `resolveLanguage` (?lang > stored preference > source), AR/EN chrome strings, Arabic-Indic price formatting (٤٥ ج.م), `whatsappHref`. |
| `components/public-menu/menu-styles.tsx` | Critical CSS inlined server-side, themed 100% via `--menu-*` vars (no Tailwind on this page, zero client CSS deps). |
| `components/public-menu/category-nav.tsx` | Client pill bar: IntersectionObserver scroll-spy + smooth scroll + auto-centering active pill. |
| `components/public-menu/menu-sections.tsx` | Server sections + item cards: lazy square images with branded monogram fallback, 2-line description clamp, prominent Arabic-digit price pill, ★ featured badge, unavailable = dimmed + dashed "غير متوفر" (items are no longer hidden). |
| `components/public-menu/menu-header.tsx` / `menu-footer.tsx` | Sticky blur header (logo, name, compact PDF + language chip); footer with tel: / wa.me deep links (`dir="ltr"` phone to avoid bidi scrambling) and "صُنع بواسطة Menu-P". |
| `components/public-menu/language-control.tsx` | Chip + splash. First visit & no stored pref → splash; stored pref ≠ current & no explicit `?lang=` → auto-redirect to the preferred version; explicit `?lang=` always wins and refreshes localStorage (`menu-p-lang`). Splash renders through a **portal** (the sticky header's `backdrop-filter` is a containing block that pinned `position:fixed` to the top) and re-applies `pm-root` + `dir` outside the tree. |
| `components/public-menu/public-menu-view.tsx` | Full composition shared by the live page and the dev fixture. |
| `app/menus/[menuId]/_lib/load.ts` | One cached parallel load (menu row → restaurant, sibling `published_menus` family via `parent_menu_id`/`menu_name`, `menu_translations`, categories+items, customizations). Translation-only languages join the picker with `menuId: null` (render via `?lang=` on the same row). |
| `app/menus/[menuId]/page.tsx` | Server page: resolve language → merge translations → `resolveMenuTheme` → render; `generateMetadata` (AR title/description + og:image from logo) shares the cached load. |
| `app/menus/preview-fixture/page.tsx` | Dev-only fixture (`notFound()` in production): 3 Arabic categories / 9 items, with/without images, featured + unavailable states, `?splash=1` forces the language splash. |
| `components/public-menu/__tests__/public-menu.test.mjs` | 10 tests: contrast convergence from hostile pairs, AA across degenerate brands (all-white/neon/all-black/none), palette fallback order, pixel quantizer (transparency/white rejection), language precedence, translation merge, Arabic digits, wa.me. |

### Test results

| Test | Result |
|------|--------|
| `npx tsc --noEmit` (sandbox copy) | 347 errors, all pre-existing (349 baseline minus deleted V1 menu-client/select-language); **0 in new files** |
| Unit tests | **10/10 pass** — caught & fixed a real `ensureContrast` direction bug (#777 bg) |
| Visual (next dev + playwright, 390×844) | `public-menu-mobile.png`, `public-menu-scrolled.png` (scroll-spy active pill, dimmed غير متوفر, footer links), `public-menu-lang.png` (centered splash) in session outputs — iterated 3×: portal fix, header compaction so long restaurant names don't truncate, phone bidi |

### Notes for live QA

- `applyLogoTheme` has no UI entry point yet (boundary: editor untouched) — wire a "استخراج الألوان من الشعار" button in dashboard/profile later; until then palettes saved by onboarding keep working as-is.
- Browser extraction path needs the chromium env var on Vercel (same as posters/pdf).
- Verify a real multi-language family (parent_menu_id) + a translation-only language on Saad's data; localStorage redirect can't trigger in the sandbox.

## Phase 5 — Social Connect (2026-06-10)

**Flow:** dashboard quick action "النشر على السوشيال" → `/dashboard/social` → connect cards (Meta = FB page + linked IG in one OAuth; TikTok standalone) → composer: target (القائمة كاملة / صفحة القائمة / بوستر / كود QR) → auto-suggested Arabic caption (editable, "إعادة اقتراح النص") → account multi-select → publish → per-account ✅/❌ outcomes → post history with status chips. Poster gallery's "نشر على السوشيال" now links to `/dashboard/social?poster={id}` and the composer preselects that poster.

**Core rule honored (V2-VISION #7):** everything goes through one `SocialPublisher` interface; Meta/TikTok are adapters implemented to spec but active **only when their developer-app envs exist** — otherwise (or when `SOCIAL_MOCK=1`) the mock adapter runs the whole loop offline, including the OAuth redirect (it loops straight back to our callback with a real signed state). A caption containing the literal word `FAIL` simulates a platform rejection end-to-end.

### Files added / changed

| File | Purpose |
|------|---------|
| `lib/social/types.ts` | `SocialPublisher` (getAuthUrl / handleCallback / publishPost / refreshToken / disconnect), `PostTarget` (menu \| menu_page \| poster \| qr_code), `TokenSet`, `PublishResult`, `SocialApiError` (typed codes: auth/rate_limit/network/unsupported/config/state/api), public row shapes (token columns excluded). |
| `lib/social/crypto.ts` | AES-256-GCM token sealing `v1.<iv>.<ct>.<tag>` (tamper-proof via GCM tag) + HMAC-SHA256 signed OAuth state (restaurantId+platform+nonce+exp, timing-safe verify). Key: `SOCIAL_TOKEN_KEY` (64 hex chars; base64 accepted). Mock/dev gets a derived fallback with one warning; `requireTokenKey()` **fails loud** on real-credential paths. |
| `lib/social/config.ts` | Credential/env checks (`META_APP_ID/SECRET`, `TIKTOK_CLIENT_KEY/SECRET`, `SOCIAL_MOCK`), Arabic "غير مُفعّل بعد" config errors, callback URL builder (`/api/social/callback/{meta\|tiktok}`). |
| `lib/social/adapters/meta.ts` | Graph API **v21.0**: FB OAuth dialog (pages_show_list, pages_manage_posts, pages_read_engagement, instagram_basic, instagram_content_publish) → short→long-lived user token → `/me/accounts` yields FB pages (non-expiring page tokens) + linked IG accounts. Publish: FB `/photos` (single), unpublished photos + `/feed attached_media` (multi), `/feed` link posts; IG container flow `/media` → status poll → `/media_publish` (+ CAROUSEL). Refresh re-exchanges the stored user token; disconnect = best-effort `DELETE /me/permissions`. Graph error codes mapped (190→auth, 4/17/32/613→rate_limit). |
| `lib/social/adapters/tiktok.ts` | Login Kit OAuth (user.info.basic, video.publish) → `/v2/oauth/token/` (access+refresh+open_id) → `/v2/user/info/` display name. Publish: Content Posting API `/v2/post/publish/content/init/` — `PULL_FROM_URL` photos, `DIRECT_POST`, title from caption first line (90-char cap). Refresh + `/v2/oauth/revoke/`. |
| `lib/social/adapters/mock.ts` | Full offline loop; Meta callback fabricates FB **and** IG accounts; realistic post ids (`{pageId}_{15d}`, `18{15d}`, `p_pub_url~v2.{19d}`); caption `FAIL` ⇒ rejection; link media on non-FB ⇒ Arabic error (mirrors real constraints). |
| `lib/social/captions.ts` | Pure Arabic caption builder for all 4 target kinds (menu: link + "امسحوا الكود"; poster offer: products w/ بدلاً من + خصم ٪; greeting: occasion + message) + kind-specific hashtags; `captionTitle` for TikTok. (Import switched to relative path so node tests load it.) |
| `lib/social/publish-flow.ts` | Pure flow logic fixed to the final interface: `tokenNeedsRefresh` (5-min window), `publishToAccount` (never throws — adapter errors → Arabic messages), `patchForResult` → exact `social_posts` row patch. |
| `lib/social/qr-image.ts` + `types/qrcode.d.ts` | Server-rendered 1080px rose QR PNG (existing `qrcode` dep, minimal local typings) → `menu-images/social/{rid}/qr-{menuId}.png` (deterministic path, upsert ⇒ reuse). |
| `lib/social/index.ts` | `getAdapter(platform\|provider)` factory (mock fallback), `buildCaption` re-export, public surface. |
| `lib/actions/social.ts` | `connectAccount` (returns OAuth URL), `listAccounts` (token columns never selected), `disconnectAccount` (best-effort revoke + status `revoked` + token columns nulled), `prepareMenuQr`, `createPost` (per account: insert `draft` → `posting` → adapter publish → `posted`/`failed`; auto token refresh inside the 5-min window re-encrypts), `listPosts` (joined platform/name). Ownership via `restaurants.user_id` everywhere. |
| `app/api/social/callback/[platform]/route.ts` | OAuth redirect handler: signed-state verify (inside adapter) + logged-in **owner-of-state-restaurant** check, upserts encrypted tokens on `(restaurant_id, platform, account_ref)`, redirects `/dashboard/social?connected=1` (errors → `?error=…`; codes/tokens never logged). |
| `app/dashboard/social/page.tsx` | Server page: restaurant + accounts + posts + published menus + ready posters; reads `?connected/?error/?poster`. |
| `components/social/*` | `social-client` (shell + banners + refresh), `connect-cards` (status badges متصل/منتهي/ملغي, disconnect), `post-composer` (target chips, poster thumbnails, menu select, caption autofill, FB-only hint for link posts), `post-history` (status chips + failure reasons + platform post id). RTL, rose palette, Arabic copy, all < 300 lines. |

### Integration points (outside phase dirs)

- `components/poster-studio/poster-gallery.tsx`: share button enabled for `ready` posters → `/dashboard/social?poster={id}`.
- `components/dashboard-client.tsx`: one quick-action Link "النشر على السوشيال" → `/dashboard/social` (grid `lg:grid-cols-5` → `lg:grid-cols-3`, 6 actions).

### Env vars Saad must obtain (everything mocks cleanly until then)

| Env | Where |
|-----|-------|
| `SOCIAL_TOKEN_KEY` | `openssl rand -hex 32` — required before real credentials go live |
| `META_APP_ID` / `META_APP_SECRET` | developers.facebook.com → Create App (Business) → add **Facebook Login** + **Instagram Graph API** products → Valid OAuth Redirect URI: `{BASE_URL}/api/social/callback/meta` → App Review for `pages_manage_posts`, `instagram_content_publish` |
| `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET` | developers.tiktok.com → Create App → enable **Login Kit** + **Content Posting API** (Direct Post needs audit) → Redirect URI: `{BASE_URL}/api/social/callback/tiktok` + verify the media domain |
| `SOCIAL_MOCK=1` | optional: force mock even with credentials present |

### Test results

| Test | Result |
|------|--------|
| `npx tsc --noEmit` on sandbox copy | 349 baseline → **0 errors in Phase 5 files** (total now 346 — also fixed nothing else, remaining errors pre-date V2) |
| `lib/social/__tests__/social.test.mjs` | **18/18 pass** — AES round-trip (unicode) + 4 tamper cases, hex/base64 key parsing, state sign/verify/expiry/forge, captions ×4 kinds (Arabic + hashtags + discount math), mock OAuth loop (FB+IG from one callback), happy publish id shapes, `FAIL` rejection, refresh window, row patches, never-throws wrapper |
| DB round-trip (Supabase MCP, project `qsjbthmydzcwogjgyarp`) | **PASS** — as authenticated sub `1111…`, inserted `social_accounts` + linked `social_posts` for restaurant `2222…` and selected back (FK ok) inside a rolled-back tx (0 rows left); negative: foreign sub insert **blocked by RLS** |
| Live Meta/TikTok publish | **Pending credentials** — adapters implemented to spec; mock covers the full UX meanwhile |

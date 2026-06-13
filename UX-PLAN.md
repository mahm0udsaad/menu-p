# Menu-P — UX Investigation & Improvement Plan

## Part 1: Investigation findings

### Bug 1 — Logo uploaded in onboarding is silently discarded
`lib/actions.ts → onboardRestaurant()` never calls `formData.get("logo")`. The file is sent by the form and dropped. Everything else already exists:

- `restaurants.logo_url` column ✓ (migration line 58)
- Public `restaurant-logos` storage bucket with RLS policies ✓ (migration lines 441–460)
- Editor reads and renders `logo_url` ✓ (`menu-header.tsx`, `shared/menu-components.tsx`)

**Fix (small):** in `onboardRestaurant`, if a logo file exists: upload to `restaurant-logos/{user.id}/{timestamp}.{ext}`, get the public URL, include `logo_url` in the insert. ~15 lines.

### Bug 2 — PDF/image import exists but is unreachable from onboarding
A complete AI import feature already exists at `/dashboard/import` (`components/menu-import/`, Gemini extraction in `lib/ai/menu-extraction.ts`) — upload → review → success, with confidence scores and Arabic price parsing. But `onboardRestaurant` redirects straight to `/menu-editor`, so a new user lands on an **empty editor** and never learns import exists.

**Fix (small):** after onboarding, route to a "how do you want to add your menu?" choice instead of the editor (see flow below).

### Bug 3 — Empty-state editor is the first thing new users see
The editor shows an empty menu with skeleton boxes, an unlabeled icon-only floating toolbar, and a single "إضافة عنصر إلى مقبلات" button. For a first-time user there is no guidance, no visible connection to the import feature, and the icons (palette, layout, image, layers, text) have no labels or tooltips.

---

## Part 2: Recommended user flow

```
Sign up
  └─ Onboarding wizard (3 steps — done ✓)
       └─ NEW: "أضف قائمتك" choice screen
            ├─ 📄 استيراد من PDF أو صورة  → /dashboard/import → review → editor (pre-filled)
            ├─ ✏️ إدخال يدوي              → editor with guided first-item prompt
            └─ ⏭️ تخطّي الآن              → editor with empty state + import shortcut
```

Principle: never land a new user on an empty canvas. Either pre-fill it (import) or guide the first action.

---

## Part 3: Prioritized plan

### P0 — This week (bugs / broken promises)
1. **Save the onboarding logo** (Bug 1). A form field that does nothing breaks trust.
2. **Add the menu-source choice screen** after onboarding (Bug 2). Biggest activation win: the import feature is the app's strongest differentiator and is currently invisible.
3. **Editor empty state**: replace skeleton boxes with one clear card — "قائمتك فارغة. استوردها من PDF أو أضف أول طبق" with two buttons. Remove the dummy skeletons that look like broken loading.

### P1 — Next (first-session usability)
4. **Label the floating toolbar.** Icon-only toolbars fail discoverability. Add Arabic tooltips at minimum; better: text labels under icons (التصميم، القالب، الخلفية، العناصر، النص).
5. **Logo handoff confirmation.** In the editor header, show the uploaded logo immediately; if none, keep "رفع الشعار" button (already exists — works once Bug 1 is fixed).
6. **Import entry point inside the editor.** Add "استيراد من ملف" to the toolbar or header so the feature stays reachable after onboarding.
7. **Progress feedback after onboarding submit.** Redirect currently happens with no transition; show a brief "جاري تجهيز قائمتك..." state.

### P2 — Soon (polish & retention)
8. **First-run checklist** in dashboard: شعار ✓ / عناصر القائمة / نشر / QR — gives users a path to "published".
9. **Mixed-language consistency.** Screenshot shows "Underground / restaurant" in English inside an Arabic UI — display the localized category name (مطعم) and let restaurant name render as entered.
10. **Top toolbar audit.** "0/1 قائمة" badge is cryptic; rename or tooltip it. Group preview/publish actions on one side.
11. **Mobile pass on the editor** — restaurant owners will edit from phones.
12. **Inline onboarding hints** (one-time coach marks) for the 3 core editor actions instead of relying on exploration.

### P3 — Later
13. AI menu generation from a text description (Gemini already wired in).
14. Templates gallery shown at menu-source choice ("ابدأ من قالب").
15. Analytics on funnel: onboarding → import vs manual → publish, to measure where users drop.

---

## Part 4: Quick wins summary

| # | Change | Effort | Impact |
|---|--------|--------|--------|
| 1 | Upload logo in `onboardRestaurant` | ~15 lines | Fixes broken promise |
| 2 | Menu-source choice screen | 1 small page | Exposes killer feature |
| 3 | Editor empty state | 1 component | Removes dead-end feeling |
| 4 | Toolbar labels/tooltips | CSS + strings | Discoverability |

# Menu-P — Senior Review & Modernization Roadmap

*Reviewed June 2026 · Next.js 15.2.4 / React 19 / Supabase / Paymob · Arabic-first menu SaaS*

## 1. Test results (what was actually verified)

**Database layer — PASSED.** Full menu-creation flow executed against the new Supabase project with RLS enforced: signup trigger mirrors `auth.users → public.users`; restaurant onboarding insert; 2 categories + 3 items; customizations upsert; draft auto-save upsert; publish (primary AR + child EN version); translation upsert; anon webhook payment insert; `update_restaurant_plan` RPC flipped plan to `paid`; anon public-read of the published menu works; 14 templates seeded. Cross-user write was correctly blocked by RLS (negative test).

**Browser smoke test — partial (sandbox can't reach Supabase).** Landing, signup, and login pages render. Findings:

- **Silent failure on signup**: when Supabase is unreachable, the form resets with no visible error. The server action returns a generic Arabic error for *any* failure ("تحقق من البريد الإلكتروني") — misleading when the real cause is network/config.
- **Hydration mismatch errors** on the landing page (repeated `console.error` on every load).
- Full in-browser menu-creation test to be run against the local app (see §6).

## 2. Security — fix before anything else

| # | Issue | Where | Fix |
|---|-------|-------|-----|
| 1 | **Paymob webhook accepts unsigned requests.** Anyone can POST a fake "paid" payload and upgrade a plan. | `app/api/paymob-webhook/route.ts` | Validate Paymob HMAC (SHA-512 of ordered fields with `PAYMOB_SECRET_KEY`) before processing. |
| 2 | **Webhook runs as anon client**, which forced permissive RLS (`payments` insert/update, `restaurants` update open to anon). | same + RLS | Use `SUPABASE_SERVICE_ROLE_KEY` server-side; then drop the permissive anon policies (flagged in the migration). |
| 3 | **Admin routes open to any logged-in user** ("allow any authenticated user" comment in code). | `app/admin/page.tsx` | Add `role` column / `app_metadata` check + middleware guard. |
| 4 | **`/api/test-config` leaks config info** (API key length, model status). | `app/api/test-config/route.ts` | Delete it. |
| 5 | Auth protection is partly client-side (`useEffect` redirects). | `middleware.ts` | Enforce all `/dashboard`, `/admin`, `/menu-editor` in middleware. |
| 6 | Build ships with `typescript.ignoreBuildErrors` + `eslint.ignoreDuringBuilds`. | `next.config.mjs` | Turn off, fix errors incrementally (this hides real bugs today). |

## 3. Tech modernization (legacy → current)

**Replace, in order of impact:**

1. **`@supabase/auth-helpers-nextjs` → `@supabase/ssr`.** The auth-helpers package is deprecated; `@supabase/ssr` is the supported pattern for Next 15 (one `createClient` per server/browser context, middleware token refresh). Mechanical migration, touches ~every data file.
2. **PDF pipeline: 3 parallel systems → 1.** Today: Playwright+`@sparticuz/chromium` (server), `@react-pdf/renderer` (client bundle!), `jspdf` + `pdfjs-dist` preview with a hand-copied worker script (`scripts/copy-pdf-worker.js`). Recommendation: keep **server-side Playwright rendering as the single source of truth** (same HTML templates as the live preview), drop `@react-pdf/renderer` and `jspdf` from the client, and preview the generated PDF via a plain `<iframe>`/object tag. Kills ~5MB of client JS and the prebuild hack. Note: `@sparticuz/chromium` is x86-64-only — pin your deploy target accordingly or use a remote browser service (Browserless) for portability.
3. **Template system: 3 registries + 17 PDF templates + 6 preview components → 1 registry.** One template definition (design tokens + layout config) consumed by both the live preview and the PDF renderer. This is the single biggest maintainability win; currently adding a template means editing 4+ places.
4. **State: 936-line context → Zustand (or split contexts) + TanStack Query** for server cache (menus, items). The single context causes editor-wide re-renders on every keystroke.
5. **Versions hygiene:** several deps pinned to `latest` (`@supabase/*`, radix packages, `jspdf`, `qrcode`) — pin exact versions; `latest` makes builds non-reproducible.
6. **i18n: hardcoded Arabic strings → `next-intl`.** The app already serves an EN audience (menu translations exist); the UI itself can't follow without extraction.
7. **CSS build hack:** `build:css` compiles Tailwind into a committed `app/globals.css`. Use the standard PostCSS pipeline (already configured) and delete the script.
8. **Enable `next/image` optimization** (`images.unoptimized: true` today) and convert the 30 raw `<img>` tags.

**Worth considering, not urgent:** Tailwind 4 upgrade, dnd-kit already present (drop `react-beautiful-dnd`, it's unmaintained and React-19-incompatible), structured logging (pino) to replace 86 `console.*` calls.

## 4. UI/UX enhancement plan

**Observed (landing/auth):**

- Heavy marketing-speak badges ("تشفير عسكري المستوى", "ضمان 99.9%") on *auth pages* — noise where users just want to sign in. Replace with a single trust line.
- "PREMIUM EDITION" label on the logo is meaningless to a new user.
- Signup failure shows nothing actionable (see §1) — every form needs inline field errors + a toast for server errors, with distinct messages (email taken / weak password / network).
- Hydration errors flash unstyled content risk on landing.

**Flow-level priorities:**

1. **Onboarding to first menu < 3 minutes.** Merge signup → restaurant info → template pick → "add your first 3 items" into one guided stepper with progress. Defer logo/colors to later ("you can change this anytime").
2. **Editor**: autosave indicator ("آخر حفظ منذ…"), undo/redo, mobile-usable item editing (the 1,400-line preview component suggests desktop-only thinking), and live preview that matches the PDF 1:1 (one template system makes this true by construction).
3. **Publish flow**: show QR + link + PDF in one success screen with copy/share/WhatsApp buttons (restaurant owners share via WhatsApp, not download managers).
4. **Empty/error states** everywhere data loads (dashboard with no menus, translation failures, PDF generation timeout with retry).
5. **Accessibility**: only 29 aria attributes in the codebase; add labels to all editor controls, keyboard navigation in the item list, and check color contrast of the red palette on white (several light-pink-on-white elements on the landing page look borderline).
6. **Public menu page is the product** restaurant customers see — make it a fast, mobile-first HTML page (not a PDF embed) with the PDF as a secondary download. This is also an SEO win per restaurant.

## 5. Feature roadmap

**Quick wins (days):**
- WhatsApp share button + downloadable QR in print sizes (table tent, sticker)
- Menu item availability toggle from a phone ("86 an item" during service)
- Duplicate menu / duplicate item
- Basic QR scan analytics (count scans per menu per day — one table + one insert on the public route)

**Medium (weeks):**
- Multi-branch support (one restaurant → several locations/menus)
- Scheduled menus (breakfast/dinner switching by time)
- Ordering-lite: "call waiter" / itemized wishlist sent via WhatsApp (no payments → no complexity)
- Team members (invite staff with editor-only role — pairs with the RBAC work in §2)
- Template marketplace groundwork: the unified template registry (§3.3) makes community/paid templates feasible

**Paid-tier ideas (the dev-plan README mentions making template switching paid):**
- Free: 1 menu, 2 templates, watermarked QR card
- Paid: all templates, translations, analytics, multi-branch, custom domain for the public menu page

## 6. Verification & CI (currently zero tests)

- `tests/` is empty and there is no CI. Start with **3 Playwright E2E specs**: signup→onboarding→publish, edit→autosave→reload, public menu render. The `e2e-driver.mjs` added during this review is a starting skeleton.
- GitHub Actions: typecheck + lint + E2E on PR (matching the now-fixed `ignoreBuildErrors`).
- Keep `supabase/migrations/` as the single source of schema truth going forward (first migration committed during this review).

## 7. Suggested sequence

1. **Week 1 — Security**: webhook HMAC + service-role, admin RBAC, delete test-config, middleware guards.
2. **Week 2 — Foundations**: `@supabase/ssr` migration, un-ignore TS/ESLint, pin versions, CI with first E2E test.
3. **Weeks 3–4 — Template/PDF consolidation** (the big one): single registry, server-only PDF, drop client PDF deps.
4. **Week 5 — Editor UX**: state split, autosave indicator, mobile editing, error/empty states.
5. **Week 6+ — Features**: shares/QR analytics/availability toggle, then multi-branch + paid tiers.

# Menu-P V2 — Vision & Agent Workflow

*Tech lead: Claude (orchestrator). Implementation: phased AI agents. Owner: Saad.*

## The problem we solve

Restaurant owners depend on designers for every menu change: a price update means a meeting, a Canva session, a re-export. Menu-P V2 makes the menu a living product the owner edits in seconds: **scan QR → pick language → browse a beautiful mobile menu** — and the owner side is just as effortless: import your old menu with AI, theme it from your logo, generate item images and marketing posters, post to social — all without a designer.

Arabic-first, MENA region. RTL is the default, not an afterthought.

## Architecture decisions (binding for all agents)

1. **AI layer** lives in `lib/ai/` behind typed interfaces. Models configurable via env: `GEMINI_TEXT_MODEL` (default `gemini-2.5-flash` or current), `GEMINI_IMAGE_MODEL` (default `gemini-3.1-flash-image`). Use `@ai-sdk/google` (already a dep). Verify current model names against Google docs before coding.
2. **Generated images are assets, not throwaways.** Every AI image (item photo, poster art) is stored in the `menu-images` bucket and registered in `image_assets` with tags. Before generating, check the gallery — recommend existing assets for matching items ("قهوة تركي" → existing Turkish-coffee photo). Generate only on miss or explicit request.
3. **Extraction is never trusted blind.** AI menu import = multi-pass (extract → self-verify → confidence per item) + mandatory review screen with low-confidence highlights. Target: zero-error after a 30-second review.
4. **One template registry** (per the modernization roadmap §3.3). New UI work must not add a 4th template system.
5. **Server actions** for mutations, RLS-safe queries; no new permissive anon policies. New tables get owner-based RLS from day one.
6. **No new heavy client deps.** Image work is server-side; client gets URLs.
7. **Social posting** goes through one `SocialPublisher` interface (`lib/social/`); Meta and TikTok are adapters. OAuth tokens encrypted at rest (`social_accounts`), per-platform scopes documented. Build + test with a mock adapter until developer-app credentials exist.
8. **Code style:** TypeScript strict, no `any` on public interfaces, Arabic UI strings co-located for future next-intl extraction, files < 300 lines preferred.

## Phases & agents

| Phase | Agent | Deliverable | Tests |
|-------|-------|-------------|-------|
| 1 | Foundations | DB migration: `image_assets`, `menu_import_jobs`, `posters`, `social_accounts`, `social_posts` + buckets + RLS; applied to Supabase + committed to `supabase/migrations/` | SQL round-trip + RLS positive/negative via MCP |
| 2 | Menu Import | `lib/ai/menu-extraction.ts`, upload UI (PDF/image), review screen, "import to menu" action | Unit tests on parser + live extraction on a sample menu |
| 3 | Image Pipeline | `lib/ai/image-generation.ts`, gallery + recommendations, editor image picker (gallery/generate/upload) | Generation round-trip, gallery reuse hit |
| 4 | Poster Studio | Poster/flier generator: offer mode (1+ products from menu data) & greeting mode (Eid/Christmas/National Day, no products); AI art + brand overlay; RTL text layouts | Visual outputs for both modes |
| 5 | Social Connect | OAuth flows (Meta, TikTok), `SocialPublisher`, post menu/menu-page/poster/QR, post composer UI | Mock-adapter E2E; live once credentials exist |
| 6 | Public Menu & Theming | New mobile-first public menu (QR → language → menu), logo-palette extraction for auto-theming, perf budget < 1s LCP on 3G | Lighthouse + browser E2E |
| QA | Orchestrator (live browser) | Verify connectivity, QR editor, each phase on Saad's running app | Chrome E2E each phase |

Phases 2–4 run sequentially (they share `lib/ai/` and editor surfaces). 5 and 6 can overlap with later phases.

## Phase contracts (file boundaries)

- Phase 1: `supabase/migrations/*` only.
- Phase 2: `lib/ai/menu-extraction.ts`, `lib/actions/menu-import.ts`, `app/api/menu-import/*`, `components/menu-import/*`, `app/dashboard/import/*`. May add a dashboard nav link.
- Phase 3: `lib/ai/image-generation.ts`, `lib/actions/image-assets.ts`, `components/image-picker/*`; one integration point inside the item editor.
- Phase 4: `lib/ai/poster-generation.ts`, `lib/actions/posters.ts`, `app/dashboard/posters/*`, `components/poster-studio/*`.
- Phase 5: `lib/social/*`, `app/api/social/*`, `app/dashboard/social/*`, `components/social/*`.
- Phase 6: `app/menus/*` (public), `lib/theming/*`.

## Definition of done (every agent)

1. Code compiles (`npx tsc --noEmit` on the sandbox copy) — no new TS errors.
2. Self-tested: unit tests where logic exists; SQL verified via Supabase MCP; AI calls tested live when network allows, otherwise with recorded fixtures.
3. Wrote a short CHANGES section into `docs/V2-CHANGELOG.md` (append).
4. No edits outside the phase's file boundary (shared files: ask orchestrator).

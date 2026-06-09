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

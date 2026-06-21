-- ============================================================================
-- Centralized menu theme engine — per-restaurant theme selection + overrides.
-- Stores { themeId, colors?, type?, shape?, layout? } (see lib/menu-themes).
-- Nullable; the engine falls back to the base theme when null.
-- ============================================================================

alter table public.restaurants
  add column if not exists menu_theme jsonb;

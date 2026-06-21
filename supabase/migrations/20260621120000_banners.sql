-- ============================================================================
-- Banner Studio — editable cashier-top banners (free-form canvas)
-- A banner is a JSON document (size, background, positioned elements) rendered
-- to PNG / PDF / social image via the same Playwright pipeline as posters.
-- Storage reuses the existing public `menu-images` bucket (banners/{rid}/...).
-- RLS: owner-only via owns_restaurant() (same helper as posters/image_assets).
-- ============================================================================

create table public.banners (
  id              uuid primary key default gen_random_uuid(),
  restaurant_id   uuid not null references public.restaurants(id) on delete cascade,
  title           text,
  -- full canvas document: { version, size, background, elements[] }
  doc             jsonb not null default '{}',
  -- last rendered outputs keyed by target (png / pdf / social)
  exports         jsonb not null default '{}',
  final_image_url text,
  status          text not null default 'draft'
                    check (status in ('draft','generating','ready','failed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index banners_restaurant_id_idx on public.banners(restaurant_id);
create trigger banners_updated_at before update on public.banners
  for each row execute function public.set_updated_at();

alter table public.banners enable row level security;

create policy "banners_owner_all" on public.banners
  for all using (public.owns_restaurant(restaurant_id))
  with check (public.owns_restaurant(restaurant_id));

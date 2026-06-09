-- ============================================================================
-- Menu-P V2 Foundations (Phase 1)
-- Tables: image_assets, menu_import_jobs, posters, social_accounts, social_posts
-- Storage: menu-images bucket
-- RLS: owner via owns_restaurant(); image_assets readable when shared (NULL rid)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- image_assets : AI-generated / uploaded image gallery for reuse
-- restaurant_id NULL = shared/stock asset usable by all restaurants
-- ----------------------------------------------------------------------------
create table public.image_assets (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  kind          text not null check (kind in ('menu_item','poster_art','logo','decor')),
  source        text not null check (source in ('ai','upload')),
  storage_path  text not null,
  public_url    text not null,
  prompt        text,
  model         text,
  tags          text[] not null default '{}',
  language      text not null default 'ar',
  width         integer,
  height        integer,
  usage_count   integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index image_assets_restaurant_id_idx on public.image_assets(restaurant_id);
create index image_assets_tags_idx on public.image_assets using gin(tags);
create trigger image_assets_updated_at before update on public.image_assets
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- menu_import_jobs : AI menu extraction jobs (multi-pass + review)
-- ----------------------------------------------------------------------------
create table public.menu_import_jobs (
  id                  uuid primary key default gen_random_uuid(),
  restaurant_id       uuid not null references public.restaurants(id) on delete cascade,
  source_file_url     text not null,
  source_type         text not null check (source_type in ('pdf','image')),
  status              text not null default 'pending'
                        check (status in ('pending','extracting','verifying','review','imported','failed')),
  raw_extraction      jsonb,
  verified_extraction jsonb,
  confidence_summary  jsonb,
  error               text,
  imported_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index menu_import_jobs_restaurant_id_idx on public.menu_import_jobs(restaurant_id);
create trigger menu_import_jobs_updated_at before update on public.menu_import_jobs
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- posters : generated marketing posters / fliers
-- payload (offer): product ids/prices/discount; (greeting): occasion, message
-- ----------------------------------------------------------------------------
create table public.posters (
  id              uuid primary key default gen_random_uuid(),
  restaurant_id   uuid not null references public.restaurants(id) on delete cascade,
  kind            text not null check (kind in ('offer','greeting')),
  title           text,
  payload         jsonb not null default '{}',
  art_asset_id    uuid references public.image_assets(id) on delete set null,
  final_image_url text,
  status          text not null default 'draft'
                    check (status in ('draft','generating','ready','failed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index posters_restaurant_id_idx on public.posters(restaurant_id);
create index posters_art_asset_id_idx on public.posters(art_asset_id);
create trigger posters_updated_at before update on public.posters
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- social_accounts : connected social platform accounts (tokens encrypted at rest)
-- ----------------------------------------------------------------------------
create table public.social_accounts (
  id                      uuid primary key default gen_random_uuid(),
  restaurant_id           uuid not null references public.restaurants(id) on delete cascade,
  platform                text not null check (platform in ('meta_facebook','meta_instagram','tiktok')),
  account_name            text,
  account_ref             text,
  access_token_encrypted  text,
  refresh_token_encrypted text,
  token_expires_at        timestamptz,
  scopes                  text[],
  status                  text not null default 'connected'
                            check (status in ('connected','expired','revoked')),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  unique (restaurant_id, platform, account_ref)
);
create index social_accounts_restaurant_id_idx on public.social_accounts(restaurant_id);
create trigger social_accounts_updated_at before update on public.social_accounts
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- social_posts : posts (menu / menu page / poster / QR) to connected accounts
-- ----------------------------------------------------------------------------
create table public.social_posts (
  id                uuid primary key default gen_random_uuid(),
  restaurant_id     uuid not null references public.restaurants(id) on delete cascade,
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  target_kind       text not null check (target_kind in ('menu','menu_page','poster','qr_code')),
  target_ref        text,
  caption           text,
  media_urls        text[] not null default '{}',
  status            text not null default 'draft'
                      check (status in ('draft','scheduled','posting','posted','failed')),
  scheduled_at      timestamptz,
  posted_at         timestamptz,
  platform_post_id  text,
  error             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index social_posts_restaurant_id_idx on public.social_posts(restaurant_id);
create index social_posts_social_account_id_idx on public.social_posts(social_account_id);
create trigger social_posts_updated_at before update on public.social_posts
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.image_assets     enable row level security;
alter table public.menu_import_jobs enable row level security;
alter table public.posters          enable row level security;
alter table public.social_accounts  enable row level security;
alter table public.social_posts     enable row level security;

-- image_assets: owner full control; shared assets (restaurant_id is null)
-- readable by everyone but writable only via service role
create policy "image_assets_owner_or_shared_read" on public.image_assets
  for select using (restaurant_id is null or public.owns_restaurant(restaurant_id));
create policy "image_assets_owner_insert" on public.image_assets
  for insert with check (public.owns_restaurant(restaurant_id));
create policy "image_assets_owner_update" on public.image_assets
  for update using (public.owns_restaurant(restaurant_id))
  with check (public.owns_restaurant(restaurant_id));
create policy "image_assets_owner_delete" on public.image_assets
  for delete using (public.owns_restaurant(restaurant_id));

-- menu_import_jobs: owner only
create policy "menu_import_jobs_owner_all" on public.menu_import_jobs
  for all using (public.owns_restaurant(restaurant_id))
  with check (public.owns_restaurant(restaurant_id));

-- posters: owner only
create policy "posters_owner_all" on public.posters
  for all using (public.owns_restaurant(restaurant_id))
  with check (public.owns_restaurant(restaurant_id));

-- social_accounts: owner only (tokens — no public read)
create policy "social_accounts_owner_all" on public.social_accounts
  for all using (public.owns_restaurant(restaurant_id))
  with check (public.owns_restaurant(restaurant_id));

-- social_posts: owner only
create policy "social_posts_owner_all" on public.social_posts
  for all using (public.owns_restaurant(restaurant_id))
  with check (public.owns_restaurant(restaurant_id));

-- ============================================================================
-- Storage: menu-images bucket (AI-generated and uploaded images)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

create policy "menu_images_public_read" on storage.objects
  for select using (bucket_id = 'menu-images');
create policy "menu_images_auth_insert" on storage.objects
  for insert with check (bucket_id = 'menu-images' and auth.role() = 'authenticated');
create policy "menu_images_auth_update" on storage.objects
  for update using (bucket_id = 'menu-images' and auth.role() = 'authenticated');
create policy "menu_images_auth_delete" on storage.objects
  for delete using (bucket_id = 'menu-images' and auth.role() = 'authenticated');

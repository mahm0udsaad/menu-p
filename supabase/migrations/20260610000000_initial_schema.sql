-- ============================================================================
-- menu-p.com : Full database schema reconstructed from application code
-- Target: Supabase (PostgreSQL 15+). Run as a single migration.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Helper: updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- public.users : mirror of auth.users
-- Needed because lib/actions/payment.ts embeds restaurants -> users(email)
-- via PostgREST, which requires a FK chain inside the public schema.
-- ----------------------------------------------------------------------------
create table public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- restaurants
-- ----------------------------------------------------------------------------
create table public.restaurants (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  name                text not null,
  category            text not null check (category in ('cafe','restaurant','both')),
  currency            text default 'EGP',
  address             text,
  phone               text,
  email               text,
  website             text,
  logo_url            text,
  color_palette       jsonb,            -- { id, name, primary, secondary, accent }
  template_name       text,             -- selected template id (e.g. 'classic', 'cafe')
  page_background_url text,
  plan_type           text not null default 'free',
  max_menus           integer not null default 1,
  available_menus     integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index restaurants_user_id_idx on public.restaurants(user_id);
create trigger restaurants_updated_at before update on public.restaurants
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- menu_categories
-- ----------------------------------------------------------------------------
create table public.menu_categories (
  id                   uuid primary key default gen_random_uuid(),
  restaurant_id        uuid not null references public.restaurants(id) on delete cascade,
  name                 text not null,
  description          text,
  background_image_url text,
  display_order        integer not null default 0,
  sort_order           integer not null default 0,  -- legacy field, still written by onboarding/import code
  is_active            boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index menu_categories_restaurant_id_idx on public.menu_categories(restaurant_id);
create trigger menu_categories_updated_at before update on public.menu_categories
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- menu_items
-- ----------------------------------------------------------------------------
create table public.menu_items (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id   uuid not null references public.menu_categories(id) on delete cascade,
  name          text not null,
  description   text,
  price         numeric(10,2),
  image_url     text,
  is_available  boolean not null default true,
  is_featured   boolean not null default false,
  dietary_info  text[] not null default '{}',
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index menu_items_restaurant_id_idx on public.menu_items(restaurant_id);
create index menu_items_category_id_idx on public.menu_items(category_id);
create trigger menu_items_updated_at before update on public.menu_items
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- published_menus (PDF versions, multi-language via parent_menu_id)
-- ----------------------------------------------------------------------------
create table public.published_menus (
  id                 uuid primary key default gen_random_uuid(),
  restaurant_id      uuid not null references public.restaurants(id) on delete cascade,
  menu_name          text not null,
  pdf_url            text not null,
  language_code      text not null default 'ar',
  version_name       text,
  parent_menu_id     uuid references public.published_menus(id) on delete cascade,
  is_primary_version boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index published_menus_restaurant_id_idx on public.published_menus(restaurant_id);
create index published_menus_parent_idx on public.published_menus(parent_menu_id);
create trigger published_menus_updated_at before update on public.published_menus
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- published_qr_cards
-- ----------------------------------------------------------------------------
create table public.published_qr_cards (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  card_name     text not null default 'QR Card',
  pdf_url       text not null,
  qr_code_url   text,
  custom_text   text,
  card_options  jsonb not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index published_qr_cards_restaurant_id_idx on public.published_qr_cards(restaurant_id);
create trigger published_qr_cards_updated_at before update on public.published_qr_cards
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- payments (Paymob)
-- ----------------------------------------------------------------------------
create table public.payments (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.users(id) on delete cascade,
  restaurant_id          uuid not null references public.restaurants(id) on delete cascade,
  order_id               text not null,          -- Paymob order id (queried as number and string)
  amount                 numeric(12,2) not null default 0,  -- amount in cents from Paymob
  status                 text not null default 'pending',   -- 'pending' | 'paid' | 'success' | 'failed'
  paymob_transaction_id  text,
  integration_id         text,
  payment_token          text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index payments_user_id_idx on public.payments(user_id);
create index payments_restaurant_id_idx on public.payments(restaurant_id);
create index payments_order_id_idx on public.payments(order_id);
create trigger payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- menu_translations (AI-translated menu snapshots, upsert on restaurant+lang)
-- ----------------------------------------------------------------------------
create table public.menu_translations (
  id                   uuid primary key default gen_random_uuid(),
  restaurant_id        uuid not null references public.restaurants(id) on delete cascade,
  language_code        text not null,
  source_language_code text not null default 'ar',
  translated_data      jsonb not null,          -- { categories: [...] }
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (restaurant_id, language_code)         -- required by upsert onConflict
);
create trigger menu_translations_updated_at before update on public.menu_translations
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- menu_customizations (one row per restaurant)
-- ----------------------------------------------------------------------------
create table public.menu_customizations (
  id                       uuid primary key default gen_random_uuid(),
  restaurant_id            uuid not null unique references public.restaurants(id) on delete cascade,
  page_background_settings jsonb not null default '{"backgroundColor":"#ffffff","backgroundImage":null,"backgroundType":"solid","gradientFrom":"#ffffff","gradientTo":"#f3f4f6","gradientDirection":"to-b"}',
  font_settings            jsonb not null default '{"arabic":{"font":"cairo","weight":"normal"},"english":{"font":"roboto","weight":"normal"}}',
  row_styles               jsonb not null default '{"backgroundColor":"transparent","backgroundImage":null,"backgroundType":"solid","itemColor":"#1f2937","descriptionColor":"#6b7280","priceColor":"#dc2626","textShadow":false}',
  footer_settings          jsonb not null default '{"borderTop":{"enabled":false,"color":"","width":0},"borderBottom":{"enabled":false,"color":"","width":0},"borderLeft":{"enabled":false,"color":"","width":0},"borderRight":{"enabled":false,"color":"","width":0}}',
  element_styles           jsonb not null default '{}',
  theme_settings           jsonb not null default '{}',
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
create trigger menu_customizations_updated_at before update on public.menu_customizations
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- templates (menu design templates shown in template selector)
-- ----------------------------------------------------------------------------
create table public.templates (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  description       text,
  category          text not null check (category in ('cafe','restaurant','both')),
  layout_config     jsonb not null default '{}',
  preview_image_url text,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create trigger templates_updated_at before update on public.templates
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- menu_pdfs (generated PDF cache; menu_id is actually the restaurant id
-- in app/api/menu-pdf/generate/route.ts)
-- ----------------------------------------------------------------------------
create table public.menu_pdfs (
  id             uuid primary key default gen_random_uuid(),
  menu_id        uuid not null references public.restaurants(id) on delete cascade,
  template_id    text not null,                  -- normalized template id, e.g. 'classic'
  pdf_url        text not null,
  file_name      text not null,
  file_size      bigint,
  language       text not null default 'ar',
  customizations jsonb not null default '{}',
  created_at     timestamptz not null default now()
);
create index menu_pdfs_menu_id_idx on public.menu_pdfs(menu_id);

-- ----------------------------------------------------------------------------
-- menu_drafts (auto-save in menu-page-editor)
-- ----------------------------------------------------------------------------
create table public.menu_drafts (
  id            uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  template_id   text not null,
  page_number   integer not null default 1,
  draft_data    jsonb not null default '{}',
  last_saved_at timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (restaurant_id, template_id, page_number)
);
create trigger menu_drafts_updated_at before update on public.menu_drafts
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RPC functions
-- ============================================================================

-- Called via supabase.rpc('gen_random_uuid') in lib/actions/pdf-actions.ts.
-- PostgREST only exposes functions in the public schema, so wrap the builtin.
create or replace function public.gen_random_uuid()
returns uuid language sql volatile as $$
  select pg_catalog.gen_random_uuid();
$$;

-- Called via supabase.rpc('update_restaurant_plan', { restaurant_uuid })
-- Syncs plan_type / max_menus from the payments table.
-- Assumption: any paid payment => 'paid' plan with one extra menu per payment.
create or replace function public.update_restaurant_plan(restaurant_uuid uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  paid_count integer;
begin
  select count(*) into paid_count
  from public.payments
  where restaurant_id = restaurant_uuid
    and status in ('paid', 'success');

  if paid_count > 0 then
    update public.restaurants
    set plan_type = 'paid',
        max_menus = greatest(paid_count, 1),
        available_menus = greatest(available_menus, 1),
        updated_at = now()
    where id = restaurant_uuid;
  else
    update public.restaurants
    set plan_type = 'free',
        max_menus = 1,
        updated_at = now()
    where id = restaurant_uuid;
  end if;
end;
$$;

grant execute on function public.gen_random_uuid() to anon, authenticated;
grant execute on function public.update_restaurant_plan(uuid) to anon, authenticated;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.users               enable row level security;
alter table public.restaurants         enable row level security;
alter table public.menu_categories     enable row level security;
alter table public.menu_items          enable row level security;
alter table public.published_menus     enable row level security;
alter table public.published_qr_cards  enable row level security;
alter table public.payments            enable row level security;
alter table public.menu_translations   enable row level security;
alter table public.menu_customizations enable row level security;
alter table public.templates           enable row level security;
alter table public.menu_pdfs           enable row level security;
alter table public.menu_drafts         enable row level security;

-- users: each user sees own row
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

-- restaurants: public read (public menu pages resolve restaurant info),
-- owner full control
create policy "restaurants_public_read" on public.restaurants
  for select using (true);
create policy "restaurants_owner_insert" on public.restaurants
  for insert with check (auth.uid() = user_id);
create policy "restaurants_owner_update" on public.restaurants
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "restaurants_owner_delete" on public.restaurants
  for delete using (auth.uid() = user_id);

-- helper: ownership check via restaurant
create or replace function public.owns_restaurant(rid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.restaurants r
    where r.id = rid and r.user_id = auth.uid()
  );
$$;
grant execute on function public.owns_restaurant(uuid) to anon, authenticated;

-- menu_categories / menu_items: public read (published menus render them),
-- owner write
create policy "menu_categories_public_read" on public.menu_categories
  for select using (true);
create policy "menu_categories_owner_write" on public.menu_categories
  for insert with check (public.owns_restaurant(restaurant_id));
create policy "menu_categories_owner_update" on public.menu_categories
  for update using (public.owns_restaurant(restaurant_id));
create policy "menu_categories_owner_delete" on public.menu_categories
  for delete using (public.owns_restaurant(restaurant_id));

create policy "menu_items_public_read" on public.menu_items
  for select using (true);
create policy "menu_items_owner_write" on public.menu_items
  for insert with check (public.owns_restaurant(restaurant_id));
create policy "menu_items_owner_update" on public.menu_items
  for update using (public.owns_restaurant(restaurant_id));
create policy "menu_items_owner_delete" on public.menu_items
  for delete using (public.owns_restaurant(restaurant_id));

-- published_menus: public read (public /menus/[menuId] pages), owner write
create policy "published_menus_public_read" on public.published_menus
  for select using (true);
create policy "published_menus_owner_write" on public.published_menus
  for insert with check (public.owns_restaurant(restaurant_id));
create policy "published_menus_owner_update" on public.published_menus
  for update using (public.owns_restaurant(restaurant_id));
create policy "published_menus_owner_delete" on public.published_menus
  for delete using (public.owns_restaurant(restaurant_id));

-- published_qr_cards: public read, owner write
create policy "published_qr_cards_public_read" on public.published_qr_cards
  for select using (true);
create policy "published_qr_cards_owner_write" on public.published_qr_cards
  for insert with check (public.owns_restaurant(restaurant_id));
create policy "published_qr_cards_owner_update" on public.published_qr_cards
  for update using (public.owns_restaurant(restaurant_id));
create policy "published_qr_cards_owner_delete" on public.published_qr_cards
  for delete using (public.owns_restaurant(restaurant_id));

-- payments: owner read.
-- NOTE: app/api/paymob-webhook/route.ts inserts/updates payments and bumps
-- restaurants.available_menus using the ANON server client (no service-role
-- key found in the code). The anon policies below keep that webhook working;
-- tighten by switching the webhook to the service-role key if desired.
create policy "payments_owner_read" on public.payments
  for select using (auth.uid() = user_id);
create policy "payments_webhook_insert" on public.payments
  for insert with check (true);
create policy "payments_webhook_update" on public.payments
  for update using (true);
create policy "restaurants_webhook_update" on public.restaurants
  for update using (true);

-- menu_translations: public read (translated public menus), owner write
create policy "menu_translations_public_read" on public.menu_translations
  for select using (true);
create policy "menu_translations_owner_write" on public.menu_translations
  for insert with check (public.owns_restaurant(restaurant_id));
create policy "menu_translations_owner_update" on public.menu_translations
  for update using (public.owns_restaurant(restaurant_id));
create policy "menu_translations_owner_delete" on public.menu_translations
  for delete using (public.owns_restaurant(restaurant_id));

-- menu_customizations: public read (needed to render public menus), owner write
create policy "menu_customizations_public_read" on public.menu_customizations
  for select using (true);
create policy "menu_customizations_owner_write" on public.menu_customizations
  for insert with check (public.owns_restaurant(restaurant_id));
create policy "menu_customizations_owner_update" on public.menu_customizations
  for update using (public.owns_restaurant(restaurant_id));
create policy "menu_customizations_owner_delete" on public.menu_customizations
  for delete using (public.owns_restaurant(restaurant_id));

-- templates: read for everyone (selector runs client-side); writes via dashboard/service role only
create policy "templates_public_read" on public.templates
  for select using (true);

-- menu_pdfs: public read; inserts come from the PDF API route (user session or anon)
create policy "menu_pdfs_public_read" on public.menu_pdfs
  for select using (true);
create policy "menu_pdfs_insert" on public.menu_pdfs
  for insert with check (true);

-- menu_drafts: owner only
create policy "menu_drafts_owner_all" on public.menu_drafts
  for all using (public.owns_restaurant(restaurant_id))
  with check (public.owns_restaurant(restaurant_id));

-- ============================================================================
-- Realtime (lib/hooks/use-payment-status.ts subscribes to these tables)
-- ============================================================================
alter publication supabase_realtime add table public.payments;
alter publication supabase_realtime add table public.restaurants;

-- ============================================================================
-- Storage buckets + policies
-- 'restaurant-logos' : logos, menu item images, category backgrounds,
--                      published menu PDFs and QR card PDFs (public URLs used)
-- 'menu-pdfs'        : generated/cached menu PDFs (public URLs used)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('restaurant-logos', 'restaurant-logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('menu-pdfs', 'menu-pdfs', true)
on conflict (id) do nothing;

create policy "restaurant_logos_public_read" on storage.objects
  for select using (bucket_id = 'restaurant-logos');
create policy "restaurant_logos_auth_insert" on storage.objects
  for insert with check (bucket_id = 'restaurant-logos' and auth.role() = 'authenticated');
create policy "restaurant_logos_auth_update" on storage.objects
  for update using (bucket_id = 'restaurant-logos' and auth.role() = 'authenticated');
create policy "restaurant_logos_auth_delete" on storage.objects
  for delete using (bucket_id = 'restaurant-logos' and auth.role() = 'authenticated');

create policy "menu_pdfs_bucket_public_read" on storage.objects
  for select using (bucket_id = 'menu-pdfs');
create policy "menu_pdfs_bucket_auth_insert" on storage.objects
  for insert with check (bucket_id = 'menu-pdfs' and auth.role() = 'authenticated');
create policy "menu_pdfs_bucket_auth_delete" on storage.objects
  for delete using (bucket_id = 'menu-pdfs' and auth.role() = 'authenticated');

-- ============================================================================
-- Seed: default templates (template selector expects rows here;
-- ids in code are metadata-driven, DB rows only need name/category/layout)
-- ============================================================================
insert into public.templates (name, description, category, layout_config, is_active) values
  ('Classic',        'Clean classic menu layout',          'both', '{"templateId":"classic"}', true),
  ('Cafe',           'Cozy cafe style menu',               'cafe', '{"templateId":"cafe"}', true),
  ('Modern',         'Modern minimalist menu',             'both', '{"templateId":"modern"}', true),
  ('Painting',       'Artistic painting style',            'both', '{"templateId":"painting"}', true),
  ('Vintage',        'Vintage decorative menu',            'restaurant', '{"templateId":"vintage"}', true),
  ('Modern Coffee',  'Modern coffee shop menu',            'cafe', '{"templateId":"modern-coffee"}', true),
  ('Fast Food',      'Bold fast food menu',                'restaurant', '{"templateId":"fast-food"}', true),
  ('Elegant Cocktail','Elegant cocktail bar menu',         'both', '{"templateId":"elegant-cocktail"}', true),
  ('Sweet Treats',   'Dessert and bakery menu',            'cafe', '{"templateId":"sweet-treats"}', true),
  ('Luxury Menu',    'Premium luxury restaurant menu',     'restaurant', '{"templateId":"luxury-menu"}', true),
  ('Chalkboard Coffee','Chalkboard coffee menu',           'cafe', '{"templateId":"chalkboard-coffee"}', true),
  ('Botanical Cafe', 'Botanical themed cafe menu',         'cafe', '{"templateId":"botanical-cafe"}', true),
  ('Cocktail Menu',  'Stylish cocktail list',              'both', '{"templateId":"cocktail-menu"}', true),
  ('Interactive Menu','Interactive digital menu',          'both', '{"templateId":"interactive-menu"}', true);

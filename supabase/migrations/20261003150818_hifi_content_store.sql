-- HiFi Tower content only. Existing application tables and policies are untouched.
create table public.hifi_site_settings (
 id text primary key,
 hero_eyebrow text not null, hero_title jsonb not null check (jsonb_typeof(hero_title) = 'array'),
 hero_description text not null, hero_tagline text not null, hero_image_url text not null,
 hero_cta_label text not null, hero_cta_url text not null,
 featured_brand text not null, featured_series text not null, featured_url text not null,
 about_eyebrow text not null, about_title text not null, about_highlight text not null,
 about_description text not null, about_cta_label text not null, about_cta_url text not null,
 published boolean not null default false, updated_at timestamptz not null default now()
);
create table public.hifi_media (
 id uuid primary key default gen_random_uuid(), storage_path text not null unique,
 bucket_id text not null default 'hifi-media' check (bucket_id = 'hifi-media'),
 source_url text, alt_text text not null default '', mime_type text,
 published boolean not null default false, created_at timestamptz not null default now()
);
create table public.hifi_brands (
 slug text primary key, name text not null, description text not null default '',
 logo_url text, source_url text, sort_order integer not null default 0,
 published boolean not null default false, updated_at timestamptz not null default now()
);
create table public.hifi_categories (
 slug text primary key, parent_slug text references public.hifi_categories(slug),
 name text not null, description text not null default '', image_url text not null default '',
 href text not null, source_url text, sort_order integer not null default 0,
 published boolean not null default false, updated_at timestamptz not null default now()
);
create index hifi_categories_parent_idx on public.hifi_categories(parent_slug);
create table public.hifi_navigation (
 slug text primary key, label text not null, href text not null,
 parent_slug text references public.hifi_navigation(slug), sort_order integer not null default 0,
 published boolean not null default false, updated_at timestamptz not null default now()
);
create index hifi_navigation_parent_idx on public.hifi_navigation(parent_slug);
create table public.hifi_products (
 slug text primary key, name text not null,
 brand_slug text references public.hifi_brands(slug), category_slug text references public.hifi_categories(slug),
 description text not null default '', specifications jsonb not null default '{}',
 image_urls jsonb not null default '[]', price numeric(12,2) check (price >= 0),
 sale_price numeric(12,2) check (sale_price >= 0), currency text not null default 'THB',
 source_url text unique, featured boolean not null default false,
 published boolean not null default false, updated_at timestamptz not null default now()
);
create index hifi_products_brand_idx on public.hifi_products(brand_slug);
create index hifi_products_category_idx on public.hifi_products(category_slug);
create table public.hifi_posts (
 slug text primary key, title text not null,
 kind text not null check (kind in ('news','review','article','workshop','promotion')),
 excerpt text not null default '', content jsonb not null default '{}', cover_image_url text,
 source_url text unique, starts_at timestamptz, ends_at timestamptz,
 published_at timestamptz, published boolean not null default false,
 updated_at timestamptz not null default now()
);
create index hifi_posts_kind_date_idx on public.hifi_posts(kind,published_at desc) where published;
create table public.hifi_pages (
 slug text primary key, title text not null, content jsonb not null default '{}',
 source_url text unique, published boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.hifi_site_settings enable row level security;
revoke all on public.hifi_site_settings from anon, authenticated;
grant select on public.hifi_site_settings to anon, authenticated;
grant select, insert, update, delete on public.hifi_site_settings to service_role;
create policy "hifi_published_read" on public.hifi_site_settings for select to anon, authenticated using (published);
alter table public.hifi_media enable row level security;
revoke all on public.hifi_media from anon, authenticated;
grant select on public.hifi_media to anon, authenticated;
grant select, insert, update, delete on public.hifi_media to service_role;
create policy "hifi_published_read" on public.hifi_media for select to anon, authenticated using (published);
alter table public.hifi_brands enable row level security;
revoke all on public.hifi_brands from anon, authenticated;
grant select on public.hifi_brands to anon, authenticated;
grant select, insert, update, delete on public.hifi_brands to service_role;
create policy "hifi_published_read" on public.hifi_brands for select to anon, authenticated using (published);
alter table public.hifi_categories enable row level security;
revoke all on public.hifi_categories from anon, authenticated;
grant select on public.hifi_categories to anon, authenticated;
grant select, insert, update, delete on public.hifi_categories to service_role;
create policy "hifi_published_read" on public.hifi_categories for select to anon, authenticated using (published);
alter table public.hifi_navigation enable row level security;
revoke all on public.hifi_navigation from anon, authenticated;
grant select on public.hifi_navigation to anon, authenticated;
grant select, insert, update, delete on public.hifi_navigation to service_role;
create policy "hifi_published_read" on public.hifi_navigation for select to anon, authenticated using (published);
alter table public.hifi_products enable row level security;
revoke all on public.hifi_products from anon, authenticated;
grant select on public.hifi_products to anon, authenticated;
grant select, insert, update, delete on public.hifi_products to service_role;
create policy "hifi_published_read" on public.hifi_products for select to anon, authenticated using (published);
alter table public.hifi_posts enable row level security;
revoke all on public.hifi_posts from anon, authenticated;
grant select on public.hifi_posts to anon, authenticated;
grant select, insert, update, delete on public.hifi_posts to service_role;
create policy "hifi_published_read" on public.hifi_posts for select to anon, authenticated using (published);
alter table public.hifi_pages enable row level security;
revoke all on public.hifi_pages from anon, authenticated;
grant select on public.hifi_pages to anon, authenticated;
grant select, insert, update, delete on public.hifi_pages to service_role;
create policy "hifi_published_read" on public.hifi_pages for select to anon, authenticated using (published);
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('hifi-media','hifi-media',true,10485760,array['image/jpeg','image/png','image/webp','image/avif','image/gif']);
-- Public bucket downloads are allowed; uploading/deleting remains privileged.
notify pgrst, 'reload schema';

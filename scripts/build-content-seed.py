"""Reproduce the approved homepage seed without touching existing app data."""
from pathlib import Path
import json

d = json.loads(Path('data/home-snapshot.json').read_text())
schema = '''-- HiFi Tower content only. Existing application tables and policies are untouched.
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
'''
tables = ['hifi_site_settings','hifi_media','hifi_brands','hifi_categories','hifi_navigation','hifi_products','hifi_posts','hifi_pages']
for t in tables:
 schema += f'''alter table public.{t} enable row level security;
revoke all on public.{t} from anon, authenticated;
grant select on public.{t} to anon, authenticated;
grant select, insert, update, delete on public.{t} to service_role;
create policy "hifi_published_read" on public.{t} for select to anon, authenticated using (published);
'''
schema += '''insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('hifi-media','hifi-media',true,10485760,array['image/jpeg','image/png','image/webp','image/avif','image/gif']);
-- Public bucket downloads are allowed; uploading/deleting remains privileged.
notify pgrst, 'reload schema';
'''
migration = next(Path('supabase/migrations').glob('*hifi_content_store.sql'))
migration.write_text(schema)
def sql(v):
 if v is None: return 'null'
 if isinstance(v,bool): return 'true' if v else 'false'
 if isinstance(v,(int,float)): return str(v)
 if isinstance(v,(list,dict)): return "'"+json.dumps(v,ensure_ascii=False).replace("'","''")+"'::jsonb"
 return "'"+v.replace("'","''")+"'"
def insert(t, rows):
 out=''
 for r in rows:
  cols=list(r)
  out += 'insert into public.'+t+' ('+','.join(cols)+') values ('+','.join(sql(r[c]) for c in cols)+') on conflict do nothing;\n'
 return out
seed=insert('hifi_site_settings',[dict(d['settings'],published=True)])
for key,t in [('brands','hifi_brands'),('categories','hifi_categories'),('navigation','hifi_navigation')]:
 seed+=insert(t,d[key])
Path('supabase/seed.sql').write_text(seed)
print('Schema:',migration,'Seed: supabase/seed.sql')

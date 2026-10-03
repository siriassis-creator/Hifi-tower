# HiFi Tower

Modern Hi-Fi and home theater website for HiFi Tower Thailand. The approved
black/gold homepage is connected to Supabase content and image storage.

## Run

```sh
npm ci
npm run dev
npm run build
npm start
```

## Content and media

Supabase project: `fried-chicken-station` (`xgkziaiztaiesrvnmkdn`, Singapore).
Only tables prefixed `hifi_` and the `hifi-media` bucket belong to this website.
Existing application tables, users, auth settings and buckets are unchanged.

| Table | Contents |
| --- | --- |
| `hifi_site_settings` | Homepage copy, image and calls to action |
| `hifi_navigation` | Menu labels, destinations and ordering |
| `hifi_brands` | Brand catalogue and logos |
| `hifi_categories` | Categories, parent relationships and artwork |
| `hifi_products` | Product copy, specifications, galleries and prices |
| `hifi_posts` | News, reviews, articles, workshops and promotions |
| `hifi_pages` | Company, contact and other editorial pages |
| `hifi_media` | Storage asset paths, provenance and alt text |

Use the Supabase Table Editor to edit rows, and Storage to upload images to
`hifi-media`. Only `published = true` records can be read publicly. The public
website has no write access, including for signed-in users of the other app.
Do not add broad authenticated upload policies to this shared project.

The homepage reads settings, navigation, brands and categories on the server.
Next.js revalidates content every 60 seconds. A committed content snapshot
preserves the approved homepage during temporary database outages; the server
logs whenever it uses this fallback. Optional deployment overrides are described
in `.env.example`. `lib/supabase-config.ts` contains a **publishable** key only,
never a service-role/secret key. RLS controls all public access.

The category section displays six standalone 3:2 images in three columns and two
rows on desktop (two columns on tablet, one on mobile). Four approved product
images were cleaned to remove embedded labels and arrows; Subwoofer and DAC
were generated using the legacy six-category screenshot and matching amber/black
lighting. WebP originals are versioned in `public/images/categories` and served
from Supabase `hifi-media/categories/*-v2.webp`. Cards preserve the approved
hover zoom and brightness effect, carry accessible category descriptions, and
show the six legacy category labels, with destination links deferred.
The CD panel retains the approved turntable image.

## Migration scope

The existing homepage content and images have been moved to Supabase. Tables for
products and editorial content are ready, but the full legacy catalogue,
articles and internal pages have **not yet been imported or rebuilt**. The
approved homepage still links to the original shop and editorial website.
The content model preserves source URLs for a later complete migration.

For a fresh database, apply migrations in order and then `supabase/seed.sql`.
The migrations are scoped to HiFi tables and the media bucket. They must not be
re-applied blindly to the already provisioned shared production project.
`python scripts/build-content-seed.py` reproduces the initial schema and homepage
seed from the committed snapshot. Copy media assets when moving projects.

The one-time `hifi-initial-media-import` Edge Function was used for the initial
uploads and then disabled (returns HTTP 410). Future uploads use the dashboard.

## Deployment

The existing Vercel project is linked to this repository's `main` branch.
Pushing a verified commit triggers its normal deployment workflow.

The hero uses `public/images/hero/showroom-v2.webp`, a generated showroom
composite based on the four approved AMP, DAC, Subwoofer and Speaker panels.
The same asset is stored in Supabase `hifi-media/backgrounds/showroom-v2.webp`.
CSS animates warm light fading and SVG sound rings aligned to the speaker
drivers; reduced-motion preferences disable animation. HiFi Tower identity
replaces the collection button, and category introduction uses left-aligned
white/gold typography. See `docs/showroom-image-prompt.md` for generation details.

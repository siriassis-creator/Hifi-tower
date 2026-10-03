alter table public.hifi_categories add column image_crop jsonb check (image_crop is null or jsonb_typeof(image_crop)='object');

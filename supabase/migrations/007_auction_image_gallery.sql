-- Multiple product images per auction (UniteCar-style gallery)
-- image_url remains the cover / primary; image_urls holds the full gallery.

alter table public.auctions
  add column if not exists image_urls jsonb not null default '[]'::jsonb;

comment on column public.auctions.image_urls is
  'Ordered gallery URLs for the product. image_url is the cover (usually image_urls[0]).';

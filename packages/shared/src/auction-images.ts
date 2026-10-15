import type { Auction } from "./types";

type ImageSource = Pick<Auction, "image_url"> & {
  image_urls?: string[] | null;
};

/** Ordered, de-duplicated gallery URLs (cover first). */
export function resolveAuctionImages(auction: ImageSource): string[] {
  const fromGallery = Array.isArray(auction.image_urls)
    ? auction.image_urls.filter((u): u is string => typeof u === "string" && u.length > 0)
    : [];

  const cover = auction.image_url?.trim() || null;
  const merged: string[] = [];

  if (cover) merged.push(cover);
  for (const url of fromGallery) {
    if (!merged.includes(url)) merged.push(url);
  }

  return merged;
}

export function resolveCoverImage(auction: ImageSource): string | null {
  return resolveAuctionImages(auction)[0] ?? null;
}

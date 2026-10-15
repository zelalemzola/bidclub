"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@bidclub/ui";
import { resolveAuctionImages, type Auction } from "@bidclub/shared";

type ProductGalleryProps = {
  auction: Pick<Auction, "title" | "image_url" | "image_urls">;
  className?: string;
  /** Larger hero for bid room */
  size?: "drawer" | "detail" | "hero";
  priority?: boolean;
};

/**
 * UniteCar-style product gallery: main image + vertical/horizontal thumbs.
 * Uses next/image with sized loads for performance.
 */
export function ProductGallery({
  auction,
  className,
  size = "detail",
  priority = false,
}: ProductGalleryProps) {
  const images = resolveAuctionImages(auction);
  const [active, setActive] = useState(0);
  const current = images[active] ?? null;

  const heroH =
    size === "hero"
      ? "min-h-[280px] aspect-[16/11] sm:min-h-[340px] lg:aspect-[5/4]"
      : size === "drawer"
        ? "aspect-[5/4] max-h-[320px]"
        : "aspect-[5/4] sm:aspect-[4/3]";

  if (!current) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-[1.5rem] bg-cream-deep text-sm text-mute",
          heroH,
          className,
        )}
      >
        No image
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:gap-4", className)}>
      {images.length > 1 && (
        <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:w-16 sm:flex-col sm:overflow-visible lg:w-[4.5rem]">
          {images.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-deep ring-offset-2 transition sm:h-16 sm:w-full",
                i === active
                  ? "ring-2 ring-[color:var(--color-gold-deep)]"
                  : "opacity-70 hover:opacity-100",
              )}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                sizes="72px"
                quality={60}
              />
            </button>
          ))}
        </div>
      )}

      <div
        className={cn(
          "bc-card-media order-1 relative w-full overflow-hidden sm:order-2 sm:flex-1",
          heroH,
        )}
      >
        <Image
          src={current}
          alt={auction.title}
          fill
          priority={priority}
          className="object-cover"
          sizes={
            size === "hero"
              ? "(max-width: 1024px) 100vw, 55vw"
              : "(max-width: 768px) 100vw, 420px"
          }
          quality={85}
        />
      </div>
    </div>
  );
}

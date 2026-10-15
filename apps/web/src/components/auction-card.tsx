"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Ticket } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Auction } from "@bidclub/shared";
import { resolveBidFeeBirr, resolveCoverImage } from "@bidclub/shared";
import { Button, LiveStrip } from "@bidclub/ui";
import { AuctionDetailDrawer } from "@/components/auction-detail-drawer";
import { CountdownTimer } from "@/components/countdown-timer";

/**
 * Frameless minimal product card — UniteCar language:
 * large photo, title, quiet meta, solid lime fee CTA. No bordered panel.
 */
export function AuctionCard({ auction }: { auction: Auction }) {
  const t = useTranslations("AuctionCard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const live = auction.status === "active";
  const fee = resolveBidFeeBirr(auction.bid_fee_birr);
  const cover = resolveCoverImage(auction);

  return (
    <>
      <motion.article
        className="group frame-free flex h-full flex-col gap-3"
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 320, damping: 24 }}
      >
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="bc-card-media relative aspect-[4/3] w-full overflow-hidden text-left shadow-[0_16px_40px_rgba(16,18,16,0.08)]"
        >
          {cover ? (
            <Image
              src={cover}
              alt={auction.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              quality={75}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-cream-deep">
              <Ticket className="size-7 text-mute" aria-hidden />
            </div>
          )}
          <div className="absolute left-3 top-3">
            {live ? <LiveStrip /> : <LiveStrip label="ENDED" />}
          </div>
        </button>

        <div className="flex flex-1 flex-col gap-2 px-0.5">
          <h3 className="font-display line-clamp-2 text-sm font-bold leading-snug text-ink sm:line-clamp-1 sm:text-[1.05rem]">
            {auction.title}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <CountdownTimer
              endsAt={auction.ends_at}
              createdAt={auction.created_at}
              status={auction.status}
              compact
            />
            <p className="font-mono text-[11px] text-mute">
              {live ? t("sealed", { count: auction.bid_count }) : t("closed")}
            </p>
          </div>

          <Button
            type="button"
            className="mt-1 w-full rounded-2xl"
            size="sm"
            onClick={() => setDrawerOpen(true)}
          >
            {live ? (
              <>
                <Ticket className="size-3.5" aria-hidden />
                {fee} ETB
              </>
            ) : (
              t("result")
            )}
          </Button>
        </div>
      </motion.article>

      <AuctionDetailDrawer
        auction={auction}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}

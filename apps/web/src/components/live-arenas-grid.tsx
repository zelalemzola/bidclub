"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Auction } from "@bidclub/shared";
import { Button, cn } from "@bidclub/ui";
import { AuctionCard } from "@/components/auction-card";
import { Stagger, StaggerItem } from "@/components/motion";

const MOBILE_PAGE_SIZE = 4;

type LiveArenasGridProps = {
  auctions: Auction[];
};

/**
 * Desktop: multi-column grid. Mobile: 2-column pages of 4 with pagination.
 */
export function LiveArenasGrid({ auctions }: LiveArenasGridProps) {
  const t = useTranslations("Home.liveSection");
  const [page, setPage] = useState(0);

  const pageCount = Math.max(1, Math.ceil(auctions.length / MOBILE_PAGE_SIZE));

  useEffect(() => {
    setPage(0);
  }, [auctions.length]);

  useEffect(() => {
    if (page > pageCount - 1) setPage(Math.max(0, pageCount - 1));
  }, [page, pageCount]);

  const mobileSlice = useMemo(() => {
    const start = page * MOBILE_PAGE_SIZE;
    return auctions.slice(start, start + MOBILE_PAGE_SIZE);
  }, [auctions, page]);

  return (
    <div className="space-y-4">
      <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 md:hidden" fast>
        {mobileSlice.map((auction) => (
          <StaggerItem key={auction.id}>
            <AuctionCard auction={auction} />
          </StaggerItem>
        ))}
      </Stagger>

      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-3 md:hidden">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="size-9 rounded-full p-0"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            aria-label={t("prevPage")}
          >
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <p className="min-w-[4.5rem] text-center font-mono text-xs font-semibold tabular-nums text-mute">
            {t("pageOf", { page: page + 1, total: pageCount })}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="size-9 rounded-full p-0"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            aria-label={t("nextPage")}
          >
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      )}

      <Stagger className="hidden gap-5 md:grid md:grid-cols-3 xl:grid-cols-4" fast>
        {auctions.map((auction) => (
          <StaggerItem key={auction.id}>
            <AuctionCard auction={auction} />
          </StaggerItem>
        ))}
      </Stagger>

      {pageCount > 1 && (
        <div className="flex justify-center gap-1.5 md:hidden" aria-hidden>
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === page ? "w-5 bg-gold-deep" : "w-1.5 bg-line",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

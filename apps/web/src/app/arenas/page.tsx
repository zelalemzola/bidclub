"use client";

import { useMemo, useState } from "react";
import { Gavel } from "lucide-react";
import { useTranslations } from "next-intl";
import { AuctionCard } from "@/components/auction-card";
import { ArenaFilters } from "@/components/arena-filters";
import { PageEnter, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { DEFAULT_ARENA_FILTERS, filterArenas } from "@/lib/arena-filters";
import { getErrorMessage } from "@/lib/errors";
import { useGetAuctionsQuery } from "@/store/api";

export default function ArenasPage() {
  const t = useTranslations("Arenas");
  const { data: auctions, isLoading, isError, error } = useGetAuctionsQuery();
  const [filters, setFilters] = useState(DEFAULT_ARENA_FILTERS);

  const filtered = useMemo(
    () => filterArenas(auctions ?? [], filters),
    [auctions, filters],
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 pt-8 sm:px-6 lg:px-8 lg:pt-14">
      <PageEnter>
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-gold-bright uppercase">
            <Gavel className="size-3.5" aria-hidden />
            {t("eyebrow")}
          </div>
          <h1 className="font-display max-w-3xl text-4xl font-extrabold leading-[0.95] text-ink sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-sm text-ink-soft lg:text-base">{t("subtitle")}</p>
        </header>
      </PageEnter>

      <Reveal>
        <ArenaFilters value={filters} onChange={setFilters} />
      </Reveal>

      <Reveal className="flex w-full items-center justify-between gap-2">
        <p className="text-sm text-mute">
          {isLoading ? t("loading") : t("count", { count: filtered.length })}
        </p>
      </Reveal>

      {isError && (
        <Reveal className="rounded-[1.75rem] border border-line glass-panel p-6">
          <p className="font-display text-lg font-bold text-ink">{t("errorTitle")}</p>
          <p className="mt-1 text-sm text-ink-soft">
            {t("errorBody", {
              error: getErrorMessage(error, "Connection error."),
            })}
          </p>
        </Reveal>
      )}

      {isLoading && (
        <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[320px] animate-pulse rounded-[1.75rem] border border-line bg-cream-deep"
            />
          ))}
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <Reveal className="rounded-[1.75rem] border border-line glass-panel px-5 py-14 text-center">
          <p className="font-display text-xl font-bold text-ink">{t("emptyTitle")}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{t("emptyBody")}</p>
        </Reveal>
      )}

      {filtered.length > 0 && (
        <Stagger
          className="grid w-full grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4"
          fast
        >
          {filtered.map((auction) => (
            <StaggerItem key={auction.id}>
              <AuctionCard auction={auction} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}

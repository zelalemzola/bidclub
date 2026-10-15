"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { DEFAULT_AUCTION_DURATION_DAYS } from "@bidclub/shared";
import { Button } from "@bidclub/ui";
import { WinnerCard } from "@/components/winner-card";
import { PageEnter, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { getErrorMessage } from "@/lib/errors";
import { useGetWinnersQuery } from "@/store/api";

export default function WinnersPage() {
  const t = useTranslations("Winners");
  const { data: winners, isLoading, isError, error } = useGetWinnersQuery();

  const [featured, ...rest] = winners ?? [];

  return (
    <div className="space-y-8 px-4 pt-8 pb-8 sm:px-5 lg:px-4 lg:pt-12 xl:px-6">
      <PageEnter>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-gold-dim uppercase">
              <Trophy className="size-3.5" aria-hidden />
              {t("eyebrow")}
            </p>
            <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
              {t("subtitle", { days: DEFAULT_AUCTION_DURATION_DAYS })}
            </p>
          </div>
          {!isLoading && winners && winners.length > 0 && (
            <p className="shrink-0 rounded-full bg-cream-deep px-3.5 py-1.5 text-xs font-bold text-mute tabular-nums">
              {t("count", { count: winners.length })}
            </p>
          )}
        </header>
      </PageEnter>

      {isLoading && (
        <div className="space-y-5">
          <div className="h-[320px] animate-pulse rounded-[1.5rem] bg-cream-deep sm:h-[280px]" />
          <div className="grid gap-5 md:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-[360px] animate-pulse rounded-[1.5rem] bg-cream-deep" />
            ))}
          </div>
        </div>
      )}

      {isError && (
        <Reveal className="rounded-[1.5rem] bg-white p-6 shadow-[0_12px_40px_rgba(16,18,16,0.06)]">
          <p className="font-display text-xl font-bold text-ink">{t("errorTitle")}</p>
          <p className="mt-1.5 text-sm text-ink-soft">
            {t("errorBody", { error: getErrorMessage(error, "Connection error.") })}
          </p>
        </Reveal>
      )}

      {!isLoading && !isError && (winners?.length ?? 0) === 0 && (
        <Reveal className="rounded-[1.5rem] bg-white px-5 py-14 text-center shadow-[0_12px_40px_rgba(16,18,16,0.06)]">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-cream-deep text-gold-bright">
            <Trophy className="size-7" aria-hidden />
          </span>
          <p className="font-display mt-5 text-2xl font-bold text-ink">{t("emptyTitle")}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
            {t("emptyBody", { days: DEFAULT_AUCTION_DURATION_DAYS })}
          </p>
          <Button asChild size="sm" className="mt-6 rounded-full">
            <Link href="/arenas">{t("browseLive")}</Link>
          </Button>
        </Reveal>
      )}

      {featured && (
        <div className="space-y-5">
          <Reveal>
            <WinnerCard auction={featured} featured />
          </Reveal>
          {rest.length > 0 && (
            <Stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {rest.map((auction) => (
                <StaggerItem key={auction.id}>
                  <WinnerCard auction={auction} />
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      )}
    </div>
  );
}

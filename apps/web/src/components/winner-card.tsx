"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Crown } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Auction } from "@bidclub/shared";
import { formatBidBirr } from "@bidclub/shared";
import { cn } from "@bidclub/ui";

type WinnerCardProps = {
  auction: Auction;
  featured?: boolean;
  className?: string;
};

/**
 * Closed-arena result row — product photo, winner, sealed winning number.
 */
export function WinnerCard({ auction, featured = false, className }: WinnerCardProps) {
  const t = useTranslations("WinnerCard");
  const amount =
    auction.winning_amount_cents != null
      ? formatBidBirr(auction.winning_amount_cents)
      : null;
  const winnerName = auction.winner?.display_name ?? t("fallbackWinner");
  const closedAt = auction.ends_at ?? auction.updated_at;

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[1.5rem] bg-white shadow-[0_12px_40px_rgba(16,18,16,0.06)]",
        featured && "sm:grid sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-cream-deep",
          featured ? "aspect-[16/11] sm:aspect-auto sm:min-h-[280px]" : "aspect-[16/11]",
        )}
      >
        {auction.image_url ? (
          <Image
            src={auction.image_url}
            alt={auction.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes={featured ? "(max-width: 640px) 100vw, 560px" : "(max-width: 640px) 100vw, 380px"}
            quality={75}
          />
        ) : (
          <div className="flex h-full min-h-[180px] items-center justify-center text-mute">
            <Crown className="size-10 opacity-40" aria-hidden />
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full gold-fill px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-night">
          <Crown className="size-3" aria-hidden />
          {t("badge")}
        </span>
      </div>

      <div className="flex flex-col justify-between gap-5 p-5 sm:p-6">
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
              {new Date(closedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <h3 className="font-display mt-1 text-xl font-bold leading-snug text-ink sm:text-2xl">
              {auction.title}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-cream-deep font-display text-sm font-bold text-ink">
              {initials(winnerName)}
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mute">
                {t("winnerLabel")}
              </p>
              <p className="truncate font-display text-base font-bold text-ink">{winnerName}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-cream-deep/70 px-4 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mute">
              {t("winningBid")}
            </p>
            {amount != null ? (
              <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-gold-bright sm:text-[2rem]">
                {amount}
                <span className="ml-1.5 text-sm font-semibold text-mute">ETB</span>
              </p>
            ) : (
              <p className="mt-1 text-sm text-mute">{t("noWinner")}</p>
            )}
          </div>
        </div>

        <Link
          href={`/auctions/${auction.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-ink transition hover:text-gold-bright"
        >
          {t("viewArena")}
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

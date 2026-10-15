"use client";

import { useTranslations } from "next-intl";
import { formatBidBirr, type Bid } from "@bidclub/shared";
import { Lock } from "lucide-react";
import { cn } from "@bidclub/ui";

type YourBidsPanelProps = {
  bids: Bid[] | undefined;
  className?: string;
};

/**
 * Private list of sealed bids the user entered for this product.
 */
export function YourBidsPanel({ bids, className }: YourBidsPanelProps) {
  const t = useTranslations("AuctionBid.yourBids");

  return (
    <section
      className={cn(
        "rounded-[1.5rem] bg-white p-5 shadow-[0_12px_40px_rgba(16,18,16,0.06)] sm:p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold text-ink">{t("title")}</h2>
          <p className="mt-0.5 text-sm text-mute">{t("subtitle")}</p>
        </div>
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-cream-deep text-mute">
          <Lock className="size-4" aria-hidden />
        </span>
      </div>

      <div className="mt-4">
        {!bids?.length ? (
          <div className="flex min-h-[5.5rem] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-cream-deep/50 px-4 py-5 text-center">
            <p className="text-sm text-mute">{t("empty")}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {bids.map((bid, i) => (
              <li
                key={bid.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-cream-deep/55 px-3.5 py-3"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-mute">
                    {t("bidLabel", { n: i + 1 })}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-mute">
                    {new Date(bid.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="font-mono text-base font-bold tabular-nums text-gold-bright">
                  {formatBidBirr(bid.amount_cents)} ETB
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {!!bids?.length && (
        <p className="mt-4 text-xs text-mute">{t("footer", { count: bids.length })}</p>
      )}
    </section>
  );
}

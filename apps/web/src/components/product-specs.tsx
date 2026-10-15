"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  BID_MAX_BIRR,
  DEFAULT_AUCTION_DURATION_DAYS,
  type Auction,
} from "@bidclub/shared";
import { MapPin, Package } from "lucide-react";
import { cn } from "@bidclub/ui";

type SpecTab = "overview" | "rules" | "delivery";

type ProductSpecsProps = {
  auction: Auction;
  className?: string;
};

/**
 * Product overview — admin description on Overview; rules & delivery on other tabs.
 */
export function ProductSpecs({ auction, className }: ProductSpecsProps) {
  const t = useTranslations("AuctionDetail");
  const [tab, setTab] = useState<SpecTab>("overview");

  const tabs: { id: SpecTab; label: string }[] = [
    { id: "overview", label: t("specTabs.overview") },
    { id: "rules", label: t("specTabs.rules") },
    { id: "delivery", label: t("specTabs.delivery") },
  ];

  return (
    <section
      className={cn(
        "w-full rounded-[1.5rem] bg-white p-5 shadow-[0_12px_40px_rgba(16,18,16,0.06)] sm:p-6 lg:p-8",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
            {t("specsEyebrow")}
          </p>
          <h2 className="font-display mt-1 text-xl font-bold text-ink sm:text-2xl">
            {t("overviewTitle")}
          </h2>
        </div>

        <div
          className="flex max-w-full gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label={t("overviewTitle")}
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition sm:text-sm",
                tab === item.id
                  ? "gold-fill text-night shadow-[0_6px_18px_rgba(155,196,30,0.28)]"
                  : "bg-cream-deep/90 text-ink-soft hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 sm:mt-6" role="tabpanel">
        {tab === "overview" && (
          <p className="max-w-4xl text-sm leading-relaxed text-ink-soft sm:text-base sm:leading-7">
            {auction.description}
          </p>
        )}

        {tab === "rules" && (
          <p className="max-w-4xl text-sm leading-relaxed text-ink-soft sm:text-base sm:leading-7">
            {t("ruleNote", {
              days: DEFAULT_AUCTION_DURATION_DAYS,
              maxBid: BID_MAX_BIRR,
            })}
          </p>
        )}

        {tab === "delivery" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3 rounded-2xl bg-cream-deep/55 px-3.5 py-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-ink shadow-sm ring-1 ring-black/[0.04]">
                <MapPin className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-ink">
                  {t("specValues.deliveryEthiopia")}
                </p>
                <p className="mt-0.5 text-xs text-mute">{t("specs.deliveryLocation")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-cream-deep/55 px-3.5 py-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-ink shadow-sm ring-1 ring-black/[0.04]">
                <Package className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-ink">
                  {t("specValues.conditionNew")}
                </p>
                <p className="mt-0.5 text-xs text-mute">{t("specs.condition")}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

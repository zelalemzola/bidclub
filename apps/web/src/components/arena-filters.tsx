"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@bidclub/ui";

export type ArenaFeeFilter = "all" | "low" | "mid" | "high";
export type ArenaSort =
  | "ending"
  | "newest"
  | "bids"
  | "fee-asc"
  | "fee-desc";

export type ArenaFiltersState = {
  query: string;
  fee: ArenaFeeFilter;
  sort: ArenaSort;
};

const FEE_OPTS: ArenaFeeFilter[] = ["all", "low", "mid", "high"];
const SORT_OPTS: ArenaSort[] = [
  "ending",
  "newest",
  "bids",
  "fee-asc",
  "fee-desc",
];

export function ArenaFilters({
  value,
  onChange,
  className,
}: {
  value: ArenaFiltersState;
  onChange: (next: ArenaFiltersState) => void;
  className?: string;
}) {
  const t = useTranslations("Arenas");

  const feeLabel = (id: ArenaFeeFilter) => {
    switch (id) {
      case "all":
        return t("fee.all");
      case "low":
        return t("fee.low");
      case "mid":
        return t("fee.mid");
      case "high":
        return t("fee.high");
    }
  };

  const sortLabel = (id: ArenaSort) => {
    switch (id) {
      case "ending":
        return t("sort.ending");
      case "newest":
        return t("sort.newest");
      case "bids":
        return t("sort.bids");
      case "fee-asc":
        return t("sort.feeAsc");
      case "fee-desc":
        return t("sort.feeDesc");
    }
  };

  return (
    <div
      className={cn(
        "w-full space-y-5 rounded-[1.75rem] border border-gold/20 bg-gold/[0.05] p-5 glass-panel sm:p-6",
        className,
      )}
    >
      <div className="relative w-full">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-mute"
          aria-hidden
        />
        <input
          type="search"
          placeholder={t("searchPlaceholder")}
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          className="h-12 w-full rounded-full border border-input bg-cream-deep/70 pl-11 pr-4 text-sm text-ink placeholder:text-mute focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2.5">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-mute">
            <SlidersHorizontal className="size-3" aria-hidden />
            {t("filterLabel")}
          </p>
          <div className="flex flex-wrap gap-2">
            {FEE_OPTS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ...value, fee: opt })}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                  value.fee === opt
                    ? "gold-fill border-transparent text-night"
                    : "border-gold/15 bg-paper/60 text-ink-soft hover:border-gold/40",
                )}
              >
                {feeLabel(opt)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-mute">
            {t("sortLabel")}
          </p>
          <div className="flex flex-wrap gap-2">
            {SORT_OPTS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ...value, sort: opt })}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                  value.sort === opt
                    ? "gold-fill border-transparent text-night"
                    : "border-gold/15 bg-paper/60 text-ink-soft hover:border-gold/40",
                )}
              >
                {sortLabel(opt)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

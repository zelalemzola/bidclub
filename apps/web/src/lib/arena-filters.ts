import type { Auction } from "@bidclub/shared";
import { resolveBidFeeBirr } from "@bidclub/shared";
import type {
  ArenaFeeFilter,
  ArenaFiltersState,
  ArenaSort,
} from "@/components/arena-filters";

function matchesFee(auction: Auction, fee: ArenaFeeFilter) {
  const f = resolveBidFeeBirr(auction.bid_fee_birr);
  if (fee === "all") return true;
  if (fee === "low") return f <= 50;
  if (fee === "mid") return f > 50 && f <= 100;
  return f > 100;
}

function sortAuctions(list: Auction[], sort: ArenaSort) {
  const copy = [...list];
  copy.sort((a, b) => {
    switch (sort) {
      case "ending": {
        const ae = a.ends_at ? new Date(a.ends_at).getTime() : Number.MAX_SAFE_INTEGER;
        const be = b.ends_at ? new Date(b.ends_at).getTime() : Number.MAX_SAFE_INTEGER;
        return ae - be;
      }
      case "newest":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "bids":
        return b.bid_count - a.bid_count;
      case "fee-asc":
        return resolveBidFeeBirr(a.bid_fee_birr) - resolveBidFeeBirr(b.bid_fee_birr);
      case "fee-desc":
        return resolveBidFeeBirr(b.bid_fee_birr) - resolveBidFeeBirr(a.bid_fee_birr);
      default:
        return 0;
    }
  });
  return copy;
}

export function filterArenas(auctions: Auction[], filters: ArenaFiltersState) {
  const q = filters.query.trim().toLowerCase();
  const filtered = auctions.filter((a) => {
    // Show live + closed (no status chip filter)
    if (a.status === "draft") return false;
    if (!matchesFee(a, filters.fee)) return false;
    if (!q) return true;
    return (
      a.title.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  });
  return sortAuctions(filtered, filters.sort);
}

export const DEFAULT_ARENA_FILTERS: ArenaFiltersState = {
  query: "",
  fee: "all",
  sort: "ending",
};

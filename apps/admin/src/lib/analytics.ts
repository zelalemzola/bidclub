import type { Auction, Payment, Profile } from "@bidclub/shared";

export type DayPoint = { day: string; bids: number; revenue: number };

export function sumPayments(payments: Payment[] | undefined, type?: Payment["type"]) {
  return (
    payments
      ?.filter((p) => p.status === "mock_completed" && (!type || p.type === type))
      .reduce((sum, p) => sum + Number(p.amount_birr), 0) ?? 0
  );
}

export function formatEtb(amount: number) {
  return `ETB ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function auctionCounts(auctions: Auction[] | undefined) {
  const list = auctions ?? [];
  return {
    total: list.length,
    active: list.filter((a) => a.status === "active").length,
    draft: list.filter((a) => a.status === "draft").length,
    closed: list.filter((a) => a.status === "closed").length,
    totalBids: list.reduce((sum, a) => sum + (a.bid_count ?? 0), 0),
  };
}

export function activatedUsers(profiles: Profile[] | undefined) {
  return profiles?.filter((p) => !!p.registration_paid_at).length ?? 0;
}

/** Last N days of bid-fee revenue + rough bid volume from payments. */
export function buildTrend(
  payments: Payment[] | undefined,
  days = 14,
): DayPoint[] {
  const map = new Map<string, DayPoint>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { day: key.slice(5), bids: 0, revenue: 0 });
  }

  for (const p of payments ?? []) {
    if (p.status !== "mock_completed") continue;
    const key = new Date(p.created_at).toISOString().slice(0, 10);
    const point = map.get(key);
    if (!point) continue;
    point.revenue += Number(p.amount_birr);
    if (p.type === "bid") point.bids += 1;
  }

  return Array.from(map.values());
}

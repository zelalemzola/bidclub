import {
  BID_MAX_CENTS,
  BID_MIN_CENTS,
  BID_STEP_CENTS,
  BIRR_TO_CENTS,
  DEFAULT_BID_FEE_BIRR,
} from "./constants";

/** All valid bid amounts in cents: 0, 1, 2, …, 10000 (0.00–100.00 ETB) */
export function getBidGridCents(): number[] {
  const grid: number[] = [];
  for (let c = BID_MIN_CENTS; c <= BID_MAX_CENTS; c += BID_STEP_CENTS) {
    grid.push(c);
  }
  return grid;
}

export function isValidBidCents(amountCents: number): boolean {
  if (!Number.isInteger(amountCents)) return false;
  if (amountCents < BID_MIN_CENTS || amountCents > BID_MAX_CENTS) return false;
  return amountCents % BID_STEP_CENTS === 0;
}

export function birrToCents(birr: number): number {
  return Math.round(birr * BIRR_TO_CENTS);
}

export function centsToBirr(cents: number): number {
  return cents / BIRR_TO_CENTS;
}

/** Resolve per-auction fee with a safe default for older rows. */
export function resolveBidFeeBirr(fee: number | null | undefined): number {
  if (typeof fee === "number" && Number.isFinite(fee) && fee > 0) return fee;
  return DEFAULT_BID_FEE_BIRR;
}

export function formatBidBirr(cents: number): string {
  const birr = centsToBirr(cents);
  return birr.toFixed(2);
}

/** Snap a birr input to nearest valid cent within range (or null if out of range) */
export function snapToBidGrid(birr: number): number | null {
  if (!Number.isFinite(birr)) return null;
  const cents = birrToCents(birr);
  if (cents < BID_MIN_CENTS || cents > BID_MAX_CENTS) return null;
  const snapped = Math.round(cents / BID_STEP_CENTS) * BID_STEP_CENTS;
  if (!isValidBidCents(snapped)) return null;
  return snapped;
}

/**
 * Lowest unique bid winner:
 * among amounts that appear exactly once, pick the minimum.
 */
export function findLowestUniqueBid(
  amounts: number[],
): { amountCents: number } | null {
  const counts = new Map<number, number>();
  for (const a of amounts) {
    counts.set(a, (counts.get(a) ?? 0) + 1);
  }
  let winner: number | null = null;
  for (const [amount, count] of counts) {
    if (count !== 1) continue;
    if (winner === null || amount < winner) winner = amount;
  }
  return winner === null ? null : { amountCents: winner };
}

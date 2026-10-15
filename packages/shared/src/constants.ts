/** Registration fee in ETB (birr) */
export const REGISTRATION_FEE_BIRR = 100;

/** Default per-bid fee in ETB when an auction does not override it */
export const BID_FEE_BIRR = 75;
export const DEFAULT_BID_FEE_BIRR = BID_FEE_BIRR;

/**
 * Arenas close on the wall-clock timer only (not bid count).
 * Kept high so legacy max_bids checks never trip.
 */
export const DEFAULT_MAX_BIDS = 1_000_000;

/** Default arena length in days — the timer decides the close. */
export const DEFAULT_AUCTION_DURATION_DAYS = 20;

/** Default arena duration when ends_at is not set (ms) */
export const DEFAULT_AUCTION_DURATION_MS =
  DEFAULT_AUCTION_DURATION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Bid amount bounds in birr.
 * Any amount from 0.00–100.00 inclusive (currency precision: 0.01 ETB).
 */
export const BID_MIN_BIRR = 0;
export const BID_MAX_BIRR = 100;
export const BID_STEP_BIRR = 0.01;

/** Store money as integer cents (1 birr = 100 cents) */
export const BIRR_TO_CENTS = 100;

export const BID_MIN_CENTS = BID_MIN_BIRR * BIRR_TO_CENTS;
export const BID_MAX_CENTS = BID_MAX_BIRR * BIRR_TO_CENTS;
export const BID_STEP_CENTS = Math.round(BID_STEP_BIRR * BIRR_TO_CENTS);

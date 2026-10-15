"use client";

import { useEffect, useState } from "react";
import { cn, LiveStrip } from "@bidclub/ui";

type ArenaActivityProps = {
  /** Timestamp of the most recent bid_count increase, or null if none yet. */
  lastPulseAt: number | null;
  bidsPerMinute: number;
  className?: string;
};

/**
 * Anonymous activity pulse. Fires purely off bid_count deltas from realtime
 * updates — no names, no amounts, ever.
 */
export function ArenaActivity({ lastPulseAt, bidsPerMinute, className }: ArenaActivityProps) {
  const [seenPulseAt, setSeenPulseAt] = useState(lastPulseAt);
  const [flash, setFlash] = useState(false);

  // Adjust state during render when a new pulse arrives (no effect needed for this part).
  if (lastPulseAt !== seenPulseAt) {
    setSeenPulseAt(lastPulseAt);
    if (lastPulseAt) setFlash(true);
  }

  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => setFlash(false), 1500);
    return () => window.clearTimeout(id);
  }, [flash]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3.5 transition-colors duration-500",
        flash && "border-gold/50 bg-champagne/40",
        className,
      )}
      aria-live="polite"
    >
      <LiveStrip label={flash ? "BID LOCKED" : "LIVE"} />
      <p className="text-sm text-ink-soft">
        {flash ? (
          <span className="font-medium text-ink">Someone just sealed a bid.</span>
        ) : bidsPerMinute >= 0.2 ? (
          <>
            <span className="font-mono font-semibold text-ink">{bidsPerMinute.toFixed(1)}</span>{" "}
            bids/min · amounts stay hidden
          </>
        ) : (
          "Waiting for the next sealed bid…"
        )}
      </p>
    </div>
  );
}

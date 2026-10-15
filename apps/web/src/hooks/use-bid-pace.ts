"use client";

import { useEffect, useRef, useState } from "react";

/** Tracks anonymous fill pace from bid_count deltas (no bid amounts). */
export function useBidPace(bidCount: number) {
  const samples = useRef<{ t: number; count: number }[]>([]);
  const [bidsPerMinute, setBidsPerMinute] = useState(0);
  const [lastPulseAt, setLastPulseAt] = useState<number | null>(null);
  const prev = useRef(bidCount);

  useEffect(() => {
    const now = Date.now();
    if (bidCount > prev.current) {
      setLastPulseAt(now);
    }
    prev.current = bidCount;

    samples.current.push({ t: now, count: bidCount });
    samples.current = samples.current.filter((s) => now - s.t < 120_000);

    if (samples.current.length < 2) {
      setBidsPerMinute(0);
      return;
    }

    const first = samples.current[0];
    const last = samples.current[samples.current.length - 1];
    const minutes = Math.max((last.t - first.t) / 60_000, 1 / 60);
    const delta = Math.max(0, last.count - first.count);
    setBidsPerMinute(delta / minutes);
  }, [bidCount]);

  return { bidsPerMinute, lastPulseAt };
}

export function formatEta(remainingSlots: number, bidsPerMinute: number): string | null {
  if (remainingSlots <= 0) return "Closing now";
  if (bidsPerMinute < 0.2) return null;
  const minutes = remainingSlots / bidsPerMinute;
  if (minutes < 1) return "Under a minute at this pace";
  if (minutes < 60) return `~${Math.ceil(minutes)} min at this pace`;
  const hours = minutes / 60;
  if (hours < 24) return `~${hours.toFixed(1)} hrs at this pace`;
  return `~${Math.ceil(hours / 24)} days at this pace`;
}

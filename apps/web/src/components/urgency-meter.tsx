"use client";

import { cn } from "@bidclub/ui";
import { getUrgencyLevelFromProgress, urgencyTone } from "@/lib/urgency";

type UrgencyMeterProps = {
  elapsedPct: number;
  status: string;
  className?: string;
};

/** Time-window fill bar — never amounts. */
export function UrgencyMeter({ elapsedPct, status, className }: UrgencyMeterProps) {
  const pct = Math.min(100, Math.max(0, elapsedPct));
  const level = getUrgencyLevelFromProgress(pct, status);
  const tone = urgencyTone(level);

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="relative h-2 overflow-hidden rounded-md bg-cream-deep"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn("h-full rounded-md transition-[width] duration-700 ease-out", tone.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between font-mono text-[11px] text-mute">
        <span>{Math.round(pct)}% of window elapsed</span>
        <span className={tone.text}>{Math.max(0, 100 - Math.round(pct))}% left</span>
      </div>
    </div>
  );
}

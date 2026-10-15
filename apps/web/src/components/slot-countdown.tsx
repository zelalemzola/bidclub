"use client";

import { Hourglass, Timer } from "lucide-react";
import { cn } from "@bidclub/ui";
import { CountdownTimer } from "@/components/countdown-timer";
import { getUrgencyLevelFromProgress, urgencyLabel, urgencyTone } from "@/lib/urgency";
import { timeProgressPct } from "@/hooks/use-countdown";

type SlotCountdownProps = {
  createdAt: string;
  endsAt?: string | null;
  status: string;
  bidCount: number;
  className?: string;
};

/** Arena clock readout — timer decides the close, not bid count. */
export function SlotCountdown({
  createdAt,
  endsAt,
  status,
  bidCount,
  className,
}: SlotCountdownProps) {
  const elapsed = timeProgressPct(createdAt, endsAt, status);
  const level = getUrgencyLevelFromProgress(elapsed, status);
  const tone = urgencyTone(level);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-paper p-4 vault-panel sm:p-5",
        tone.border,
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bc-lattice opacity-15" aria-hidden />
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-mute">
            <Hourglass className="size-3.5 text-gold-bright" aria-hidden />
            Arena timer
          </p>
          <p className={cn("mt-0.5 text-sm font-semibold", tone.text)}>
            {urgencyLabel(level)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-cream-deep px-2.5 py-1 font-mono text-[11px] text-ink-soft">
          <Timer className="size-3" aria-hidden />
          {Math.max(0, 100 - elapsed)}% left
        </span>
      </div>

      <div className="relative mt-4 flex justify-center">
        <CountdownTimer endsAt={endsAt} createdAt={createdAt} status={status} />
      </div>

      <p className="relative mt-3 text-center text-xs text-mute">
        <span className="font-mono text-ink">{bidCount}</span> sealed bids locked · closes when
        the clock hits zero
      </p>
    </div>
  );
}

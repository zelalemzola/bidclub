"use client";

import dynamic from "next/dynamic";
import { Hourglass, Timer } from "lucide-react";
import { cn } from "@bidclub/ui";
import { resolveEndsAt, useCountdown } from "@/hooks/use-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";

const FlipClockCountdown = dynamic(
  () => import("@leenguyen/react-flip-clock-countdown"),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[100px] w-full animate-pulse rounded-xl bg-cream-deep"
        aria-hidden
      />
    ),
  },
);

type FlipCountdownProps = {
  endsAt?: string | null;
  createdAt: string;
  status: string;
  className?: string;
  /** Compact strip for the floating dock */
  compact?: boolean;
};

/**
 * Arena clock — `@leenguyen/react-flip-clock-countdown` (polished 3D flip cards)
 * wrapped in soft white/glass chrome. The flip digits themselves stay dark
 * blocks (readable light digits on near-black tiles) while every wrapper
 * panel around them is white/soft, UniteCar-style.
 */
export function FlipCountdown({
  endsAt,
  createdAt,
  status,
  className,
  compact = false,
}: FlipCountdownProps) {
  const target = resolveEndsAt(endsAt, createdAt, status);
  const { done, totalMs } = useCountdown(target);
  const urgent = !done && totalMs < 48 * 60 * 60 * 1000;

  if (status === "closed" || done || !target) {
    if (compact) {
      return (
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-2xl border border-line bg-paper/95 px-3 py-2.5 font-mono text-xs font-semibold text-mute backdrop-blur-xl",
            className,
          )}
        >
          <Hourglass className="size-3.5" aria-hidden />
          Ended
        </div>
      );
    }
    return (
      <div
        className={cn(
          "rounded-2xl border border-line bg-cream-deep/80 px-5 py-8 text-center vault-panel",
          className,
        )}
      >
        <Hourglass className="mx-auto size-7 text-mute" aria-hidden />
        <p className="font-display mt-3 text-xl font-bold text-ink">Arena closed</p>
        <p className="mt-1 text-sm text-mute">The countdown has reached zero</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={cn(
          "bc-flip-clock bc-flip-clock--compact overflow-hidden rounded-2xl border border-gold/30 bg-paper/95 px-2.5 py-2 shadow-[0_12px_32px_rgba(16,18,16,0.14)] backdrop-blur-xl",
          urgent && "bc-flip-clock--urgent border-danger/40",
          className,
        )}
      >
        <p className="mb-1.5 px-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-gold-dim">
          Closes in
        </p>
        <FlipClockCountdown
          to={target.getTime()}
          labels={["D", "H", "M", "S"]}
          showLabels
          showSeparators
          duration={0.55}
          renderOnServer={false}
          stopOnHiddenVisibility
          hideOnComplete={false}
          labelStyle={{
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: urgent ? "#e53935" : "#7a847c",
          }}
          digitBlockStyle={{
            width: 22,
            height: 30,
            fontSize: 14,
            fontWeight: 700,
            borderRadius: 5,
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
          }}
          separatorStyle={{ color: urgent ? "#e53935" : "#c5f042", size: 4 }}
          dividerStyle={{
            color: urgent ? "rgba(229,57,53,0.45)" : "rgba(197,240,66,0.4)",
            height: 1,
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bc-flip-clock relative overflow-hidden rounded-2xl border border-gold/30 vault-panel",
        urgent && "bc-flip-clock--urgent border-danger/40",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bc-lattice opacity-10" aria-hidden />
      <div
        className={cn(
          "pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full blur-3xl",
          urgent ? "bg-danger/15" : "bg-gold/10",
        )}
      />

      <div className="relative border-b border-line/80 px-4 py-3.5 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-dim">
              <Timer className="size-3.5 text-gold-bright" aria-hidden />
              Arena countdown
            </p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {urgent
                ? "Final stretch — lock your sealed number"
                : "3D flip clock · closes at zero"}
            </p>
          </div>
          {urgent && (
            <span className="shrink-0 rounded-full bg-danger/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-danger live-pulse">
              Hot
            </span>
          )}
        </div>
      </div>

      <div className="relative flex w-full justify-center px-3 py-7 sm:px-5 sm:py-9">
        <FlipClockCountdown
          to={target.getTime()}
          labels={["DAYS", "HOURS", "MINUTES", "SECONDS"]}
          showLabels
          showSeparators
          duration={0.6}
          renderOnServer={false}
          stopOnHiddenVisibility
          hideOnComplete={false}
          labelStyle={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: urgent ? "#e53935" : "#7a847c",
          }}
          digitBlockStyle={{
            width: 38,
            height: 56,
            fontSize: 28,
            fontWeight: 700,
            borderRadius: 10,
            fontFamily: "var(--font-mono, ui-monospace, monospace)",
          }}
          separatorStyle={{ color: urgent ? "#e53935" : "#c5f042", size: 6 }}
          dividerStyle={{
            color: urgent ? "rgba(229,57,53,0.45)" : "rgba(197,240,66,0.4)",
            height: 1,
          }}
          spacing={{ clock: 10, digitBlock: 4 }}
        />
      </div>
    </div>
  );
}

"use client";

import { Hourglass, Timer } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@bidclub/ui";
import { resolveEndsAt, useCountdown } from "@/hooks/use-countdown";

type CountdownTimerProps = {
  endsAt?: string | null;
  createdAt: string;
  status: string;
  className?: string;
  compact?: boolean;
  /** Large segmented flip-style timer for detail pages */
  hero?: boolean;
};

function DigitBlock({
  value,
  label,
  pulse,
}: {
  value: string;
  label: string;
  pulse?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl border border-gold/30 bg-gradient-to-b from-cream-deep to-paper px-1 py-3 text-center shadow-[inset_0_1px_0_rgba(232,197,71,0.15)]",
          pulse && "ring-1 ring-gold/40",
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gold/15" />
        <span className="font-mono text-2xl font-bold tabular-nums tracking-tight text-gold-bright sm:text-3xl lg:text-4xl">
          {value}
        </span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-mute">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({
  endsAt,
  createdAt,
  status,
  className,
  compact = false,
  hero = false,
}: CountdownTimerProps) {
  const t = useTranslations("CountdownTimer");
  const target = resolveEndsAt(endsAt, createdAt, status);
  const { days, daysLabel, hours, minutes, seconds, done, totalMs } =
    useCountdown(target);
  const ariaLabel = t("ariaRemaining", { days, hours, minutes, seconds });

  if (status === "closed" || done) {
    if (hero) {
      return (
        <div
          className={cn(
            "rounded-2xl border border-line bg-cream-deep/80 px-5 py-6 text-center vault-panel",
            className,
          )}
        >
          <Hourglass className="mx-auto size-6 text-mute" aria-hidden />
          <p className="font-display mt-2 text-xl font-bold text-ink">{t("closedTitle")}</p>
          <p className="mt-1 text-sm text-mute">{t("closedBody")}</p>
        </div>
      );
    }
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-cream-deep px-3 py-1.5 font-mono text-xs font-semibold text-muted-foreground",
          className,
        )}
      >
        <Timer className="size-3.5 opacity-70" aria-hidden />
        {t("ended")}
      </div>
    );
  }

  if (hero) {
    const urgent = totalMs < 48 * 60 * 60 * 1000;
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-gold/25 p-4 vault-panel sm:p-5",
          urgent && "border-danger/35",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bc-lattice opacity-20" aria-hidden />
        <div className="relative mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold-dim">
              <Timer className="size-3.5 text-gold-bright" aria-hidden />
              {t("liveCountdown")}
            </p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {urgent ? t("urgentNote") : t("normalNote")}
            </p>
          </div>
          {urgent && (
            <span className="rounded-full bg-danger/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-danger live-pulse">
              {t("hot")}
            </span>
          )}
        </div>
        <div className="relative flex gap-2 sm:gap-3" aria-label={ariaLabel}>
          <DigitBlock value={daysLabel.padStart(2, "0")} label={t("days")} />
          <DigitBlock value={hours} label={t("hours")} />
          <DigitBlock value={minutes} label={t("mins")} pulse />
          <DigitBlock value={seconds} label={t("secs")} pulse />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-cream-deep px-3 py-1.5 font-mono text-xs font-bold text-ink shadow-sm",
        compact ? "text-[11px]" : "sm:text-sm",
        className,
      )}
      aria-label={ariaLabel}
    >
      <Timer className="size-3.5 text-gold-bright" aria-hidden />
      {days > 0 && (
        <>
          <span className="text-gold-bright">{days}d</span>
          <span className="text-muted-foreground">·</span>
        </>
      )}
      <span className="text-gold-bright">{hours}</span>
      <span className="text-muted-foreground">:</span>
      <span className="text-gold-bright">{minutes}</span>
      <span className="text-muted-foreground">:</span>
      <span className="text-gold-bright">{seconds}</span>
    </div>
  );
}

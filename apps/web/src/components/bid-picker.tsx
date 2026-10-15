"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  BID_MAX_BIRR,
  BID_MIN_BIRR,
  BID_STEP_BIRR,
  formatBidBirr,
  snapToBidGrid,
} from "@bidclub/shared";
import { Button, Input, Label, cn } from "@bidclub/ui";

/** Spread across 0–100 so chips stay meaningfully distinct. */
const QUICK_BIRR = [0, 1, 5, 10, 25, 50, 75, 100];

/** +/- nudge size for the stepper (typing still accepts any 0.01). */
const NUDGE_BIRR = 1;

type BidPickerProps = {
  /** Current sealed amount, in cents, snapped to a valid cent. */
  valueCents: number;
  onChange: (cents: number) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Picks a single sealed number. Display + parent state update while typing
 * whenever the draft parses to a valid amount.
 */
export function BidPicker({ valueCents, onChange, disabled, className }: BidPickerProps) {
  const t = useTranslations("BidPicker");
  const committed = useMemo(() => formatBidBirr(valueCents), [valueCents]);
  const [raw, setRaw] = useState(committed);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) setRaw(committed);
  }, [committed, editing]);

  const shown = editing ? (raw.trim() === "" ? "—" : raw) : committed;

  function pushIfValid(text: string) {
    const trimmed = text.trim();
    if (trimmed === "" || trimmed === "." || trimmed === "-") return;
    const snapped = snapToBidGrid(Number(trimmed));
    if (snapped !== null) onChange(snapped);
  }

  function commit(text: string) {
    const snapped = snapToBidGrid(Number(text));
    if (snapped === null) {
      setError(t("rangeError", { min: BID_MIN_BIRR, max: BID_MAX_BIRR }));
      setRaw(committed);
      setEditing(false);
      return;
    }
    setError(null);
    setEditing(false);
    onChange(snapped);
    setRaw(formatBidBirr(snapped));
  }

  function step(delta: number) {
    const next = snapToBidGrid(Number(committed) + delta);
    if (next === null) return;
    setError(null);
    setEditing(false);
    onChange(next);
    setRaw(formatBidBirr(next));
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-2xl border border-gold/30 bg-gradient-to-b from-champagne/40 to-cream-deep px-4 py-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mute">
          {t("yourNumber")}
        </p>
        <p className="mt-2 font-mono text-5xl font-bold tracking-tight text-gold-bright tabular-nums sm:text-6xl">
          {shown}
        </p>
        <p className="mt-1 text-sm text-mute">{t("unitHint")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bid-amount">{t("adjustLabel")}</Label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={disabled}
            aria-label={t("decreaseAria", { step: NUDGE_BIRR })}
            onClick={() => step(-NUDGE_BIRR)}
          >
            −
          </Button>
          <Input
            id="bid-amount"
            inputMode="decimal"
            step={BID_STEP_BIRR}
            min={BID_MIN_BIRR}
            max={BID_MAX_BIRR}
            className="font-mono text-center text-lg"
            value={raw}
            disabled={disabled}
            aria-invalid={!!error}
            onFocus={() => setEditing(true)}
            onChange={(e) => {
              const text = e.target.value;
              setRaw(text);
              setEditing(true);
              setError(null);
              pushIfValid(text);
            }}
            onBlur={() => commit(raw)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit(raw);
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="outline"
            disabled={disabled}
            aria-label={t("increaseAria", { step: NUDGE_BIRR })}
            onClick={() => step(NUDGE_BIRR)}
          >
            +
          </Button>
        </div>
        {error ? (
          <p className="text-xs text-danger" role="alert">
            {error}
          </p>
        ) : (
          <p className="text-xs text-mute">
            {t("rangeHint", { min: BID_MIN_BIRR, max: BID_MAX_BIRR })}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">{t("quickPicks")}</Label>
        <div className="flex flex-wrap gap-2">
          {QUICK_BIRR.map((b) => {
            const cents = Math.round(b * 100);
            const active = cents === valueCents;
            return (
              <button
                key={b}
                type="button"
                disabled={disabled}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-mono text-xs font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50",
                  active
                    ? "gold-fill border-transparent text-night"
                    : "border-line bg-cream-deep text-ink-soft hover:border-gold/50",
                )}
                onClick={() => {
                  onChange(cents);
                  setRaw(formatBidBirr(cents));
                  setEditing(false);
                  setError(null);
                }}
              >
                {b.toFixed(2)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { formatBidBirr } from "@bidclub/shared";
import { Card, CardContent, CardHeader, CardTitle, cn } from "@bidclub/ui";

type WinnerRevealProps = {
  name: string;
  amountCents: number;
  className?: string;
};

/**
 * Shown only once an auction's status is "closed". Reveals exactly one
 * number — the winning sealed bid — never the full ledger of bids.
 */
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function WinnerReveal({ name, amountCents, className }: WinnerRevealProps) {
  const t = useTranslations("WinnerReveal");
  const target = amountCents / 100;
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? target : 0));

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const frames = 36;
    let frame = 0;
    const id = window.setInterval(() => {
      frame += 1;
      setShown(Number(((target * frame) / frames).toFixed(2)));
      if (frame >= frames) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [target]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="gold-fill rounded-t-lg px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-night">
        {t("badge")}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-mute">{t("subtitle")}</p>
        <p className="font-mono text-4xl font-bold text-gold-bright sm:text-5xl">
          {shown.toFixed(2)}
          <span className="ml-2 text-base font-normal text-mute">ETB</span>
        </p>
        <p className="text-xs text-mute">
          {t("finalAmount", { amount: formatBidBirr(amountCents) })}
        </p>
      </CardContent>
    </Card>
  );
}

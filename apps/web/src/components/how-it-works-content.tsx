"use client";

import {
  BID_FEE_BIRR,
  BID_MAX_BIRR,
  DEFAULT_AUCTION_DURATION_DAYS,
  REGISTRATION_FEE_BIRR,
} from "@bidclub/shared";
import { KeyRound, Lock, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { PageEnter, Reveal, Stagger, StaggerItem } from "@/components/motion";

const STEP_ICONS = [KeyRound, Lock, Trophy];

/**
 * Shared "how it works" content — rendered both on the dedicated
 * /how-it-works page and inside the HowItWorksDialog.
 */
export function HowItWorksContent({ showTitle = true }: { showTitle?: boolean }) {
  const t = useTranslations("HowItWorks");
  const steps = t.raw("steps.items") as { title: string; body: string }[];

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <PageEnter className="space-y-3">
        {showTitle ? (
          <h1 className="font-serif text-4xl leading-tight text-ink sm:text-5xl">
            {t("title")}
          </h1>
        ) : null}
        <p className="text-base leading-relaxed text-ink-soft">
          {t("intro", {
            maxBid: BID_MAX_BIRR,
            bidFee: BID_FEE_BIRR,
            days: DEFAULT_AUCTION_DURATION_DAYS,
          })}
        </p>
      </PageEnter>

      <Reveal className="space-y-4">
        <p className="text-[11px] font-bold tracking-[0.2em] text-gold-dim uppercase">
          {t("steps.eyebrow")}
        </p>
        <Stagger as="ol" className="space-y-5">
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[i] ?? Lock;
            return (
              <StaggerItem
                as="li"
                key={step.title}
                className="flex gap-5 border-b border-line pb-5 last:border-b-0 last:pb-0"
              >
                <div className="flex shrink-0 flex-col items-center gap-2">
                  <motion.span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full gold-fill text-night shadow-[0_6px_18px_rgba(212,175,55,0.28)]"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 2.4 + i * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.15,
                    }}
                  >
                    <Icon className="size-5" aria-hidden />
                  </motion.span>
                  <span className="font-serif text-sm text-gold-dim">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="pt-1">
                  <h3 className="font-display text-xl font-bold leading-tight text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {step.body
                      .replace("{maxBid}", String(BID_MAX_BIRR))
                      .replace("{bidFee}", String(BID_FEE_BIRR))
                      .replace("{days}", String(DEFAULT_AUCTION_DURATION_DAYS))}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Reveal>

      <Reveal className="relative overflow-hidden rounded-[1.75rem] border border-line glass-panel p-6 sm:p-8">
        <h2 className="font-serif text-2xl text-ink">{t("example.title")}</h2>
        <p className="mt-3 text-[11px] font-bold tracking-[0.14em] text-gold-dim uppercase">
          {t("example.bidsLabel")}
        </p>
        <p className="mt-1 font-mono text-xl font-bold text-gold-bright tabular-nums">
          {t("example.bids")}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">{t("example.explanation")}</p>
      </Reveal>

      <Reveal className="space-y-2 border-t border-line pt-6 text-sm text-ink-soft">
        <p>{t("activateOnce", { registrationFee: REGISTRATION_FEE_BIRR })}</p>
        <p>{t("winnerPays", { amount: 4 })}</p>
      </Reveal>
    </div>
  );
}

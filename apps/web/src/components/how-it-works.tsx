"use client";

import Link from "next/link";
import {
  BID_FEE_BIRR,
  BID_MAX_BIRR,
  DEFAULT_AUCTION_DURATION_DAYS,
  REGISTRATION_FEE_BIRR,
} from "@bidclub/shared";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@bidclub/ui";
import { HowItWorksDialog } from "@/components/how-it-works-dialog";
import { Icon3d, type Icon3dName, type Icon3dMotion } from "@/components/icon-3d";
import { Stagger, StaggerItem } from "@/components/motion";

const STEP_ICONS: Icon3dName[] = ["rocket", "shield", "trophy"];
const STEP_MOTIONS: Icon3dMotion[] = ["bob", "pulse", "float"];

/**
 * Condensed how-it-works teaser — single panel with step columns.
 */
export function HowItWorks() {
  const t = useTranslations("HowItWorks");
  const steps = t.raw("steps.items") as { title: string; body: string }[];

  return (
    <section className="bc-card-pattern relative overflow-hidden rounded-2xl border border-line bg-white shadow-[0_12px_40px_rgba(16,18,16,0.05)] lg:rounded-[1.75rem]">
      <div className="relative z-[1] border-b border-line bg-gradient-to-br from-champagne/40 to-transparent px-5 py-5 sm:px-6 lg:px-10 lg:py-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-dim sm:text-xs">
          {t("title")}
        </p>
        <h2 className="font-display mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
          {t("steps.eyebrow")}
        </h2>
      </div>

      <Stagger
        as="ol"
        className="relative z-[1] divide-y divide-line lg:grid lg:grid-cols-3 lg:divide-x lg:divide-y-0"
      >
        {steps.map((step, i) => {
          const icon = STEP_ICONS[i] ?? "cube";
          return (
            <StaggerItem
              as="li"
              key={step.title}
              className="flex gap-4 px-5 py-5 sm:px-6 lg:flex-col lg:items-start lg:gap-4 lg:px-8 lg:py-9"
            >
              <Icon3d
                name={icon}
                size={72}
                className="size-14 shrink-0 sm:size-16"
                motion={STEP_MOTIONS[i] ?? "bob"}
                delay={i * 0.1}
              />
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold leading-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {step.body
                    .replace("{maxBid}", String(BID_MAX_BIRR))
                    .replace("{bidFee}", String(BID_FEE_BIRR))
                    .replace("{days}", String(DEFAULT_AUCTION_DURATION_DAYS))
                    .replace("{registrationFee}", String(REGISTRATION_FEE_BIRR))}
                </p>
              </div>
            </StaggerItem>
          );
        })}
      </Stagger>

      <div className="relative z-[1] flex flex-wrap items-center gap-3 border-t border-line bg-champagne/10 px-5 py-4 sm:px-6">
        <HowItWorksDialog
          trigger={
            <Button size="sm" variant="outline">
              {t("example.title")}
            </Button>
          }
        />
        <Button asChild size="sm" variant="ghost" className="gap-1.5">
          <Link href="/how-it-works">
            {t("title")}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </Button>
      </div>
    </section>
  );
}

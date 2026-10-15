"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DEFAULT_AUCTION_DURATION_DAYS } from "@bidclub/shared";
import { useTranslations } from "next-intl";
import { Button } from "@bidclub/ui";
import { Reveal } from "@/components/motion";

/**
 * Full-width lime CTA with PageBackdrop-style curves + hairlines.
 */
export function HomeCtaBand() {
  const t = useTranslations("Home.ctaBand");

  return (
    <Reveal
      as="section"
      className="relative flex min-h-[16rem] w-full flex-col overflow-hidden rounded-2xl gold-fill px-6 py-8 sm:min-h-[18rem] sm:px-8 sm:py-10 lg:min-h-[20rem] lg:rounded-[2rem] lg:px-12 lg:py-12 xl:min-h-[22rem] xl:py-14"
    >
      {/* Hairlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              -18deg,
              transparent 0,
              transparent 18px,
              rgba(20, 22, 20, 0.06) 18px,
              rgba(20, 22, 20, 0.06) 19px
            ),
            repeating-linear-gradient(
              72deg,
              transparent 0,
              transparent 40px,
              rgba(255, 255, 255, 0.14) 40px,
              rgba(255, 255, 255, 0.14) 41px
            )
          `,
        }}
      />

      {/* Curved strokes */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1440 420"
      >
        <path
          d="M-40,70 C220,10 480,140 760,55 S1200,20 1500,90"
          fill="none"
          stroke="rgba(20,22,20,0.12)"
          strokeWidth="1.5"
        />
        <path
          d="M-60,170 C260,90 520,250 820,150 S1280,130 1520,220"
          fill="none"
          stroke="rgba(255,255,255,0.32)"
          strokeWidth="1.25"
        />
        <path
          d="M-20,300 C300,220 560,360 900,270 S1320,260 1540,340"
          fill="none"
          stroke="rgba(20,22,20,0.09)"
          strokeWidth="1.2"
        />
        <path
          d="M80,-20 C160,120 100,240 220,380"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1"
        />
        <path
          d="M1280,-30 C1180,110 1340,220 1200,380"
          fill="none"
          stroke="rgba(20,22,20,0.08)"
          strokeWidth="1"
        />
      </svg>

      <div className="pointer-events-none absolute -left-10 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-white/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-night/10 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-night/70">
            {t("eyebrow")}
          </p>
          <h2 className="font-display mt-2 text-2xl font-extrabold text-night sm:text-3xl lg:text-5xl">
            {t("title")}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-night/80 sm:mt-4 lg:text-base">
            {t("body", { days: DEFAULT_AUCTION_DURATION_DAYS })}
          </p>
        </div>

        <motion.div
          className="mt-auto flex w-full justify-center pt-6 sm:pt-8"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.45 }}
        >
          <Button asChild size="lg" variant="secondary">
            <Link href="/arenas">{t("cta")}</Link>
          </Button>
        </motion.div>
      </div>
    </Reveal>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BID_FEE_BIRR,
  BID_MAX_BIRR,
  DEFAULT_AUCTION_DURATION_DAYS,
  REGISTRATION_FEE_BIRR,
} from "@bidclub/shared";
import { useTranslations } from "next-intl";
import { Button, Separator } from "@bidclub/ui";
import { HomeCtaBand } from "@/components/home-cta-band";
import { HowItWorks } from "@/components/how-it-works";
import { Icon3d, type Icon3dName, type Icon3dMotion } from "@/components/icon-3d";
import { LiveArenasGrid } from "@/components/live-arenas-grid";
import { AuctionCard } from "@/components/auction-card";
import {
  PageEnter,
  Reveal,
  Stagger,
  StaggerItem,
  fadeUp,
  scaleIn,
} from "@/components/motion";
import { getErrorMessage } from "@/lib/errors";
import { useGetAuctionsQuery, useGetProfileQuery } from "@/store/api";

const PILLAR_ICONS: Icon3dName[] = ["cube", "shield", "clock"];
const PRIZE_LANE_ICONS: Icon3dName[] = ["headphone", "giftBox", "trophy"];
const FACT_ICONS: Icon3dName[] = ["money", "rocket", "clock"];
const FACT_MOTIONS: Icon3dMotion[] = ["float", "bob", "spin"];
const PLAYBOOK_ICONS: Icon3dName[] = ["bulb", "notebook", "wallet", "clock"];

export default function HomePage() {
  const t = useTranslations("Home");
  const { data: auctions, isLoading, error, isError } = useGetAuctionsQuery();
  const { data: profile } = useGetProfileQuery();

  const live = auctions?.filter((a) => a.status === "active") ?? [];
  const decided = auctions?.filter((a) => a.status === "closed") ?? [];

  const joinHref = !profile
    ? "/signup"
    : !profile.registration_paid_at
      ? "/register-pay"
      : "/profile";
  const joinLabel = !profile
    ? t("hero.ctaJoin")
    : !profile.registration_paid_at
      ? t("hero.ctaActivate")
      : t("hero.ctaOpenSeat");

  const pillars = t.raw("pillars.items") as { title: string; body: string }[];
  const prizeLanes = t.raw("prizeLanes.items") as { label: string; hint: string }[];
  const playbookTips = t.raw("playbook.tips") as string[];
  const faqItems = t.raw("faq.items") as { q: string; a: string }[];

  const quickFacts = [
    { k: t("stats.feesFrom"), v: `${BID_FEE_BIRR}`, unit: t("stats.etbUnit"), icon: FACT_ICONS[0]! },
    { k: t("stats.activate"), v: `${REGISTRATION_FEE_BIRR}`, unit: t("stats.etbUnit"), icon: FACT_ICONS[1]! },
    { k: t("stats.timer"), v: `${DEFAULT_AUCTION_DURATION_DAYS}`, unit: t("stats.daysUnit"), icon: FACT_ICONS[2]! },
  ];

  function fill(text: string) {
    return text
      .replace("{days}", String(DEFAULT_AUCTION_DURATION_DAYS))
      .replace("{maxBid}", String(BID_MAX_BIRR))
      .replace("{registrationFee}", String(REGISTRATION_FEE_BIRR))
      .replace("{bidFee}", String(BID_FEE_BIRR));
  }

  return (
    <div className="overflow-x-clip">
      {/* ——— HERO ——— */}
      <section className="relative isolate w-full overflow-hidden">
        <div className="relative min-h-[78dvh] w-full sm:min-h-[72dvh] lg:min-h-[98dvh]">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.06, opacity: 0.85 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/images/hero1.png"
              alt=""
              fill
              priority
              quality={100}
              sizes="100vw"
              className="rounded-lg object-cover object-center"
            />
          </motion.div>

          <motion.p
            aria-hidden
            className="pointer-events-none absolute -left-4 top-[16%] z-[1] select-none font-display text-[18vw] font-extrabold leading-none tracking-tighter text-ink/[0.06] sm:top-[12%] sm:text-[14vw] lg:left-6 lg:text-[9rem] xl:text-[11rem]"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            BidClub
          </motion.p>

          <div className="relative z-[1] flex min-h-[78dvh] items-end px-4 pt-28 pb-10 sm:min-h-[72dvh] sm:px-6 sm:pb-14 lg:min-h-[84dvh] lg:items-center lg:px-8 lg:pb-0">
            <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
              <PageEnter className="bc-card-pattern max-w-xl rounded-[1.75rem] border border-line/80 bg-white/85 p-5 shadow-[0_24px_80px_rgba(16,18,16,0.08)] backdrop-blur-xl sm:p-7 lg:max-w-2xl lg:p-8">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-1.5 rounded-full gold-fill" aria-hidden />
                  <p className="font-display text-sm font-bold tracking-[0.22em] text-gold-dim uppercase">
                    BidClub
                  </p>
                </div>
                <h1 className="font-display mt-4 max-w-[16ch] text-[2.15rem] font-bold leading-[1.05] text-ink sm:text-4xl lg:text-5xl xl:text-[3.35rem]">
                  {t("hero.title")}
                </h1>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft sm:text-base">
                  {t("hero.subtitle", { days: DEFAULT_AUCTION_DURATION_DAYS })}
                </p>
                <motion.div
                  className="mt-6 flex flex-col gap-2.5 sm:flex-row"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.45 }}
                >
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href={joinHref}>{joinLabel}</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="w-full border-ink/15 bg-white/80 text-ink sm:w-auto"
                  >
                    <Link href="/arenas">{t("hero.ctaBrowse")}</Link>
                  </Button>
                </motion.div>
              </PageEnter>

              <motion.div
                className="bc-card-pattern relative hidden max-w-xs rounded-[1.5rem] border border-line bg-white/85 p-5 shadow-[0_16px_48px_rgba(16,18,16,0.08)] backdrop-blur-md lg:block"
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.55 }}
              >
                <Icon3d name="trophy" size={64} className="size-14" motion="float" />
                <p className="font-display mt-3 text-lg font-bold leading-snug text-ink">
                  {t("hero.asideTitle")}
                </p>
                <p className="mt-1.5 text-sm text-ink-soft">{t("hero.asideBody")}</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-16 px-4 pt-14 sm:px-6 lg:space-y-20 lg:px-8 lg:pt-20">
        {/* Pillars */}
        <Reveal as="section" className="space-y-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.18em] text-gold-dim uppercase">
              {t("pillars.eyebrow")}
            </p>
            <h2 className="font-display mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
              {t("pillars.title")}
            </h2>
          </div>
          <Stagger className="grid gap-4 md:grid-cols-3">
            {pillars.map((item, i) => (
              <StaggerItem
                key={item.title}
                className="bc-card-pattern flex flex-col items-center rounded-2xl border border-line bg-white px-5 py-6 text-center shadow-[0_10px_32px_rgba(16,18,16,0.05)] md:p-7"
              >
                <Icon3d
                  name={PILLAR_ICONS[i] ?? "cube"}
                  size={72}
                  className="size-14 md:size-16"
                  motion="bob"
                  delay={i * 0.08}
                />
                <h3 className="font-display mt-4 text-lg font-bold text-ink">
                  {fill(item.title)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{item.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </Reveal>

        {/* Live arenas */}
        <Reveal as="section" id="live-auctions" className="scroll-mt-20 space-y-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] text-gold-dim uppercase">
                {t("liveSection.eyebrow")}
              </p>
              <h2 className="font-display mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
                {t("liveSection.title")}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {live.length > 0 && (
                <span className="rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-gold-bright">
                  {t("liveSection.liveBadge", { count: live.length })}
                </span>
              )}
              <Button asChild size="sm" variant="outline">
                <Link href="/arenas">{t("liveSection.filterAll")}</Link>
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[260px] animate-pulse rounded-2xl border border-line bg-cream-deep sm:h-[300px]"
                />
              ))}
            </div>
          )}

          {isError && (
            <div className="bc-card-pattern rounded-2xl border border-line bg-white p-5">
              <p className="font-display text-lg font-bold text-ink">
                {t("liveSection.errorTitle")}
              </p>
              <p className="mt-1.5 text-sm text-ink-soft">
                {t("liveSection.errorBody", {
                  error: getErrorMessage(error, "Connection error."),
                })}
              </p>
            </div>
          )}

          {!isLoading && !isError && live.length === 0 && (
            <div className="bc-card-pattern rounded-2xl border border-line bg-white px-5 py-12 text-center">
              <Icon3d name="clock" size={72} className="mx-auto size-16" motion="spin" />
              <p className="font-display mt-3 text-xl font-bold text-ink">
                {t("liveSection.emptyTitle")}
              </p>
              <p className="mx-auto mt-2 max-w-xs text-sm text-ink-soft">
                {t("liveSection.emptyBody")}
              </p>
              <Button asChild size="sm" className="mt-5">
                <Link href={joinHref}>{joinLabel}</Link>
              </Button>
            </div>
          )}

          {live.length > 0 && <LiveArenasGrid auctions={live} />}
        </Reveal>

        {/* Quick facts — 75 ETB / 100 ETB / 20 days */}
        <Stagger
          as="section"
          className="grid grid-cols-3 gap-2 sm:gap-4"
          amount={0.3}
        >
          {quickFacts.map((stat, i) => (
            <StaggerItem
              key={stat.k}
              variants={scaleIn}
              className="px-1 py-2 text-center sm:px-2 sm:py-3"
            >
              <Icon3d
                name={stat.icon}
                size={80}
                className="mx-auto size-12 bg-transparent sm:size-16 md:size-[4.5rem]"
                motion={FACT_MOTIONS[i] ?? "float"}
                delay={i * 0.12}
              />
              <p className="mt-2 font-mono text-base font-bold text-ink sm:mt-3 sm:text-2xl md:text-3xl">
                {stat.v}
                <span className="ml-0.5 text-[9px] font-semibold text-mute sm:ml-1 sm:text-xs md:text-sm">
                  {stat.unit}
                </span>
              </p>
              <p className="mt-0.5 text-[9px] font-bold tracking-[0.12em] text-mute uppercase sm:mt-1 sm:text-[11px] sm:tracking-[0.16em]">
                {stat.k}
              </p>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Prize lanes */}
        <Reveal as="section" className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.18em] text-gold-dim uppercase">
                {t("prizeLanes.eyebrow")}
              </p>
              <h2 className="font-display mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
                {t("prizeLanes.title")}
              </h2>
            </div>
            <Button asChild size="sm" variant="ghost" className="self-start sm:self-auto">
              <Link href="/winners">{t("prizeLanes.winnersCta")}</Link>
            </Button>
          </div>
          <Stagger className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {prizeLanes.map((lane, i) => (
              <StaggerItem
                key={lane.label}
                className="bc-card-pattern flex flex-col items-center justify-center rounded-[1.25rem] border border-line bg-white px-4 py-4 text-center shadow-[0_10px_28px_rgba(16,18,16,0.05)] sm:px-5 sm:py-5"
              >
                <Icon3d
                  name={PRIZE_LANE_ICONS[i] ?? "cube"}
                  size={64}
                  className="size-12 sm:size-14"
                  motion="bob"
                  delay={i * 0.1}
                />
                <p className="font-display mt-2.5 text-base font-bold text-ink">{lane.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{lane.hint}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </Reveal>

        {decided.length > 0 && (
          <Reveal as="section" className="space-y-5">
            <div className="flex items-end justify-between">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {t("recentlyDecided.title")}
              </h2>
              <Button asChild size="sm" variant="outline">
                <Link href="/winners">{t("recentlyDecided.allWinners")}</Link>
              </Button>
            </div>
            <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
              {decided.slice(0, 4).map((auction) => (
                <StaggerItem key={auction.id} variants={fadeUp}>
                  <AuctionCard auction={auction} />
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>
        )}

        <Reveal className="scroll-mt-20" id="how-it-works">
          <HowItWorks />
        </Reveal>

        {/* Playbook */}
        <Reveal as="section" className="space-y-6">
          <div className="text-left">
            <p className="text-[11px] font-bold tracking-[0.18em] text-gold-dim uppercase">
              {t("playbook.eyebrow")}
            </p>
            <h2 className="font-display mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
              {t("playbook.title")}
            </h2>
          </div>
          <Stagger as="ol" className="grid gap-3 sm:grid-cols-2 lg:gap-4">
            {playbookTips.map((tip, i) => (
              <StaggerItem
                as="li"
                key={tip}
                className="bc-card-pattern relative flex min-h-[8.5rem] gap-4 rounded-[1.35rem] border border-line bg-white px-5 py-7 shadow-[0_10px_32px_rgba(16,18,16,0.05)] sm:min-h-[9.5rem] sm:gap-5 sm:px-6 sm:py-8 lg:px-7 lg:py-9"
              >
                <span
                  aria-hidden
                  className="font-display absolute -top-3 -right-1 z-[1] text-6xl font-extrabold text-gold/25 tabular-nums sm:text-7xl"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon3d
                  name={PLAYBOOK_ICONS[i] ?? "bulb"}
                  size={64}
                  className="relative z-[1] size-12 shrink-0 sm:size-14"
                  motion="pulse"
                  delay={i * 0.06}
                />
                <p className="relative z-[1] flex-1 text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
                  {fill(tip)}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </Reveal>

        {/* FAQ */}
        <Reveal as="section" className="space-y-5">
          <div className="text-left">
            <p className="text-[11px] font-bold tracking-[0.18em] text-gold-dim uppercase">
              {t("faq.eyebrow")}
            </p>
            <h2 className="font-display mt-1.5 text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
              {t("faq.title")}
            </h2>
          </div>
          <div className="bc-card-pattern overflow-hidden rounded-2xl border border-line bg-white shadow-[0_12px_40px_rgba(16,18,16,0.05)]">
            <div className="relative z-[1] divide-y divide-line md:grid md:grid-cols-2 md:divide-x md:divide-y-0">
              {faqItems.map((item, i) => (
                <motion.details
                  key={item.q}
                  className="group border-b border-line px-5 py-5 text-left last:border-b-0 md:border-b md:odd:border-r lg:px-8 lg:py-6"
                  open={i === 0}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 text-left text-base font-semibold leading-snug text-ink sm:text-[1.05rem]">
                    <span className="flex-1">{item.q}</span>
                    <span className="mt-0.5 shrink-0 text-mute transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-left text-[0.95rem] leading-7 text-ink-soft sm:text-base sm:leading-8">
                    {fill(item.a)}
                  </p>
                </motion.details>
              ))}
            </div>
          </div>
        </Reveal>

        <Separator className="bg-line" />

        <HomeCtaBand />
      </div>
    </div>
  );
}

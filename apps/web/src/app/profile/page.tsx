"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  REGISTRATION_FEE_BIRR,
  formatBidBirr,
  resolveBidFeeBirr,
} from "@bidclub/shared";
import {
  ArrowUpRight,
  Gavel,
  LogOut,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react";
import { Badge, Button } from "@bidclub/ui";
import { PageEnter, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { createClient } from "@/lib/supabase/client";
import {
  useGetMyBidHistoryQuery,
  useGetMyPaymentsQuery,
  useGetProfileQuery,
} from "@/store/api";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

function memberSince(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

function LoadingState() {
  return (
    <div className="space-y-4 px-4 pt-6 sm:px-6 lg:px-8">
      <div className="h-48 animate-pulse rounded-2xl bg-cream-deep" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-cream-deep" />
        ))}
      </div>
    </div>
  );
}

function SignedOutState() {
  const t = useTranslations("Profile.signedOut");
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 pb-10 pt-10 sm:px-6">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-line glass-panel p-8 text-center">
        <ShieldCheck className="relative mx-auto size-10 text-gold-bright" aria-hidden />
        <h1 className="font-display relative mt-4 text-3xl font-extrabold text-ink">
          {t("title")}
        </h1>
        <p className="relative mx-auto mt-2 max-w-sm text-sm text-mute">{t("body")}</p>
        <div className="relative mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/login?next=/profile">{t("login")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/signup">{t("createAccount")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const router = useRouter();
  const { data: profile, isLoading, isError } = useGetProfileQuery();
  const { data: bids } = useGetMyBidHistoryQuery(undefined, { skip: !profile });
  const { data: payments } = useGetMyPaymentsQuery(undefined, { skip: !profile });

  if (isLoading) return <LoadingState />;
  if (isError || !profile) return <SignedOutState />;

  const paid = !!profile.registration_paid_at;
  const joined = memberSince(profile.created_at);
  const bidCount = bids?.length ?? 0;
  const arenasTouched = new Set(bids?.map((b) => b.auction_id) ?? []).size;
  const spentOnBids =
    payments
      ?.filter((p) => p.type === "bid" && p.status === "mock_completed")
      .reduce((sum, p) => sum + Number(p.amount_birr), 0) ?? 0;

  async function signOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="space-y-8 px-4 pt-8 pb-10 sm:px-6 lg:px-8 lg:pt-14">
      <PageEnter>
      <header className="relative flex min-h-[13.5rem] flex-col overflow-hidden rounded-[1.75rem] gold-fill sm:min-h-[15rem]">
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
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          viewBox="0 0 1440 280"
        >
          <path
            d="M-40,50 C220,10 480,110 760,45 S1200,20 1500,70"
            fill="none"
            stroke="rgba(20,22,20,0.12)"
            strokeWidth="1.5"
          />
          <path
            d="M-60,140 C260,70 520,200 820,120 S1280,100 1520,180"
            fill="none"
            stroke="rgba(255,255,255,0.32)"
            strokeWidth="1.25"
          />
          <path
            d="M80,-10 C160,90 100,180 220,290"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />
          <path
            d="M1280,-20 C1180,90 1340,170 1200,290"
            fill="none"
            stroke="rgba(20,22,20,0.08)"
            strokeWidth="1"
          />
        </svg>
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-white/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-night/10 blur-3xl"
        />

        <div className="relative flex flex-1 flex-col justify-between gap-6 p-5 sm:p-7 lg:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white font-display text-2xl font-extrabold text-night shadow-[0_10px_28px_rgba(16,18,16,0.12)] sm:h-20 sm:w-20">
              {initials(profile.display_name)}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-night/65">
                {t("seat.eyebrow")}
              </p>
              <h1 className="font-display text-2xl font-extrabold text-night sm:text-3xl">
                {profile.display_name}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {paid ? (
                  <Badge variant="live">{t("seat.activated")}</Badge>
                ) : (
                  <Badge variant="closed">{t("seat.inactive")}</Badge>
                )}
                {joined && (
                  <span className="text-xs text-night/55">
                    {t("seat.since", { date: joined })}
                  </span>
                )}
                {profile.email && (
                  <span className="text-xs text-night/55">{profile.email}</span>
                )}
                {profile.phone && (
                  <span className="text-xs text-night/55">
                    {t("seat.phoneLabel")}: {profile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap justify-end gap-2">
            {!paid ? (
              <Button
                asChild
                size="sm"
                className="bg-white text-night hover:bg-white/90"
              >
                <Link href="/register-pay">
                  {t("seat.activate", { fee: REGISTRATION_FEE_BIRR })}
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                className="bg-white text-night hover:bg-white/90"
              >
                <Link href="/arenas">
                  <Gavel className="size-4" aria-hidden />
                  {t("seat.browseArenas")}
                </Link>
              </Button>
            )}
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-night/20 bg-white/40 text-night hover:bg-white/70"
            >
              <Link href="/winners">
                <Trophy className="size-4" aria-hidden />
                {t("seat.winners")}
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-night hover:bg-night/10"
              onClick={signOut}
            >
              <LogOut className="size-4" aria-hidden />
              {t("seat.signOut")}
            </Button>
          </div>
        </div>
      </header>
      </PageEnter>

      <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: t("stats.sealedBids"), value: String(bidCount), Icon: Sparkles },
          { label: t("stats.arenasPlayed"), value: String(arenasTouched), Icon: Gavel },
          {
            label: t("stats.bidSpend"),
            value: `${Math.round(spentOnBids)}`,
            unit: "ETB",
            Icon: Wallet,
          },
          {
            label: t("stats.seatFee"),
            value: paid ? t("stats.paid") : String(REGISTRATION_FEE_BIRR),
            unit: paid ? undefined : "ETB",
            Icon: ShieldCheck,
          },
        ].map((stat) => (
          <StaggerItem
            key={stat.label}
            className="relative overflow-hidden rounded-[1.5rem] border border-line glass-panel px-4 py-5"
          >
            <stat.Icon className="relative size-4 text-gold-bright" aria-hidden />
            <p className="relative mt-2 font-mono text-xl font-bold text-gold-bright">
              {stat.value}
              {stat.unit && (
                <span className="ml-1 text-[10px] font-semibold text-mute">{stat.unit}</span>
              )}
            </p>
            <p className="relative mt-0.5 text-[10px] font-semibold tracking-[0.14em] text-mute uppercase">
              {stat.label}
            </p>
          </StaggerItem>
        ))}
      </Stagger>

      {!paid && (
        <Reveal className="flex flex-col gap-3 rounded-[1.5rem] border border-gold/30 bg-champagne/20 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-lg font-bold text-ink">{t("activateBanner.title")}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {t("activateBanner.body", { fee: REGISTRATION_FEE_BIRR })}
            </p>
          </div>
          <Button asChild>
            <Link href="/register-pay">{t("activateBanner.cta")}</Link>
          </Button>
        </Reveal>
      )}

      <Reveal as="section" className="rounded-[1.75rem] border border-line glass-panel">
        <div className="flex items-center justify-between border-b border-line px-4 py-4 sm:px-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-dim">
              {t("activity.eyebrow")}
            </p>
            <h2 className="font-display text-xl font-bold text-ink">{t("activity.title")}</h2>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/arenas">
              {t("activity.more")}
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </Button>
        </div>
        <div className="divide-y divide-line">
          {!bids?.length ? (
            <div className="px-5 py-10 text-center">
              <Sparkles className="mx-auto size-7 text-gold-bright/60" aria-hidden />
              <p className="mt-2 text-sm font-semibold text-ink">{t("activity.emptyTitle")}</p>
              <p className="mt-1 text-xs text-mute">{t("activity.emptyBody")}</p>
              <Button asChild size="sm" className="mt-4">
                <Link href="/arenas">{t("activity.browse")}</Link>
              </Button>
            </div>
          ) : (
            bids.slice(0, 8).map((bid) => {
              const fee = resolveBidFeeBirr(bid.auction?.bid_fee_birr);
              return (
                <Link
                  key={bid.id}
                  href={`/auctions/${bid.auction_id}`}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-cream-deep/50 sm:px-5"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream-deep">
                    {bid.auction?.image_url ? (
                      <Image
                        src={bid.auction.image_url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Gavel className="size-4 text-mute" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {bid.auction?.title ?? t("activity.fallbackTitle")}
                    </p>
                    <p className="text-[11px] text-mute">
                      {new Date(bid.created_at).toLocaleString()} ·{" "}
                      {t("activity.feeNote", { fee })}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-gold-bright">
                    {formatBidBirr(bid.amount_cents)}
                  </span>
                </Link>
              );
            })
          )}
        </div>
      </Reveal>
    </div>
  );
}

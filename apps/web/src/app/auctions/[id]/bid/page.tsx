"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { formatBidBirr, resolveBidFeeBirr } from "@bidclub/shared";
import { ChevronLeft, Sparkles, Ticket } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  cn,
} from "@bidclub/ui";
import { BidPicker } from "@/components/bid-picker";
import { FlipCountdown } from "@/components/flip-countdown";
import { PageEnter, Reveal } from "@/components/motion";
import { ProductGallery } from "@/components/product-gallery";
import { ProductSpecs } from "@/components/product-specs";
import { WinnerReveal } from "@/components/winner-reveal";
import { YourBidsPanel } from "@/components/your-bids-panel";
import { getErrorMessage } from "@/lib/errors";
import {
  useGetAuctionQuery,
  useGetMyBidsQuery,
  useGetProfileQuery,
  usePlaceBidMutation,
} from "@/store/api";

const DEFAULT_BID_CENTS = 100;

/**
 * UniteCar-style bid room: title + fee chip, gallery + bid rail,
 * then Your Bids + Product Overview below.
 */
export default function AuctionBidPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("AuctionBid");
  const td = useTranslations("AuctionDetail");
  const { data: auction, isLoading, error } = useGetAuctionQuery(id);
  const { data: myBids } = useGetMyBidsQuery(id);
  const { data: profile } = useGetProfileQuery();
  const [placeBid, { isLoading: bidding }] = usePlaceBidMutation();

  const [amountCents, setAmountCents] = useState(DEFAULT_BID_CENTS);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [justBid, setJustBid] = useState(false);

  useEffect(() => {
    if (!justBid) return;
    const timeout = window.setTimeout(() => setJustBid(false), 2400);
    return () => window.clearTimeout(timeout);
  }, [justBid]);

  async function confirmBid() {
    setBidError(null);
    const result = await placeBid({ auctionId: id, amountCents });
    if ("error" in result && result.error) {
      setBidError(getErrorMessage(result.error, t("bidFailed")));
      return;
    }
    setConfirmOpen(false);
    setJustBid(true);
  }

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pt-6 sm:px-6 lg:px-8">
        <div className="h-12 w-2/3 animate-pulse rounded-full bg-cream-deep" />
        <div className="h-72 animate-pulse rounded-[1.5rem] bg-cream-deep" />
        <div className="h-40 animate-pulse rounded-[1.5rem] bg-cream-deep" />
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="space-y-4 px-4 pt-6 sm:px-6">
        <p className="text-sm text-danger">{td("notFound")}</p>
        <Button asChild variant="outline">
          <Link href="/arenas">{td("back")}</Link>
        </Button>
      </div>
    );
  }

  const isActive = auction.status === "active";
  const isClosed = auction.status === "closed";
  const hasWinner = isClosed && auction.winner && auction.winning_amount_cents != null;
  const canBid = isActive && !!profile?.registration_paid_at;
  const fee = resolveBidFeeBirr(auction.bid_fee_birr);
  const showFloatDock = isActive;

  return (
    <PageEnter
      className={cn(
        "space-y-5 px-4 pt-4 pb-8 sm:space-y-6 sm:px-5 lg:px-4 xl:px-6",
        showFloatDock && "pb-32 md:pb-8",
      )}
    >
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 pl-2 text-xs text-mute sm:pl-3 lg:pl-4"
      >
        <Link href="/" className="transition hover:text-ink">
          {td("crumbs.home")}
        </Link>
        <span aria-hidden>/</span>
        <Link href="/arenas" className="transition hover:text-ink">
          {td("crumbs.arenas")}
        </Link>
        <span aria-hidden>/</span>
        <span className="max-w-[12rem] truncate text-ink-soft sm:max-w-none">{auction.title}</span>
      </nav>

      {/* Back + title + bid fee */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-5 pl-2 sm:gap-6 sm:pl-3 lg:pl-4">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 rounded-full border border-line bg-white shadow-[0_6px_20px_rgba(16,18,16,0.06)] hover:bg-cream-deep"
          >
            <Link href="/arenas" aria-label={td("back")}>
              <ChevronLeft className="size-5" aria-hidden />
            </Link>
          </Button>
          <h1 className="font-display min-w-0 text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl lg:text-4xl">
            {auction.title}
          </h1>
        </div>

        <div
          className="inline-flex shrink-0 items-center gap-2.5 self-end pr-1 sm:self-auto sm:pr-0"
          title={t("feeChip.hint")}
        >
          <span className="flex size-9 items-center justify-center rounded-full gold-fill text-night">
            <Ticket className="size-4" aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mute">
              {td("bidFeeLabel")}
            </p>
            <p className="font-display text-base font-bold tabular-nums text-ink sm:text-lg">
              {fee} <span className="text-sm font-semibold text-mute">ETB</span>
            </p>
          </div>
        </div>
      </div>

      {/*
        Mobile: gallery → overview → countdown/bid → your bids
        Desktop: gallery + your bids | countdown + bid; overview full width below
      */}
      <Reveal className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(26rem,34rem)] lg:items-start lg:gap-x-8 lg:gap-y-5">
        <div className="order-1 space-y-5 lg:col-start-1 lg:row-start-1">
          <ProductGallery auction={auction} size="hero" priority />
          {hasWinner && (
            <WinnerReveal
              name={auction.winner!.display_name}
              amountCents={auction.winning_amount_cents!}
            />
          )}
        </div>

        <ProductSpecs
          auction={auction}
          className="order-2 lg:order-none lg:col-span-2 lg:row-start-3"
        />

        <aside className="order-3 min-w-0 space-y-4 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start">
          <FlipCountdown
            endsAt={auction.ends_at}
            createdAt={auction.created_at}
            status={auction.status}
          />

          <section
            id="place-bid"
            className={cn(
              "rounded-[1.5rem] bg-white p-5 shadow-[0_16px_48px_rgba(16,18,16,0.08)] sm:p-6",
              justBid && "ring-2 ring-success/35",
            )}
          >
            <h2 className="font-display text-xl font-bold text-ink">{t("title")}</h2>
            <p className="mt-1 text-sm text-ink-soft">{t("feeNote", { fee })}</p>

            <div className="mt-5 space-y-4">
              {justBid && (
                <div className="rounded-xl bg-success/10 px-3 py-2.5 text-sm text-success">
                  {t("bidLocked")}
                </div>
              )}

              {!profile && (
                <p className="text-sm text-ink-soft">
                  <Link href="/login" className="font-semibold text-gold-bright hover:underline">
                    {t("loginPrompt")}
                  </Link>{" "}
                  {t("loginSuffix")}
                </p>
              )}

              {profile && !profile.registration_paid_at && (
                <Button asChild className="w-full rounded-2xl" size="lg">
                  <Link href="/register-pay">{t("activateCta")}</Link>
                </Button>
              )}

              {isClosed && <p className="text-sm text-danger">{t("closedNotice")}</p>}

              {canBid && (
                <>
                  <BidPicker
                    valueCents={amountCents}
                    onChange={setAmountCents}
                    disabled={bidding}
                  />
                  <Button
                    className="w-full rounded-2xl"
                    size="lg"
                    disabled={bidding}
                    onClick={() => setConfirmOpen(true)}
                  >
                    <Ticket className="size-4" aria-hidden />
                    {t("bidNow", { amount: formatBidBirr(amountCents) })}
                  </Button>
                  {bidError && <p className="text-sm text-danger">{bidError}</p>}
                </>
              )}
            </div>
          </section>
        </aside>

        <YourBidsPanel
          bids={myBids}
          className="order-4 lg:order-none lg:col-start-1 lg:row-start-2"
        />
      </Reveal>

      {showFloatDock && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 px-3 md:hidden">
          <div className="mx-auto flex max-w-lg items-stretch gap-2">
            <div className="pointer-events-auto shrink-0">
              <FlipCountdown
                endsAt={auction.ends_at}
                createdAt={auction.created_at}
                status={auction.status}
                compact
              />
            </div>
            {canBid ? (
              <div className="pointer-events-auto flex min-w-0 flex-1 items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-[0_12px_40px_rgba(16,18,16,0.12)]">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-mute">
                    {t("dock.sealedFee", { fee })}
                  </p>
                  <p className="font-mono text-lg font-bold tabular-nums text-ink">
                    {formatBidBirr(amountCents)} ETB
                  </p>
                </div>
                <Button size="lg" className="rounded-xl" disabled={bidding} onClick={() => setConfirmOpen(true)}>
                  {t("dock.bid")}
                </Button>
              </div>
            ) : (
              <div className="pointer-events-auto flex min-w-0 flex-1 items-center rounded-2xl bg-white px-3 py-2 text-sm shadow-[0_12px_40px_rgba(16,18,16,0.12)]">
                <Link
                  href={!profile ? "/login" : "/register-pay"}
                  className="font-semibold text-gold-bright"
                >
                  {!profile ? t("dock.loginCta") : t("dock.activateCta")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmDialog.title")}</DialogTitle>
            <DialogDescription>
              {t("confirmDialog.description", { fee, amount: formatBidBirr(amountCents) })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={bidding}>
              {t("confirmDialog.cancel")}
            </Button>
            <Button onClick={confirmBid} disabled={bidding}>
              {bidding ? (
                t("confirmDialog.locking")
              ) : (
                <>
                  <Sparkles className="size-4" aria-hidden />
                  {t("confirmDialog.confirm", { fee })}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageEnter>
  );
}

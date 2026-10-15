"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  BID_MAX_BIRR,
  DEFAULT_AUCTION_DURATION_DAYS,
  resolveBidFeeBirr,
  type Auction,
} from "@bidclub/shared";
import { Ticket } from "lucide-react";
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  LiveStrip,
} from "@bidclub/ui";
import {
  TERMS_SECTIONS as TERMS_SECTIONS_AM,
  TERMS_TITLE as TERMS_TITLE_AM,
} from "@/content/terms-am";
import {
  TERMS_SECTIONS as TERMS_SECTIONS_EN,
  TERMS_TITLE as TERMS_TITLE_EN,
} from "@/content/terms-en";

type AuctionDetailDrawerProps = {
  auction: Auction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Terms gate drawer — product summary, expandable terms, agree CTA.
 */
export function AuctionDetailDrawer({
  auction,
  open,
  onOpenChange,
}: AuctionDetailDrawerProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("AuctionDetail");
  const tTerms = useTranslations("Terms");
  const [accepted, setAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const isActive = auction.status === "active";
  const isClosed = auction.status === "closed";
  const fee = resolveBidFeeBirr(auction.bid_fee_birr);

  const termsTitle = locale === "am" ? TERMS_TITLE_AM : TERMS_TITLE_EN;
  const termsSections = locale === "am" ? TERMS_SECTIONS_AM : TERMS_SECTIONS_EN;

  const termsLinkText = tTerms("termsLinkText");
  const acceptParts = tTerms("acceptLabel", { termsLink: termsLinkText }).split(
    termsLinkText,
  );

  const specs = [
    { label: t("specs.condition"), value: t("specValues.conditionNew") },
    { label: t("specs.deliveryLocation"), value: t("specValues.deliveryEthiopia") },
    { label: t("bidFeeLabel"), value: `${fee} ETB` },
    { label: t("sealedBidsLabel"), value: String(auction.bid_count) },
    {
      label: t("statusLabel"),
      value: isActive ? t("liveLabel") : isClosed ? t("closedLabel") : t("sealedLabel"),
    },
  ];

  useEffect(() => {
    if (!open) {
      setAccepted(false);
      setTermsOpen(false);
    }
  }, [open]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setAccepted(false);
      setTermsOpen(false);
    }
    onOpenChange(next);
  }

  function continueToBidding() {
    if (!accepted && isActive) return;
    handleOpenChange(false);
    router.push(`/auctions/${auction.id}/bid`);
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="outline-none">
        <DrawerHeader className="border-b border-line px-4 text-left">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {isActive ? <LiveStrip /> : <LiveStrip label={t("closedLabel").toUpperCase()} />}
          </div>
          <DrawerTitle className="line-clamp-2 text-ink">{auction.title}</DrawerTitle>
          <DrawerDescription className="line-clamp-3 text-left text-ink-soft">
            {auction.description}
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          <section>
            <h3 className="font-display text-sm font-bold text-ink">{t("overviewTitle")}</h3>
            <dl className="mt-3 grid grid-cols-2 gap-2.5">
              {specs.map((spec) => (
                <div key={spec.label} className="rounded-2xl bg-cream-deep/80 px-3 py-3">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mute">
                    {spec.label}
                  </dt>
                  <dd className="mt-1 font-mono text-sm font-semibold text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <p className="mt-4 text-xs leading-relaxed text-ink-soft">
            {t("ruleNote", {
              days: DEFAULT_AUCTION_DURATION_DAYS,
              maxBid: BID_MAX_BIRR,
            })}
          </p>

          <section className="mt-4 rounded-2xl bg-cream-deep/50 p-4">
            <h3 className="font-display text-sm font-bold text-ink">
              {t("termsPreview.title")}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
              {t("termsPreview.body")}
            </p>

            {!termsOpen ? (
              <button
                type="button"
                className="mt-2 inline-flex text-xs font-semibold text-gold-dim hover:underline"
                onClick={() => setTermsOpen(true)}
              >
                {t("termsPreview.readMore")}
              </button>
            ) : (
              <div className="mt-3 space-y-4 border-t border-line/70 pt-3">
                <p className="font-display text-sm font-bold text-ink">{termsTitle}</p>
                <div className="space-y-4">
                  {termsSections.map((section) => (
                    <div key={section.id} className="space-y-2">
                      {section.title ? (
                        <h4 className="text-xs font-bold text-ink">{section.title}</h4>
                      ) : null}
                      {section.paragraphs.map((paragraph, i) => (
                        <p key={i} className="text-xs leading-relaxed text-ink-soft">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="inline-flex text-xs font-semibold text-gold-dim hover:underline"
                  onClick={() => setTermsOpen(false)}
                >
                  {t("termsPreview.readLess")}
                </button>
              </div>
            )}
          </section>
        </div>

        <DrawerFooter className="gap-2.5 bg-white/95 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {isActive ? (
            <>
              <label className="flex cursor-pointer items-start gap-2.5 text-left text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) => setAccepted(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 rounded accent-[color:var(--color-gold-deep)]"
                />
                <span>
                  {acceptParts[0]}
                  <button
                    type="button"
                    className="font-semibold text-gold-dim hover:underline"
                    onClick={() => setTermsOpen(true)}
                  >
                    {termsLinkText}
                  </button>
                  {acceptParts[1] ?? ""}
                </span>
              </label>

              <Button
                size="lg"
                className="h-11 w-full rounded-2xl"
                disabled={!accepted}
                onClick={continueToBidding}
              >
                <Ticket className="size-4" aria-hidden />
                {accepted ? t("goToBidding") : t("acceptTermsCta")}
              </Button>
            </>
          ) : isClosed ? (
            <>
              <p className="text-center text-sm text-danger">{t("closedCta")}</p>
              <Button
                size="lg"
                variant="outline"
                className="h-11 w-full rounded-2xl"
                onClick={continueToBidding}
              >
                {t("viewResultCta")}
              </Button>
            </>
          ) : (
            <p className="text-center text-sm text-ink-soft">{t("notFound")}</p>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

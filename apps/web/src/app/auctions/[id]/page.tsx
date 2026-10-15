"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@bidclub/ui";
import { AuctionDetailDrawer } from "@/components/auction-detail-drawer";
import { PageEnter } from "@/components/motion";
import { useGetAuctionQuery } from "@/store/api";

/**
 * Deep-link entry for an arena. Shows the same drawer gate used from cards
 * (detail + specs + terms + agree) instead of a separate full page.
 */
export default function AuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations("AuctionDetail");
  const { data: auction, isLoading, error } = useGetAuctionQuery(id);
  const [open, setOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pt-8 sm:px-6 lg:px-8">
        <div className="h-40 animate-pulse rounded-2xl bg-cream-deep" />
        <div className="h-24 animate-pulse rounded-2xl bg-cream-deep" />
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="space-y-4 px-4 pt-8 sm:px-6">
        <p className="text-sm text-danger">{t("notFound")}</p>
        <Button asChild variant="outline">
          <Link href="/arenas">{t("back")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <PageEnter className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="font-display text-lg font-bold text-ink">{auction.title}</p>
      <p className="max-w-sm text-sm text-ink-soft">{t("termsPreview.body")}</p>
      <Button type="button" onClick={() => setOpen(true)}>
        {t("goToBidding")}
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href="/arenas">{t("back")}</Link>
      </Button>

      <AuctionDetailDrawer
        auction={auction}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) router.push("/arenas");
        }}
      />
    </PageEnter>
  );
}

"use client";

import { use, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Gavel, Ticket, Trophy, Users } from "lucide-react";
import { DEFAULT_AUCTION_DURATION_MS, formatBidBirr } from "@bidclub/shared";
import { Button, Progress } from "@bidclub/ui";
import { KpiCard, KpiGrid } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { ShareBars } from "@/components/share-bars";
import { MobileRowCard } from "@/components/table/mobile-row-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { chartColors } from "@/lib/chart-theme";
import { getErrorMessage } from "@/lib/errors";
import {
  useCloseAuctionMutation,
  useGetAuctionQuery,
  useGetBidsQuery,
  useUpdateAuctionMutation,
} from "@/store/api";

export default function AdminAuctionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: auction, isLoading } = useGetAuctionQuery(id);
  const { data: bids } = useGetBidsQuery(id);
  const [updateAuction, { isLoading: updating }] = useUpdateAuctionMutation();
  const [closeAuction, { isLoading: closing }] = useCloseAuctionMutation();
  const [actionError, setActionError] = useState<string | null>(null);

  const uniqueness = useMemo(() => {
    if (!bids?.length)
      return { unique: 0, duplicated: 0, lowestUnique: null as number | null };
    const counts = new Map<number, number>();
    for (const b of bids) {
      counts.set(b.amount_cents, (counts.get(b.amount_cents) ?? 0) + 1);
    }
    let unique = 0;
    let duplicated = 0;
    let lowestUnique: number | null = null;
    for (const [amount, count] of counts) {
      if (count === 1) {
        unique += 1;
        if (lowestUnique === null || amount < lowestUnique) lowestUnique = amount;
      } else {
        duplicated += 1;
      }
    }
    return { unique, duplicated, lowestUnique };
  }, [bids]);

  if (isLoading || !auction) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-md bg-muted" />
        <KpiGrid>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[108px] animate-pulse rounded-lg bg-muted" />
          ))}
        </KpiGrid>
      </div>
    );
  }

  const current = auction;

  const pct = Math.min(
    100,
    (() => {
      if (!current.ends_at) return 0;
      const start = new Date(current.created_at).getTime();
      const end = new Date(current.ends_at).getTime();
      const total = Math.max(1, end - start);
      return Math.round(((Date.now() - start) / total) * 100);
    })(),
  );

  async function setStatus(status: "draft" | "active") {
    setActionError(null);
    const patch: { id: string; status: "draft" | "active"; endsAt?: string } = {
      id,
      status,
    };
    if (status === "active" && !current.ends_at) {
      patch.endsAt = new Date(Date.now() + DEFAULT_AUCTION_DURATION_MS).toISOString();
    }
    const result = await updateAuction(patch);
    if ("error" in result && result.error) {
      setActionError(getErrorMessage(result.error, "Update failed"));
    }
  }

  async function forceClose() {
    setActionError(null);
    const result = await closeAuction(id);
    if ("error" in result && result.error) {
      setActionError(getErrorMessage(result.error, "Close failed"));
    }
  }

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <PageHeader
        title={current.title}
        description={current.description}
        icon={Gavel}
        actions={
          <>
            <StatusBadge status={current.status} />
            <Button asChild size="sm" variant="outline" className="rounded-md">
              <Link href="/auctions">
                <ArrowLeft className="size-4" />
                Back
              </Link>
            </Button>
          </>
        }
      />

      <KpiGrid>
        <KpiCard
          title="Sealed bids"
          value={String(auction.bid_count)}
          icon={Ticket}
          featured
          tone="accent"
        />
        <KpiCard
          title="Unique amounts"
          value={String(uniqueness.unique)}
          icon={Users}
          fill="navySoft"
        />
        <KpiCard
          title="Duplicated"
          value={String(uniqueness.duplicated)}
          icon={Ticket}
          tone="warn"
        />
        <KpiCard
          title="Lowest unique"
          value={
            uniqueness.lowestUnique != null
              ? formatBidBirr(uniqueness.lowestUnique)
              : "—"
          }
          icon={Trophy}
          fill="lime"
        />
      </KpiGrid>

      <div className="grid min-w-0 gap-5 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border/80 bg-muted">
            {auction.image_url ? (
              <Image
                src={auction.image_url}
                alt={auction.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-heading text-2xl text-muted-foreground/40">
                No image
              </div>
            )}
          </div>

          <div className="panel p-4 sm:p-5">
            <h2 className="font-heading text-base font-semibold sm:text-sm">
              Live meter
            </h2>
            <p className="text-xs text-muted-foreground">
              Timer progress · fee {auction.bid_fee_birr ?? 75} ETB / bid
            </p>
            <div className="mt-3 space-y-2">
              <Progress value={pct} />
              <p className="font-mono text-xs text-muted-foreground">{pct}% elapsed</p>
            </div>
          </div>

          <div className="panel p-4 sm:p-5">
            <h2 className="font-heading text-base font-semibold sm:text-sm">
              Uniqueness mix
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Unique vs duplicated sealed amounts
            </p>
            <ShareBars
              items={[
                {
                  name: "Unique",
                  value: uniqueness.unique,
                  color: chartColors.lime,
                },
                {
                  name: "Duplicated",
                  value: uniqueness.duplicated,
                  color: chartColors.navy,
                },
              ].filter((i) => i.value > 0)}
              empty="No bids yet"
            />
          </div>

          {auction.status === "closed" ? (
            <div className="panel border-accent/40 bg-accent/10 p-4 sm:p-5">
              <h2 className="font-heading text-base font-semibold sm:text-sm">
                Winner
              </h2>
              {auction.winner ? (
                <p className="mt-2 text-lg">
                  <span className="font-heading font-semibold">
                    {auction.winner.display_name}
                  </span>
                  {auction.winning_amount_cents != null ? (
                    <span className="font-figure ml-3 font-semibold">
                      {formatBidBirr(auction.winning_amount_cents)} ETB
                    </span>
                  ) : null}
                </p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  No unique bids — no winner.
                </p>
              )}
            </div>
          ) : null}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="panel p-4 sm:p-5">
            <h2 className="font-heading text-base font-semibold sm:text-sm">
              Controls
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              {auction.status === "draft" ? (
                <Button
                  className="rounded-md"
                  disabled={updating}
                  onClick={() => setStatus("active")}
                >
                  Activate auction
                </Button>
              ) : null}
              {auction.status === "active" ? (
                <>
                  <Button
                    variant="secondary"
                    className="rounded-md"
                    disabled={updating}
                    onClick={() => setStatus("draft")}
                  >
                    Move to draft
                  </Button>
                  <Button
                    variant="destructive"
                    className="rounded-md"
                    disabled={closing}
                    onClick={forceClose}
                  >
                    Force close &amp; compute winner
                  </Button>
                </>
              ) : null}
              {actionError ? (
                <p className="text-sm text-destructive">{actionError}</p>
              ) : null}
            </div>
          </div>

          <div className="panel space-y-3 p-3 sm:p-4">
            <div className="px-1">
              <h2 className="font-heading text-base font-semibold sm:text-sm">
                Recent bids
              </h2>
              <p className="text-xs text-muted-foreground">
                {bids?.length ?? 0} sealed bids loaded
              </p>
            </div>

            {!bids?.length ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No bids yet.
              </p>
            ) : (
              <>
                <ul className="space-y-2 md:hidden">
                  {bids.slice(0, 20).map((bid) => (
                    <MobileRowCard
                      key={bid.id}
                      title={bid.profile?.display_name ?? bid.user_id.slice(0, 8)}
                      trailing={formatBidBirr(bid.amount_cents)}
                    />
                  ))}
                </ul>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bidder</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bids.slice(0, 40).map((bid) => (
                        <TableRow key={bid.id}>
                          <TableCell className="text-muted-foreground">
                            {bid.profile?.display_name ?? bid.user_id.slice(0, 8)}
                          </TableCell>
                          <TableCell className="font-figure text-right font-semibold">
                            {formatBidBirr(bid.amount_cents)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

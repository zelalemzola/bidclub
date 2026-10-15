"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Trophy, Ticket, Users } from "lucide-react";
import { formatBidBirr } from "@bidclub/shared";
import { Button } from "@bidclub/ui";
import { KpiCard, KpiGrid } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { DataTableToolbar } from "@/components/table/data-table-toolbar";
import { MobileRowCard } from "@/components/table/mobile-row-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAuctionsQuery } from "@/store/api";

export default function WinnersPage() {
  const { data: auctions, isLoading } = useGetAuctionsQuery();
  const [query, setQuery] = useState("");

  const winners = useMemo(
    () => auctions?.filter((a) => a.status === "closed" && a.winner) ?? [],
    [auctions],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return winners;
    return winners.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.winner?.display_name ?? "").toLowerCase().includes(q),
    );
  }, [winners, query]);

  const totalWinningCents = winners.reduce(
    (sum, a) => sum + (a.winning_amount_cents ?? 0),
    0,
  );
  const totalBids = winners.reduce((sum, a) => sum + (a.bid_count ?? 0), 0);

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <PageHeader
        title="Winners"
        description="Closed arenas and the sealed bids that took each prize."
        icon={Trophy}
      />

      <KpiGrid>
        <KpiCard
          title="Winners"
          value={isLoading ? "—" : String(winners.length)}
          icon={Trophy}
          featured
          tone="accent"
        />
        <KpiCard
          title="Winning bids sum"
          value={
            isLoading
              ? "—"
              : `${formatBidBirr(totalWinningCents)} ETB`
          }
          icon={Ticket}
          fill="navySoft"
        />
        <KpiCard
          title="Bids in won arenas"
          value={isLoading ? "—" : String(totalBids)}
          icon={Users}
          fill="lime"
        />
        <KpiCard
          title="Avg winning bid"
          value={
            isLoading || !winners.length
              ? "—"
              : formatBidBirr(Math.round(totalWinningCents / winners.length))
          }
          icon={Trophy}
          tone="success"
        />
      </KpiGrid>

      <div className="panel space-y-3 rounded-lg p-3 sm:p-4">
        <DataTableToolbar
          search={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search auction or winner…"
        />

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-lg border border-border/80 bg-muted text-muted-foreground">
              <Trophy className="size-5" />
            </div>
            <p className="font-heading text-base font-semibold">No winners yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              When an arena timer ends or you force-close, the lowest unique bid
              lands here.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-1 rounded-md">
              <Link href="/auctions">Browse auctions</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="space-y-2 md:hidden">
              {filtered.map((auction) => (
                <Link key={auction.id} href={`/auctions/${auction.id}`}>
                  <MobileRowCard
                    title={auction.title}
                    trailing={
                      auction.winning_amount_cents != null
                        ? `${formatBidBirr(auction.winning_amount_cents)} ETB`
                        : "—"
                    }
                    fields={[
                      {
                        label: "Winner",
                        value: auction.winner?.display_name ?? "—",
                      },
                      { label: "Bids", value: String(auction.bid_count) },
                    ]}
                  />
                </Link>
              ))}
            </ul>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Auction</TableHead>
                    <TableHead>Winner</TableHead>
                    <TableHead className="text-right">Winning bid</TableHead>
                    <TableHead className="text-right">Bids</TableHead>
                    <TableHead>Closed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((auction) => (
                    <TableRow key={auction.id}>
                      <TableCell>
                        <Link
                          href={`/auctions/${auction.id}`}
                          className="font-medium hover:underline"
                        >
                          {auction.title}
                        </Link>
                      </TableCell>
                      <TableCell>{auction.winner?.display_name ?? "—"}</TableCell>
                      <TableCell className="font-figure text-right font-semibold">
                        {auction.winning_amount_cents != null
                          ? `${formatBidBirr(auction.winning_amount_cents)} ETB`
                          : "—"}
                      </TableCell>
                      <TableCell className="font-figure text-right">
                        {auction.bid_count}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(auction.updated_at).toLocaleDateString()}
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
  );
}

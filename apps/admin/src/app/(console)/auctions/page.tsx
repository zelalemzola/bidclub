"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Activity, Gavel, PlusCircle, Ticket } from "lucide-react";
import { formatBidBirr, resolveBidFeeBirr } from "@bidclub/shared";
import { Button, Progress } from "@bidclub/ui";
import { KpiCard, KpiGrid } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
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
import { auctionCounts } from "@/lib/analytics";
import { getErrorMessage } from "@/lib/errors";
import { useGetAuctionsQuery } from "@/store/api";

export default function AuctionsPage() {
  const { data: auctions, isLoading, isError, error } = useGetAuctionsQuery();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const counts = auctionCounts(auctions);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (auctions ?? []).filter((a) => {
      if (status !== "all" && a.status !== status) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    });
  }, [auctions, query, status]);

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <PageHeader
        title="Auctions"
        description="Create, activate, and monitor every arena."
        icon={Gavel}
        actions={
          <Button asChild size="sm" className="rounded-md">
            <Link href="/auctions/new">
              <PlusCircle className="size-4" />
              New auction
            </Link>
          </Button>
        }
      />

      <KpiGrid>
        <KpiCard
          title="Total arenas"
          value={isLoading ? "—" : String(counts.total)}
          icon={Gavel}
          featured
        />
        <KpiCard
          title="Live"
          value={isLoading ? "—" : String(counts.active)}
          icon={Activity}
          tone="accent"
        />
        <KpiCard
          title="Draft"
          value={isLoading ? "—" : String(counts.draft)}
          icon={Gavel}
          fill="navySoft"
        />
        <KpiCard
          title="Sealed bids"
          value={isLoading ? "—" : String(counts.totalBids)}
          icon={Ticket}
          fill="lime"
        />
      </KpiGrid>

      {isError ? (
        <p className="text-sm text-destructive">
          {getErrorMessage(error, "Failed to load auctions")}
        </p>
      ) : null}

      <div className="panel space-y-3 rounded-lg p-3 sm:p-4">
        <DataTableToolbar
          search={query}
          onSearchChange={setQuery}
          searchPlaceholder="Search title or description…"
          filters={[
            {
              id: "status",
              label: "Status",
              value: status,
              onChange: setStatus,
              allLabel: "All statuses",
              options: [
                { value: "active", label: "Active" },
                { value: "draft", label: "Draft" },
                { value: "closed", label: "Closed" },
              ],
            },
          ]}
        />

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No auctions match this filter.
          </p>
        ) : (
          <>
            <ul className="space-y-2 md:hidden">
              {filtered.map((auction) => (
                <Link key={auction.id} href={`/auctions/${auction.id}`}>
                  <MobileRowCard
                    title={auction.title}
                    trailing={<StatusBadge status={auction.status} />}
                    fields={[
                      {
                        label: "Fee",
                        value: `${resolveBidFeeBirr(auction.bid_fee_birr)} ETB`,
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
                    <TableHead>Status</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead className="text-right">Bids</TableHead>
                    <TableHead>Timer</TableHead>
                    <TableHead>Winner</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((auction) => {
                    const fee = resolveBidFeeBirr(auction.bid_fee_birr);
                    const pct = Math.min(
                      100,
                      auction.ends_at
                        ? Math.round(
                            ((Date.now() -
                              new Date(auction.created_at).getTime()) /
                              Math.max(
                                1,
                                new Date(auction.ends_at).getTime() -
                                  new Date(auction.created_at).getTime(),
                              )) *
                              100,
                          )
                        : 0,
                    );
                    const clamped = Math.max(0, Math.min(100, pct));
                    return (
                      <TableRow key={auction.id}>
                        <TableCell>
                          <Link
                            href={`/auctions/${auction.id}`}
                            className="font-medium hover:underline"
                          >
                            {auction.title}
                          </Link>
                          <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-muted-foreground">
                            {auction.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={auction.status} />
                        </TableCell>
                        <TableCell className="font-figure">{fee}</TableCell>
                        <TableCell className="font-figure text-right">
                          {auction.bid_count}
                        </TableCell>
                        <TableCell className="w-36">
                          <Progress value={clamped} />
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {clamped}%
                          </p>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {auction.winner
                            ? `${auction.winner.display_name}${
                                auction.winning_amount_cents != null
                                  ? ` · ${formatBidBirr(auction.winning_amount_cents)}`
                                  : ""
                              }`
                            : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

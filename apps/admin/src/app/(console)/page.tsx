"use client";

import Link from "next/link";
import {
  Activity,
  FileBarChart,
  Gavel,
  LayoutDashboard,
  PlusCircle,
  Ticket,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { formatBidBirr } from "@bidclub/shared";
import { Button } from "@bidclub/ui";
import { KpiCard, KpiGrid } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { StatusDonut } from "@/components/charts/status-donut";
import { TrendChart } from "@/components/charts/trend-chart";
import { MobileRowCard } from "@/components/table/mobile-row-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  activatedUsers,
  auctionCounts,
  buildTrend,
  formatEtb,
  sumPayments,
} from "@/lib/analytics";
import { getErrorMessage } from "@/lib/errors";
import {
  useGetAuctionsQuery,
  useGetPaymentsQuery,
  useGetProfilesQuery,
} from "@/store/api";

export default function AdminDashboardPage() {
  const {
    data: auctions,
    isLoading,
    isError,
    error,
  } = useGetAuctionsQuery();
  const { data: payments } = useGetPaymentsQuery();
  const { data: profiles } = useGetProfilesQuery();

  const counts = auctionCounts(auctions);
  const revenue = sumPayments(payments);
  const bidRevenue = sumPayments(payments, "bid");
  const seatRevenue = sumPayments(payments, "registration");
  const activated = activatedUsers(profiles);
  const winners =
    auctions?.filter((a) => a.status === "closed" && a.winner_id).length ?? 0;
  const trend = buildTrend(payments, 14);
  const recent = auctions?.slice(0, 8) ?? [];

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden sm:space-y-6">
      <PageHeader
        title="Dashboard"
        description="Live arenas, fee revenue, users, and winner activity across BidClub."
        icon={LayoutDashboard}
        actions={
          <>
            <Button asChild variant="outline" size="sm" className="hidden rounded-md sm:inline-flex">
              <Link href="/reports">
                <FileBarChart className="size-4" />
                Reports
              </Link>
            </Button>
            <Button asChild size="sm" className="rounded-md">
              <Link href="/auctions/new">
                <PlusCircle className="size-4" />
                New auction
              </Link>
            </Button>
          </>
        }
      />

      {isError ? (
        <div className="panel p-4 text-sm text-destructive">
          {getErrorMessage(error, "Couldn’t load dashboard data")}
        </div>
      ) : null}

      {!isLoading ? (
        <div className="sm:hidden">
          <KpiCard
            title="Revenue"
            value={formatEtb(revenue)}
            hint={`${formatEtb(bidRevenue)} bids · ${formatEtb(seatRevenue)} seats`}
            icon={Wallet}
            tone="accent"
            featured
          />
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2 sm:hidden">
        <Link
          href="/auctions/new"
          className="flex flex-col items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2 py-3 text-center shadow-sm"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-accent/15 text-accent-foreground">
            <PlusCircle className="size-4" />
          </span>
          <span className="text-[11px] font-medium">Create</span>
        </Link>
        <Link
          href="/winners"
          className="flex flex-col items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2 py-3 text-center shadow-sm"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Trophy className="size-4" />
          </span>
          <span className="text-[11px] font-medium">Winners</span>
        </Link>
        <Link
          href="/reports"
          className="flex flex-col items-center gap-1.5 rounded-lg border border-border/80 bg-card px-2 py-3 text-center shadow-sm"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileBarChart className="size-4" />
          </span>
          <span className="text-[11px] font-medium">Reports</span>
        </Link>
      </div>

      {isLoading ? (
        <KpiGrid>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[108px] animate-pulse rounded-lg bg-muted" />
          ))}
        </KpiGrid>
      ) : (
        <KpiGrid>
          <KpiCard
            title="Revenue"
            value={formatEtb(revenue)}
            hint={`${formatEtb(bidRevenue)} bids · ${formatEtb(seatRevenue)} seats`}
            icon={Wallet}
            tone="accent"
            featured
            className="hidden sm:block"
          />
          <KpiCard
            title="Sealed bids"
            value={String(counts.totalBids)}
            hint="Across all arenas"
            icon={Ticket}
            fill="navySoft"
          />
          <KpiCard
            title="Live arenas"
            value={String(counts.active)}
            hint={`${counts.draft} draft · ${counts.closed} closed`}
            icon={Activity}
            fill="lime"
          />
          <KpiCard
            title="Activated users"
            value={String(activated)}
            hint={`${profiles?.length ?? 0} total accounts`}
            icon={Users}
          />
          <KpiCard
            title="Winners"
            value={String(winners)}
            hint="Closed with a winner"
            icon={Trophy}
            tone="success"
          />
          <KpiCard
            title="Bid fee intake"
            value={formatEtb(bidRevenue)}
            icon={Ticket}
            fill="navySoft"
          />
          <KpiCard
            title="Seat fees"
            value={formatEtb(seatRevenue)}
            icon={Users}
            fill="lime"
          />
          <KpiCard
            title="Total auctions"
            value={String(counts.total)}
            icon={Gavel}
          />
        </KpiGrid>
      )}

      <div className="grid min-w-0 gap-5 lg:grid-cols-5">
        <div className="panel min-w-0 p-4 sm:p-5 lg:col-span-3">
          <div className="mb-4">
            <h2 className="font-heading text-base font-semibold sm:text-sm">
              Bids & revenue
            </h2>
            <p className="text-xs text-muted-foreground">Last 14 days</p>
          </div>
          {isLoading ? (
            <div className="h-[200px] animate-pulse rounded-lg bg-muted sm:h-[260px]" />
          ) : (
            <TrendChart data={trend} />
          )}
        </div>

        <div className="panel min-w-0 p-4 sm:p-5 lg:col-span-2">
          <div className="mb-4">
            <h2 className="font-heading text-base font-semibold sm:text-sm">
              Arena mix
            </h2>
            <p className="text-xs text-muted-foreground">Status distribution</p>
          </div>
          <StatusDonut
            active={counts.active}
            draft={counts.draft}
            closed={counts.closed}
          />
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        <div className="panel min-w-0 space-y-3 p-4 sm:p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-base font-semibold sm:text-sm">
                Recent auctions
              </h2>
              <p className="text-xs text-muted-foreground">Latest listings</p>
            </div>
            <Button asChild size="sm" variant="outline" className="rounded-md">
              <Link href="/auctions">View all</Link>
            </Button>
          </div>

          {recent.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No auctions yet.
            </p>
          ) : (
            <>
              <ul className="space-y-2 md:hidden">
                {recent.map((auction) => (
                  <Link key={auction.id} href={`/auctions/${auction.id}`}>
                    <MobileRowCard
                      title={auction.title}
                      trailing={<StatusBadge status={auction.status} />}
                      fields={[
                        { label: "Bids", value: String(auction.bid_count) },
                        {
                          label: "Winner",
                          value: auction.winner?.display_name ?? "—",
                        },
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
                      <TableHead className="text-right">Bids</TableHead>
                      <TableHead className="text-right">Winning bid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recent.map((auction) => (
                      <TableRow key={auction.id}>
                        <TableCell>
                          <Link
                            href={`/auctions/${auction.id}`}
                            className="font-medium hover:underline"
                          >
                            {auction.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={auction.status} />
                        </TableCell>
                        <TableCell className="font-figure text-right">
                          {auction.bid_count}
                        </TableCell>
                        <TableCell className="font-figure text-right">
                          {auction.winning_amount_cents != null
                            ? formatBidBirr(auction.winning_amount_cents)
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        <div className="panel min-w-0 p-4 sm:p-5">
          <h2 className="font-heading text-base font-semibold sm:text-sm">
            Quick actions
          </h2>
          <p className="mb-3 text-xs text-muted-foreground">Common operator tasks</p>
          <div className="grid gap-2">
            <Button asChild variant="outline" className="justify-start rounded-md">
              <Link href="/auctions/new">
                <PlusCircle className="size-4" />
                Create auction
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start rounded-md">
              <Link href="/winners">
                <Trophy className="size-4" />
                Review winners
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start rounded-md">
              <Link href="/users">
                <Users className="size-4" />
                Manage users
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start rounded-md">
              <Link href="/reports">
                <Wallet className="size-4" />
                Fee reports
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

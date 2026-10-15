"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { Download, FileBarChart, Ticket, Users, Wallet } from "lucide-react";
import { Button } from "@bidclub/ui";
import { KpiCard, KpiGrid } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { ShareBars } from "@/components/share-bars";
import { TrendChart } from "@/components/charts/trend-chart";
import { DataTableToolbar } from "@/components/table/data-table-toolbar";
import { MobileRowCard } from "@/components/table/mobile-row-card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  auctionCounts,
  buildTrend,
  formatEtb,
  sumPayments,
} from "@/lib/analytics";
import { LIMES, chartColors } from "@/lib/chart-theme";
import {
  useGetAuctionsQuery,
  useGetPaymentsQuery,
  useGetProfilesQuery,
} from "@/store/api";

type Period = "7" | "14" | "30" | "all";

const feeMixConfig = {
  bid: { label: "Bid fees", color: chartColors.lime },
  registration: { label: "Seat fees", color: chartColors.navy },
} satisfies ChartConfig;

export default function ReportsPage() {
  const { data: auctions } = useGetAuctionsQuery();
  const { data: payments } = useGetPaymentsQuery();
  const { data: profiles } = useGetProfilesQuery();
  const [period, setPeriod] = useState<Period>("14");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const days = period === "all" ? 90 : Number(period);
  const cutoff = useMemo(() => {
    if (period === "all") return null;
    const d = new Date();
    d.setDate(d.getDate() - Number(period));
    return d;
  }, [period]);

  const filteredPayments = useMemo(() => {
    let list = payments ?? [];
    if (cutoff) {
      list = list.filter((p) => new Date(p.created_at) >= cutoff);
    }
    if (typeFilter !== "all") {
      list = list.filter((p) => p.type === typeFilter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.type.toLowerCase().includes(q) ||
          p.status.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q),
      );
    }
    return list;
  }, [payments, cutoff, typeFilter, search]);

  const periodPayments = useMemo(() => {
    if (!cutoff) return payments ?? [];
    return (payments ?? []).filter((p) => new Date(p.created_at) >= cutoff);
  }, [payments, cutoff]);

  const counts = auctionCounts(auctions);
  const revenue = sumPayments(periodPayments);
  const bidFees = sumPayments(periodPayments, "bid");
  const seats = sumPayments(periodPayments, "registration");
  const trend = buildTrend(periodPayments, Math.min(days, 30));

  const feeMix = [
    { name: "Bid fees", key: "bid", value: bidFees, fill: LIMES[0] },
    { name: "Seat fees", key: "registration", value: seats, fill: LIMES[4] },
  ].filter((d) => d.value > 0);

  const typeBars = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of periodPayments) {
      if (p.status !== "mock_completed") continue;
      map.set(p.type, (map.get(p.type) ?? 0) + Number(p.amount_birr));
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [periodPayments]);

  function exportCsv() {
    const rows = [
      ["id", "type", "amount_birr", "status", "created_at", "auction_id"].join(","),
      ...filteredPayments.map((p) =>
        [p.id, p.type, p.amount_birr, p.status, p.created_at, p.auction_id ?? ""].join(
          ",",
        ),
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bidclub-payments-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden sm:space-y-6">
      <PageHeader
        title="Reports"
        description="Fee intake, bid volume, and exportable payment history."
        icon={FileBarChart}
        actions={
          <Button size="sm" variant="outline" className="rounded-md" onClick={exportCsv}>
            <Download className="size-4" />
            Export CSV
          </Button>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ["7", "7 days"],
            ["14", "14 days"],
            ["30", "30 days"],
            ["all", "All time"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPeriod(id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
              period === id
                ? "bg-primary text-primary-foreground"
                : "border border-border/80 bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <KpiGrid>
        <KpiCard
          title="Total revenue"
          value={formatEtb(revenue)}
          icon={Wallet}
          featured
          tone="accent"
        />
        <KpiCard title="Bid fees" value={formatEtb(bidFees)} icon={Ticket} fill="navySoft" />
        <KpiCard title="Seat fees" value={formatEtb(seats)} icon={Users} fill="lime" />
        <KpiCard
          title="Arenas"
          value={String(counts.total)}
          hint={`${counts.active} live`}
          icon={Ticket}
        />
      </KpiGrid>

      <div className="grid min-w-0 gap-5 lg:grid-cols-5">
        <div className="panel min-w-0 p-4 sm:p-5 lg:col-span-3">
          <div className="mb-4">
            <h2 className="font-heading text-base font-semibold sm:text-sm">Trend</h2>
            <p className="text-xs text-muted-foreground">
              Bids and revenue for the selected window
            </p>
          </div>
          <TrendChart data={trend} />
        </div>

        <div className="panel min-w-0 p-4 sm:p-5 lg:col-span-2">
          <div className="mb-4">
            <h2 className="font-heading text-base font-semibold sm:text-sm">
              Fee mix
            </h2>
            <p className="text-xs text-muted-foreground">Bid vs seat intake</p>
          </div>
          {feeMix.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No fee data</p>
          ) : (
            <div className="space-y-4">
              <ChartContainer
                config={feeMixConfig}
                className="mx-auto h-[180px] w-full max-w-[220px]"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie
                    data={feeMix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="58%"
                    outerRadius="82%"
                    strokeWidth={2}
                    paddingAngle={2}
                  >
                    {feeMix.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
              <ShareBars
                items={feeMix.map((d) => ({
                  name: d.name,
                  value: d.value,
                  color: d.fill,
                }))}
                format="currency"
              />
            </div>
          )}
        </div>
      </div>

      <div className="panel min-w-0 p-4 sm:p-5">
        <div className="mb-4">
          <h2 className="font-heading text-base font-semibold sm:text-sm">
            Revenue by type
          </h2>
          <p className="text-xs text-muted-foreground">Completed payments in window</p>
        </div>
        {typeBars.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No data</p>
        ) : (
          <ChartContainer config={feeMixConfig} className="h-[220px] w-full">
            <BarChart data={typeBars} margin={{ top: 8, right: 4, left: 0, bottom: 4 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tick={{ fontSize: 10 }}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill={chartColors.navy} radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ChartContainer>
        )}
      </div>

      <div className="panel space-y-3 rounded-lg p-3 sm:p-4">
        <div className="px-1">
          <h2 className="font-heading text-base font-semibold sm:text-sm">
            Payment ledger
          </h2>
          <p className="text-xs text-muted-foreground">
            {filteredPayments.length} rows · {profiles?.length ?? 0} users
          </p>
        </div>

        <DataTableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search type, status, id…"
          filters={[
            {
              id: "type",
              label: "Type",
              value: typeFilter,
              onChange: setTypeFilter,
              allLabel: "All types",
              options: [
                { value: "bid", label: "Bid" },
                { value: "registration", label: "Registration" },
              ],
            },
          ]}
        />

        {filteredPayments.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No payments in this period.
          </p>
        ) : (
          <>
            <ul className="space-y-2 md:hidden">
              {filteredPayments.slice(0, 25).map((p) => (
                <MobileRowCard
                  key={p.id}
                  title={<span className="capitalize">{p.type}</span>}
                  trailing={`${Number(p.amount_birr)} ETB`}
                  fields={[
                    { label: "Status", value: p.status.replace("_", " ") },
                    {
                      label: "When",
                      value: new Date(p.created_at).toLocaleDateString(),
                    },
                  ]}
                />
              ))}
            </ul>

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.slice(0, 40).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="capitalize">{p.type}</TableCell>
                      <TableCell className="font-figure text-right font-semibold">
                        {Number(p.amount_birr)} ETB
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.status.replace("_", " ")}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleString()}
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

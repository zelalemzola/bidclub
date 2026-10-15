"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { chartColors } from "@/lib/chart-theme";
import type { DayPoint } from "@/lib/analytics";

const config = {
  bids: { label: "Bids", color: chartColors.lime },
  revenue: { label: "Revenue", color: chartColors.navy },
} satisfies ChartConfig;

export function TrendChart({ data }: { data: DayPoint[] }) {
  if (!data.length) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground sm:h-[260px]">
        No activity in this period
      </div>
    );
  }

  return (
    <ChartContainer config={config} className="h-[200px] w-full sm:h-[260px]">
      <ComposedChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColors.navy} stopOpacity={0.28} />
            <stop offset="95%" stopColor={chartColors.navy} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          yAxisId="left"
          tickLine={false}
          axisLine={false}
          width={28}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickLine={false}
          axisLine={false}
          width={36}
          tick={{ fontSize: 10 }}
          tickFormatter={(v) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
          }
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          yAxisId="left"
          dataKey="bids"
          fill={chartColors.lime}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Area
          yAxisId="right"
          type="monotone"
          dataKey="revenue"
          stroke={chartColors.navy}
          fill="url(#fillRevenue)"
          strokeWidth={2}
        />
        <ChartLegend content={<ChartLegendContent />} />
      </ComposedChart>
    </ChartContainer>
  );
}

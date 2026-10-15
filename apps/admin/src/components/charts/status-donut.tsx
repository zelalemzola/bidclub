"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ShareBars } from "@/components/share-bars";
import { LIMES, chartColors } from "@/lib/chart-theme";

const config = {
  active: { label: "Active", color: chartColors.lime },
  draft: { label: "Draft", color: chartColors.navy },
  closed: { label: "Closed", color: chartColors.softNavy },
} satisfies ChartConfig;

export function StatusDonut({
  active,
  draft,
  closed,
}: {
  active: number;
  draft: number;
  closed: number;
}) {
  const data = [
    { name: "Active", key: "active", value: active, fill: LIMES[0] },
    { name: "Draft", key: "draft", value: draft, fill: LIMES[4] },
    { name: "Closed", key: "closed", value: closed, fill: LIMES[5] },
  ].filter((d) => d.value > 0);

  if (!data.length) {
    return (
      <p className="flex h-52 items-center justify-center text-sm text-muted-foreground">
        No auctions yet
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ChartContainer
        config={config}
        className="mx-auto h-[180px] w-full max-w-[220px]"
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="58%"
            outerRadius="82%"
            strokeWidth={2}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.key} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <ShareBars
        items={data.map((d) => ({
          name: d.name,
          value: d.value,
          color: d.fill,
        }))}
      />
    </div>
  );
}

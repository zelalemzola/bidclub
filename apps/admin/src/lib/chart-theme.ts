/** Shared chart palette — navy primary + lime accent */
export const chartColors = {
  navy: "var(--primary)",
  lime: "var(--accent)",
  muted: "var(--muted-foreground)",
  softNavy: "color-mix(in oklab, var(--primary) 55%, white)",
  softLime: "color-mix(in oklab, var(--accent) 70%, white)",
} as const;

export const LIMES = [
  chartColors.lime,
  chartColors.softLime,
  "color-mix(in oklab, var(--accent) 45%, var(--primary))",
  "color-mix(in oklab, var(--accent) 30%, white)",
  chartColors.navy,
  chartColors.softNavy,
] as const;

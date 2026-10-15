/**
 * Urgency is derived from how much of the 20-day arena window remains.
 * Never from individual bid amounts.
 */
export type UrgencyLevel = "calm" | "heating" | "critical" | "closed";

export function getUrgencyLevelFromProgress(
  elapsedPct: number,
  status: string,
): UrgencyLevel {
  if (status === "closed" || elapsedPct >= 100) return "closed";
  if (elapsedPct >= 85) return "critical";
  if (elapsedPct >= 60) return "heating";
  return "calm";
}

/** @deprecated Prefer getUrgencyLevelFromProgress — kept for slot UI leftovers */
export function getUrgencyLevel(
  bidCount: number,
  maxBids: number,
  status: string,
): UrgencyLevel {
  if (status === "closed" || (maxBids > 0 && bidCount >= maxBids)) return "closed";
  const filled = maxBids <= 0 ? 0 : bidCount / maxBids;
  if (filled >= 0.9) return "critical";
  if (filled >= 0.6) return "heating";
  return "calm";
}

export function urgencyLabel(level: UrgencyLevel): string {
  switch (level) {
    case "calm":
      return "Plenty of time left";
    case "heating":
      return "Clock is moving";
    case "critical":
      return "Final days — lock in";
    case "closed":
      return "Arena closed";
  }
}

type UrgencyTone = {
  text: string;
  bar: string;
  border: string;
  soft: string;
};

export function urgencyTone(level: UrgencyLevel): UrgencyTone {
  switch (level) {
    case "calm":
      return {
        text: "text-success",
        bar: "bg-success",
        border: "border-success/30",
        soft: "bg-success/10",
      };
    case "heating":
      return {
        text: "text-gold-bright",
        bar: "bg-gold",
        border: "border-gold/40",
        soft: "bg-gold/10",
      };
    case "critical":
      return {
        text: "text-danger",
        bar: "bg-danger",
        border: "border-danger/35",
        soft: "bg-danger/10",
      };
    case "closed":
      return {
        text: "text-mute",
        bar: "bg-mute",
        border: "border-line",
        soft: "bg-cream-deep",
      };
  }
}

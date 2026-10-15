"use client";

import { useEffect, useMemo, useState } from "react";
import { DEFAULT_AUCTION_DURATION_MS } from "@bidclub/shared";

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, "0");
}

export function resolveEndsAt(
  endsAt: string | null | undefined,
  createdAt: string,
  status: string,
): Date | null {
  if (status === "closed") return null;
  if (endsAt) return new Date(endsAt);
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return null;
  return new Date(created + DEFAULT_AUCTION_DURATION_MS);
}

export function useCountdown(target: Date | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [target]);

  return useMemo(() => {
    if (!target) {
      return {
        totalMs: 0,
        days: 0,
        daysLabel: "0",
        hours: "00",
        minutes: "00",
        seconds: "00",
        done: true,
      };
    }
    const totalMs = Math.max(0, target.getTime() - now);
    const totalSec = Math.floor(totalMs / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return {
      totalMs,
      days,
      daysLabel: String(days),
      hours: pad(hours),
      minutes: pad(minutes),
      seconds: pad(seconds),
      done: totalMs <= 0,
    };
  }, [target, now]);
}

/** 0–100 how much of the arena window has elapsed. */
export function timeProgressPct(
  createdAt: string,
  endsAt: string | null | undefined,
  status: string,
  now = Date.now(),
): number {
  if (status === "closed") return 100;
  const end = resolveEndsAt(endsAt, createdAt, status);
  if (!end) return 0;
  const start = new Date(createdAt).getTime();
  const total = Math.max(1, end.getTime() - start);
  const elapsed = Math.min(total, Math.max(0, now - start));
  return Math.min(100, Math.round((elapsed / total) * 100));
}

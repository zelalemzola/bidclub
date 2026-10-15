"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";

export type PageThemeId =
  | "home"
  | "arenas"
  | "bid"
  | "winners"
  | "auth"
  | "profile"
  | "legal"
  | "default";

function resolveTheme(pathname: string): PageThemeId {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/arenas")) return "arenas";
  if (pathname.includes("/bid") || pathname.startsWith("/auctions")) return "bid";
  if (pathname.startsWith("/winners")) return "winners";
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/register-pay")
  ) {
    return "auth";
  }
  if (pathname.startsWith("/profile")) return "profile";
  if (pathname.startsWith("/terms") || pathname.startsWith("/how-it-works")) {
    return "legal";
  }
  return "default";
}

/**
 * Sets `data-page` on a wrapper so page-themes.css can swap palette,
 * radius, glass, and display type per route.
 */
export function PageTheme({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useMemo(() => resolveTheme(pathname), [pathname]);

  return (
    <div data-page={theme} className="page-theme relative min-h-dvh">
      <div className="page-theme-bg" aria-hidden />
      {children}
    </div>
  );
}

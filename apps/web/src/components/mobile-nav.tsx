"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Gavel, Home, Trophy, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@bidclub/ui";

type NavItem = {
  href: string;
  key: "home" | "arenas" | "winners" | "profile";
  match: (path: string) => boolean;
  Icon: typeof Home;
};

const ITEMS: NavItem[] = [
  { href: "/", key: "home", match: (p) => p === "/", Icon: Home },
  {
    href: "/arenas",
    key: "arenas",
    match: (p) => p.startsWith("/arenas") || p.startsWith("/auctions"),
    Icon: Gavel,
  },
  {
    href: "/winners",
    key: "winners",
    match: (p) => p.startsWith("/winners"),
    Icon: Trophy,
  },
  {
    href: "/profile",
    key: "profile",
    match: (p) => p.startsWith("/profile") || p.startsWith("/register-pay"),
    Icon: UserRound,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("Nav");
  const [compact, setCompact] = useState(false);
  const lastY = useRef(0);

  const activeIndex = useMemo(() => {
    const idx = ITEMS.findIndex((item) => item.match(pathname));
    return idx >= 0 ? idx : 0;
  }, [pathname]);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < 24) setCompact(false);
      else if (delta > 6) setCompact(true);
      else if (delta < -6) setCompact(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 md:hidden">
      <div
        className={cn(
          "pointer-events-auto mx-auto mb-[max(0.75rem,env(safe-area-inset-bottom))] transition-all duration-300 ease-out",
          compact ? "w-[76%] max-w-[260px]" : "w-[90%] max-w-[380px]",
        )}
      >
        <nav
          className={cn(
            "nav-glass relative grid grid-cols-4 items-center rounded-[1.75rem] px-1.5 transition-all duration-300",
            compact ? "py-1" : "py-1.5",
          )}
          aria-label="Primary"
        >
          <span
            aria-hidden
            className={cn(
              "nav-pill absolute left-1.5 w-[calc((100%-0.75rem)/4)] rounded-[1.35rem] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              compact ? "top-1 bottom-1" : "top-1.5 bottom-1.5",
            )}
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />

          {ITEMS.map((item, i) => {
            const active = i === activeIndex;
            const Icon = item.Icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "relative z-10 flex flex-col items-center justify-center rounded-[1.35rem] text-[9px] font-semibold font-sans transition-all duration-300",
                  compact ? "gap-0 py-2" : "gap-0.5 py-2",
                  active ? "text-night" : "text-mute hover:text-ink",
                )}
              >
                <Icon
                  className={cn("transition-all", compact ? "size-5" : "size-[1.15rem]")}
                  strokeWidth={active ? 2.4 : 1.9}
                  aria-hidden
                />
                <span
                  className={cn(
                    "font-sans leading-none transition-all duration-300",
                    compact ? "max-h-0 overflow-hidden opacity-0" : "max-h-3 opacity-100",
                  )}
                >
                  {t(item.key)}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

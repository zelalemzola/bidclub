"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@bidclub/ui";
import { AdminSidebar } from "@/components/admin-sidebar";
import { RequireAdmin } from "@/components/require-admin";
import { useGetProfileQuery } from "@/store/api";

const MOBILE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/auctions", label: "Auctions" },
  { href: "/auctions/new", label: "Create" },
  { href: "/winners", label: "Winners" },
  { href: "/users", label: "Users" },
  { href: "/reports", label: "Reports" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: profile } = useGetProfileQuery();
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh bg-background">
      <div className="sticky top-0 hidden h-dvh md:block">
        <AdminSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
        />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-night/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 shadow-2xl">
            <AdminSidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border/80 bg-background/90 px-3 backdrop-blur-md sm:h-12 sm:px-4">
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-md border border-border/80 bg-card text-muted-foreground shadow-sm md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent font-heading text-xs font-bold text-accent-foreground md:hidden">
              BC
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-[15px] font-semibold tracking-tight sm:text-sm">
                BidClub
              </p>
              <p className="truncate text-[11px] text-muted-foreground md:hidden">
                {profile?.display_name
                  ? `Hello, ${profile.display_name.split(" ")[0]}`
                  : "Operator console"}
              </p>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 overflow-x-hidden px-4 py-4 pb-24 sm:px-5 sm:py-5 md:pb-6">
          <RequireAdmin>{children}</RequireAdmin>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/80 bg-card/95 px-2 py-2 backdrop-blur md:hidden">
          <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-1">
            {MOBILE_LINKS.map((l) => {
              const active =
                l.href === "/"
                  ? pathname === "/"
                  : pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <li key={l.href} className="min-w-0 flex-1">
                  <Link
                    href={l.href}
                    className={cn(
                      "flex flex-col items-center rounded-lg px-1 py-1.5 text-[10px] font-medium",
                      active
                        ? "bg-accent/20 text-accent-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}

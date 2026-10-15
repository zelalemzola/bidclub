"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileBarChart,
  Gavel,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  PlusCircle,
  Trophy,
  Users,
} from "lucide-react";
import { cn } from "@bidclub/ui";
import { createClient } from "@/lib/supabase/client";
import { useGetProfileQuery } from "@/store/api";

const NAV = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/reports", label: "Reports", icon: FileBarChart },
    ],
  },
  {
    label: "Arenas",
    items: [
      { href: "/auctions", label: "Auctions", icon: Gavel, matchPrefix: "/auctions" },
      { href: "/auctions/new", label: "Create auction", icon: PlusCircle },
      { href: "/winners", label: "Winners", icon: Trophy },
    ],
  },
  {
    label: "People",
    items: [{ href: "/users", label: "Users", icon: Users }],
  },
] as const;

type AdminSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

function isActive(pathname: string, item: (typeof NAV)[number]["items"][number]) {
  if ("exact" in item && item.exact) return pathname === item.href;
  if (item.href === "/auctions/new") return pathname.startsWith("/auctions/new");
  if ("matchPrefix" in item && item.matchPrefix) {
    if (pathname.startsWith("/auctions/new")) return false;
    return pathname === item.matchPrefix || pathname.startsWith(`${item.matchPrefix}/`);
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();

  async function signOut() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "flex h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[4.25rem]" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center gap-2.5 border-b border-sidebar-border px-3",
          collapsed && "justify-center px-2",
        )}
      >
        <span className="flex size-8 items-center justify-center rounded-md bg-sidebar-primary font-heading text-sm font-bold text-sidebar-primary-foreground">
          BC
        </span>
        {!collapsed ? (
          <div className="min-w-0 leading-tight">
            <p className="truncate font-heading text-[15px] font-semibold tracking-tight">
              BidClub
            </p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">Admin console</p>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {NAV.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <p className="mb-1.5 px-2 font-heading text-[11px] font-semibold tracking-[0.12em] text-sidebar-foreground/45 uppercase">
                {group.label}
              </p>
            ) : null}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(pathname, item);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      title={item.label}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                        collapsed && "justify-center px-2",
                        active
                          ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground shadow-sm"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden />
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="space-y-2 border-t border-sidebar-border p-2.5">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-sidebar-foreground/60 transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-2",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
          {!collapsed ? <span>Collapse</span> : null}
        </button>

        {!collapsed && profile ? (
          <div className="rounded-md bg-sidebar-accent/70 px-3 py-2">
            <p className="truncate font-heading text-sm font-semibold">
              {profile.display_name}
            </p>
            <p className="truncate text-[11px] text-sidebar-foreground/55 capitalize">
              {profile.role}
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={signOut}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-md bg-sidebar-primary px-2.5 py-2 text-sm font-medium text-sidebar-primary-foreground transition hover:brightness-105",
            collapsed && "justify-center px-2",
          )}
        >
          <LogOut className="size-4" aria-hidden />
          {!collapsed ? <span>Sign out</span> : null}
        </button>
      </div>
    </aside>
  );
}

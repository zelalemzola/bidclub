"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gavel, LogOut, Sparkles, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, cn } from "@bidclub/ui";
import { LanguageSwitcher } from "@/components/language-switcher";
import { createClient } from "@/lib/supabase/client";
import { useGetProfileQuery } from "@/store/api";

const DESKTOP_LINKS = [
  { href: "/", key: "home", match: (p: string) => p === "/" },
  {
    href: "/arenas",
    key: "arenas",
    match: (p: string) => p.startsWith("/arenas") || p.startsWith("/auctions"),
  },
  {
    href: "/winners",
    key: "winners",
    match: (p: string) => p.startsWith("/winners"),
  },
  {
    href: "/how-it-works",
    key: "howItWorks",
    match: (p: string) => p.startsWith("/how-it-works"),
  },
] as const;

function profileInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "BC";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

/**
 * Minimal floating shell — logo + actions sit on a soft scrim, while the
 * primary links live inside a self-contained glass pill (UniteCar-style).
 */
export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Nav");
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
    <header className="sticky top-0 z-40 w-full">
      <div className="header-scrim pointer-events-none absolute inset-x-0 top-0 h-28" aria-hidden />

      <div className="relative mx-auto flex h-16 max-w-[96rem] items-center justify-between gap-3 px-4 pt-3 sm:px-5 lg:h-[4.5rem] lg:px-6 xl:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl gold-fill font-display text-sm font-extrabold text-night">
            BC
          </span>
          <span className="font-display hidden text-xl font-bold tracking-tight text-ink sm:inline lg:text-[1.35rem]">
            BidClub
          </span>
        </Link>

        <nav
          className="nav-pill-glass absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full px-1.5 py-1.5 md:flex"
          aria-label="Primary"
        >
          {DESKTOP_LINKS.map((link) => {
            const active = link.match(pathname);
            const label = t(link.key);
            return (
              <Link
                key={link.key}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "gold-fill text-night shadow-[0_4px_16px_rgba(212,175,55,0.3)]"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                {link.key === "arenas" ? (
                  <Gavel className="size-3.5" aria-hidden />
                ) : link.key === "winners" ? (
                  <Trophy className="size-3.5" aria-hidden />
                ) : link.key === "howItWorks" ? (
                  <Sparkles className="size-3.5" aria-hidden />
                ) : null}
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          {profile ? (
            <>
              {!profile.registration_paid_at ? (
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href="/register-pay">{t("activate")}</Link>
                </Button>
              ) : null}

              <Link
                href="/profile"
                className={cn(
                  "relative hidden size-9 items-center justify-center overflow-hidden rounded-full",
                  "gold-fill font-display text-xs font-bold text-night",
                  "shadow-[0_4px_14px_rgba(155,196,30,0.28)] transition hover:brightness-105",
                  "sm:inline-flex",
                  pathname.startsWith("/profile") && "ring-2 ring-gold-deep/55 ring-offset-2 ring-offset-[color:var(--color-cream)]",
                )}
                aria-label={t("profile")}
                title={profile.display_name}
              >
                <span aria-hidden>{profileInitials(profile.display_name)}</span>
              </Link>

              <button
                type="button"
                onClick={signOut}
                className={cn(
                  "hidden size-9 items-center justify-center rounded-full border border-line bg-white text-ink-soft",
                  "shadow-[0_4px_14px_rgba(16,18,16,0.06)] transition",
                  "hover:border-danger/40 hover:bg-danger/5 hover:text-danger",
                  "sm:inline-flex",
                )}
                aria-label={t("signOut")}
                title={t("signOut")}
              >
                <LogOut className="size-4" strokeWidth={2.25} aria-hidden />
              </button>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">{t("join")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

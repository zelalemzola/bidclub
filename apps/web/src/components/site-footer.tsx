"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Reveal } from "@/components/motion";

type FooterLink = { href: string; label: string };

function FooterColumn({ heading, links }: { heading: string; links: FooterLink[] }) {
  return (
    <div className="space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-dim">
        {heading}
      </p>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-ink-soft/80 transition-colors hover:text-gold-bright"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Spacious glass footer — a lifted translucent tray that follows the
 * active page theme (border-line / text-gold-dim both swap per route).
 */
export function SiteFooter() {
  const t = useTranslations("Footer");
  const year = new Date().getFullYear();

  const exploreLinks: FooterLink[] = [
    { href: "/", label: t("explore.home") },
    { href: "/arenas", label: t("explore.arenas") },
    { href: "/winners", label: t("explore.winners") },
    { href: "/how-it-works", label: t("explore.howItWorks") },
  ];

  const accountLinks: FooterLink[] = [
    { href: "/login", label: t("account.login") },
    { href: "/signup", label: t("account.signup") },
    { href: "/profile", label: t("account.profile") },
  ];

  const legalLinks: FooterLink[] = [{ href: "/terms", label: t("legal.terms") }];

  return (
    <footer className="relative mt-20 px-3 pb-3 sm:px-4 lg:px-6">
      <Reveal className="relative mx-auto w-full max-w-[96rem] overflow-hidden rounded-[2rem] border border-line glass-panel lg:rounded-[2.5rem]">
        <div className="pointer-events-none absolute inset-0 bc-lattice opacity-[0.1]" aria-hidden />

        <div className="relative px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-10">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl gold-fill font-display text-sm font-extrabold text-night">
                  BC
                </span>
                <span className="font-display text-xl font-bold tracking-tight text-ink">
                  BidClub
                </span>
              </Link>
              <p className="max-w-xs text-sm leading-relaxed text-ink-soft/75">{t("blurb")}</p>
            </div>

            <FooterColumn heading={t("explore.heading")} links={exploreLinks} />
            <FooterColumn heading={t("account.heading")} links={accountLinks} />
            <FooterColumn heading={t("legal.heading")} links={legalLinks} />
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-line/60 pt-6 text-xs text-mute sm:flex-row sm:items-center sm:justify-between">
            <p>{t("copyright", { year })}</p>
            <p className="max-w-md leading-relaxed sm:text-right">{t("disclaimer")}</p>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}

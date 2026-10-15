"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@bidclub/ui";
import { setLocale } from "@/app/actions/locale";
import { type Locale } from "@/i18n/config";

/**
 * Compact icon button for the header that toggles between English and
 * Amharic. Persists the choice as the `NEXT_LOCALE` cookie (via the
 * `setLocale` server action) and refreshes the router so server components
 * re-render with the new locale.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const locale = useLocale() as Locale;
  const t = useTranslations("Language");
  const [isPending, startTransition] = useTransition();
  const [optimisticLocale, setOptimisticLocale] = useState<Locale | null>(null);

  const current = optimisticLocale ?? locale;
  const next: Locale = current === "en" ? "am" : "en";

  function toggle() {
    setOptimisticLocale(next);
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      aria-label={`${t("switchLabel")}: ${t(next)}`}
      title={`${t("switchLabel")}: ${t(next)}`}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full border border-line bg-paper px-2.5 text-xs font-bold uppercase tracking-wide text-ink-soft transition-colors hover:border-gold/40 hover:text-gold-bright disabled:opacity-60",
        className,
      )}
    >
      <Languages className="size-4" aria-hidden />
      <span className="hidden sm:inline">{current.toUpperCase()}</span>
    </button>
  );
}

"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { signInSchema } from "@bidclub/shared";
import { Button, Input, Label } from "@bidclub/ui";
import { PageEnter, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { getErrorMessage } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";

function BrandMark() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl gold-fill font-display text-lg font-extrabold text-night shadow-[0_8px_24px_rgba(212,175,55,0.3)]">
      BC
    </div>
  );
}

function LoginCardSkeleton() {
  return (
    <div className="space-y-4 rounded-[1.75rem] border border-line glass-panel p-5 sm:p-7">
      <div className="h-11 animate-pulse rounded-xl bg-cream-deep" />
      <div className="h-11 animate-pulse rounded-xl bg-cream-deep" />
      <div className="h-11 animate-pulse rounded-xl bg-cream-deep" />
    </div>
  );
}

function LoginCard() {
  const t = useTranslations("Auth.login");
  const tErrors = useTranslations("Auth.errors");
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? tErrors("checkDetails"));
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      // Drop any existing session first so we never keep a previous user's profile
      await supabase.auth.signOut();
      const { error: authError } = await supabase.auth.signInWithPassword(parsed.data);
      if (authError) {
        setError(
          authError.message === "Invalid login credentials"
            ? tErrors("invalidCredentials")
            : authError.message,
        );
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, tErrors("loginFailed")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-line glass-panel p-5 sm:p-7">
      <form onSubmit={onSubmit} className="relative space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("fields.email")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t("fields.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t("fields.password")}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder={t("fields.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? t("submitting") : t("submit")}
        </Button>
      </form>

      <p className="relative mt-4 text-center text-sm text-mute">
        {t("noAccount")}{" "}
        <Link href="/signup" className="font-semibold text-gold-bright hover:underline">
          {t("createAccount")}
        </Link>
      </p>
    </div>
  );
}

/**
 * Centered white-glass auth screen — Light UniteCar system: soft sage
 * backdrop, white glass card, lime CTA, dark ink copy throughout.
 */
export default function LoginPage() {
  const t = useTranslations("Auth.login");
  const perks = t.raw("perks") as { title: string; body: string }[];

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 pt-10 pb-14 sm:px-6 md:max-w-lg lg:max-w-xl lg:pt-16">
      <PageEnter className="flex flex-col items-center gap-3 text-center">
        <BrandMark />
        <div>
          <p className="text-[11px] font-bold tracking-[0.28em] text-gold-dim uppercase">
            {t("eyebrow")}
          </p>
          <h1 className="font-display mt-1 text-3xl font-extrabold text-ink">
            {t("title")}
          </h1>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-mute">{t("subtitle")}</p>
      </PageEnter>

      <Reveal>
        <Suspense fallback={<LoginCardSkeleton />}>
          <LoginCard />
        </Suspense>
      </Reveal>

      <Reveal className="space-y-3 rounded-[1.75rem] border border-line glass-panel p-5 sm:p-6">
        <p className="text-[11px] font-bold tracking-[0.18em] text-gold-dim uppercase">
          {t("sealedPlayTitle")}
        </p>
        <p className="text-sm leading-relaxed text-ink-soft">
          {t.rich("sealedPlayBody", {
            b: (chunks) => <span className="font-semibold text-ink">{chunks}</span>,
          })}
        </p>
      </Reveal>

      <Stagger className="grid grid-cols-2 gap-3">
        {perks.map((item) => (
          <StaggerItem
            key={item.title}
            className="rounded-2xl border border-line glass-panel px-3 py-4 text-center"
          >
            <p className="font-display text-sm font-bold text-gold-bright">{item.title}</p>
            <p className="mt-1 text-[11px] text-mute">{item.body}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}

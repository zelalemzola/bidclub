"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BID_FEE_BIRR, REGISTRATION_FEE_BIRR, signUpSchema } from "@bidclub/shared";
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

/**
 * Light UniteCar auth screen: a single centered white-glass card holds the
 * form, with a compact benefits strip underneath — mirrors the login
 * page's rhythm so the two feel like one auth family.
 */
export default function SignUpPage() {
  const router = useRouter();
  const t = useTranslations("Auth.signup");
  const tErrors = useTranslations("Auth.errors");
  const tTerms = useTranslations("Terms");

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const BENEFITS = t.raw("benefits") as { title: string; body: string }[];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!acceptedTerms) {
      setError(tTerms("requiredError"));
      return;
    }

    const parsed = signUpSchema.safeParse({ email, password, displayName, phone });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? tErrors("checkDetails"));
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      // Clear any prior session (e.g. seeded admin) so signup doesn't keep that profile
      await supabase.auth.signOut();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: {
            display_name: parsed.data.displayName,
            phone: parsed.data.phone,
          },
        },
      });
      if (authError) {
        setError(authError.message);
        return;
      }

      // Belt-and-suspenders: write name + phone onto the profile row
      if (authData.user) {
        await supabase
          .from("profiles")
          .update({
            display_name: parsed.data.displayName,
            phone: parsed.data.phone,
          })
          .eq("id", authData.user.id);
      }

      if (!authData.session) {
        router.push("/login?next=/register-pay");
        router.refresh();
        return;
      }

      router.push("/register-pay");
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, tErrors("signupFailed")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 pt-10 pb-14 sm:px-6 md:max-w-lg lg:max-w-xl lg:pt-16">
      <PageEnter className="flex flex-col items-center gap-3 text-center">
        <BrandMark />
        <div>
          <p className="text-[11px] font-bold tracking-[0.28em] text-gold-dim uppercase">
            {t("eyebrow")}
          </p>
          <h1 className="font-display mt-1 text-3xl font-extrabold text-ink lg:text-4xl">
            {t("title")}
          </h1>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-mute">{t("subtitle")}</p>
      </PageEnter>

      <Reveal className="relative overflow-hidden rounded-[1.75rem] border border-line glass-panel p-5 sm:p-7">
        <form onSubmit={onSubmit} className="relative space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="displayName">{t("fields.displayName")}</Label>
            <Input
              id="displayName"
              autoComplete="name"
              placeholder={t("fields.displayNamePlaceholder")}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>
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
            <Label htmlFor="phone">{t("fields.phone")}</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder={t("fields.phonePlaceholder")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("fields.password")}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder={t("fields.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-line accent-[color:var(--color-gold,#d4af37)]"
            />
            <span>
              {tTerms("acceptLabel", { termsLink: tTerms("termsLinkText") }).split(
                tTerms("termsLinkText"),
              )[0]}
              <Link href="/terms" className="font-semibold text-gold-bright hover:underline">
                {tTerms("termsLinkText")}
              </Link>
              {tTerms("acceptLabel", { termsLink: tTerms("termsLinkText") }).split(
                tTerms("termsLinkText"),
              )[1]}
            </span>
          </label>

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
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-semibold text-gold-bright hover:underline">
            {t("logIn")}
          </Link>
        </p>
      </Reveal>

      <Reveal className="rounded-[1.75rem] border border-line glass-panel p-5 sm:p-6">
        <p className="text-[11px] font-bold tracking-[0.18em] text-gold-dim uppercase">
          {t("benefitsTitle")}
        </p>
        <Stagger as="ul" className="mt-4 space-y-4">
          {BENEFITS.map((benefit) => (
            <StaggerItem as="li" key={benefit.title} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full gold-fill text-[11px] font-bold text-night">
                ✓
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">
                  {benefit.title
                    .replace("{registrationFee}", String(REGISTRATION_FEE_BIRR))
                    .replace("{bidFee}", String(BID_FEE_BIRR))}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{benefit.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Reveal>
    </div>
  );
}

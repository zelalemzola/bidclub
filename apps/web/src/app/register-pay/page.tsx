"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BID_FEE_BIRR, REGISTRATION_FEE_BIRR } from "@bidclub/shared";
import { Button } from "@bidclub/ui";
import { PageEnter, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { getErrorMessage } from "@/lib/errors";
import { useGetProfileQuery, useMockPayRegistrationMutation } from "@/store/api";

function PageHeader({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-dim">{eyebrow}</p>
      <h1 className="font-display text-3xl font-extrabold text-ink">{title}</h1>
      <p className="max-w-xs text-sm leading-relaxed text-mute">{body}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-6 sm:px-6 md:max-w-lg lg:max-w-3xl lg:px-8">
      <div className="h-24 animate-pulse rounded-2xl bg-cream-deep" />
      <div className="h-48 animate-pulse rounded-2xl bg-cream-deep" />
    </div>
  );
}

function SignedOutState() {
  const t = useTranslations("RegisterPay.signedOut");
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-6 sm:px-6 md:max-w-lg lg:max-w-3xl lg:px-8">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} body={t("body")} />
      <div className="rounded-2xl border border-line p-5 vault-panel">
        <Button asChild size="lg" className="w-full">
          <Link href="/login?next=/register-pay">{t("cta")}</Link>
        </Button>
      </div>
    </div>
  );
}

function AlreadyPaidState() {
  const t = useTranslations("RegisterPay.alreadyPaid");
  const router = useRouter();
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 pb-10 pt-6 sm:px-6 md:max-w-lg lg:max-w-3xl lg:px-8">
      <PageHeader eyebrow={t("eyebrow")} title={t("title")} body={t("body")} />
      <div className="space-y-3 rounded-2xl border border-line p-5 vault-panel">
        <div className="flex items-center justify-between rounded-xl bg-success/10 px-3.5 py-3">
          <span className="text-sm font-semibold text-success">{t("statusBadge")}</span>
          <span className="font-mono text-sm font-bold text-success">
            {t("paidAmount", { fee: REGISTRATION_FEE_BIRR })}
          </span>
        </div>
        <Button size="lg" className="w-full" onClick={() => router.push("/#live-auctions")}>
          {t("browseLive")}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full"
          onClick={() => router.push("/profile")}
        >
          {t("viewProfile")}
        </Button>
      </div>
    </div>
  );
}

function ActivateForm() {
  const t = useTranslations("RegisterPay");
  const tForm = useTranslations("RegisterPay.form");
  const router = useRouter();
  const [pay, { isLoading: paying, error }] = useMockPayRegistrationMutation();

  const unlocks = t.raw("unlocks") as { title: string; body: string }[];

  async function handlePay() {
    const result = await pay();
    if ("data" in result) {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-8 px-4 pt-6 pb-10 sm:px-6 md:max-w-lg lg:max-w-5xl lg:grid-cols-2 lg:items-start lg:gap-10 lg:px-8 lg:pt-10">
      <PageEnter className="space-y-6">
        <PageHeader
          eyebrow={tForm("eyebrow")}
          title={tForm("title")}
          body={tForm("body")}
        />
        <div className="space-y-4 rounded-2xl border border-line p-5 vault-panel">
          <p className="text-[11px] font-bold tracking-[0.18em] text-gold-dim uppercase">
            {tForm("unlocksTitle", { fee: REGISTRATION_FEE_BIRR })}
          </p>
          <Stagger as="ul" className="space-y-4">
            {unlocks.map((item) => (
              <StaggerItem as="li" key={item.title} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full gold-fill text-[11px] font-bold text-night">
                  ✓
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {item.title.replace("{bidFee}", String(BID_FEE_BIRR))}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{item.body}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <div className="space-y-2 rounded-2xl border border-dashed border-gold/25 bg-champagne/20 p-5">
          <p className="text-[11px] font-bold tracking-[0.18em] text-gold-dim uppercase">
            {tForm("ruleNoteTitle")}
          </p>
          <p className="text-sm leading-relaxed text-ink-soft">
            {tForm.rich("ruleNoteBody", {
              b: (chunks) => <span className="font-semibold text-ink">{chunks}</span>,
            })}
          </p>
        </div>
      </PageEnter>

      <Reveal className="overflow-hidden rounded-2xl border border-line vault-panel lg:sticky lg:top-24">
        <div className="bg-gradient-to-br from-champagne/60 to-transparent px-6 py-8 text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-mute">
            {tForm("feeLabel")}
          </span>
          <p className="mt-2 font-mono text-5xl font-bold text-gold-bright">
            {REGISTRATION_FEE_BIRR}
            <span className="ml-2 text-base font-semibold text-mute">ETB</span>
          </p>
        </div>
        <div className="space-y-4 border-t border-line p-5">
          {error ? (
            <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
              {getErrorMessage(error, tForm("paymentFailed"))}
            </p>
          ) : null}

          <Button size="lg" className="w-full" disabled={paying} onClick={handlePay}>
            {paying
              ? tForm("processing")
              : tForm("pay", { fee: REGISTRATION_FEE_BIRR })}
          </Button>

          <p className="text-center text-xs text-mute">{tForm("mockNote")}</p>
        </div>
      </Reveal>
    </div>
  );
}

export default function RegisterPayPage() {
  const { data: profile, isLoading, isError } = useGetProfileQuery();

  if (isLoading) return <LoadingState />;
  if (isError || !profile) return <SignedOutState />;
  if (profile.registration_paid_at) return <AlreadyPaidState />;
  return <ActivateForm />;
}

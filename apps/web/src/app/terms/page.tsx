import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { TERMS_META as TERMS_META_AM, TERMS_SECTIONS as TERMS_SECTIONS_AM, TERMS_TITLE as TERMS_TITLE_AM } from "@/content/terms-am";
import { TERMS_META as TERMS_META_EN, TERMS_SECTIONS as TERMS_SECTIONS_EN, TERMS_TITLE as TERMS_TITLE_EN } from "@/content/terms-en";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Terms");
  return { title: `${t("title")} — BidClub` };
}

export default async function TermsPage() {
  const locale = await getLocale();
  const t = await getTranslations("Terms");

  const title = locale === "am" ? TERMS_TITLE_AM : TERMS_TITLE_EN;
  const meta = locale === "am" ? TERMS_META_AM : TERMS_META_EN;
  const sections = locale === "am" ? TERMS_SECTIONS_AM : TERMS_SECTIONS_EN;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <header className="space-y-2 border-b border-line pb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-dim">
          {t("title")}
        </p>
        <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">{title}</h1>
        <p className="text-sm text-mute">{meta}</p>
      </header>

      <article className="prose-terms mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.id} className="space-y-3">
            {section.title ? (
              <h2 className="font-display text-xl font-bold text-ink">{section.title}</h2>
            ) : null}
            <div className="space-y-3">
              {section.paragraphs.map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-ink-soft">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </article>
    </div>
  );
}

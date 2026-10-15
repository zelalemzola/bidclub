import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@bidclub/ui";
import { HowItWorksContent } from "@/components/how-it-works-content";
import { HowItWorksActions } from "@/components/how-it-works-actions";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("HowItWorks");
  return { title: `${t("title")} — BidClub` };
}

export default async function HowItWorksPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pt-8 pb-16 sm:px-6 lg:px-8">
      <HowItWorksContent />
      <HowItWorksActions />
    </div>
  );
}

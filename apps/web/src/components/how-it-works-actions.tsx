"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@bidclub/ui";
import { Reveal } from "@/components/motion";

export function HowItWorksActions() {
  const t = useTranslations("Home.hero");

  return (
    <Reveal className="flex flex-wrap gap-3 border-t border-line pt-6">
      <Button asChild size="lg">
        <Link href="/arenas">{t("ctaBrowse")}</Link>
      </Button>
      <Button asChild size="lg" variant="outline">
        <Link href="/signup">{t("ctaJoin")}</Link>
      </Button>
    </Reveal>
  );
}

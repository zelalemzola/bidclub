"use client";

import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@bidclub/ui";
import { HowItWorksContent } from "@/components/how-it-works-content";

/**
 * Renders the same HowItWorks content as /how-it-works inside a Dialog.
 * Opens either when the trigger button is clicked, or automatically when
 * the URL has `?how=1` (so it can be deep-linked from anywhere).
 *
 * Wrapped in Suspense because it reads `useSearchParams`.
 */
export function HowItWorksDialog({
  trigger,
}: {
  /** Custom trigger node. Falls back to a default outline button. */
  trigger?: React.ReactNode;
}) {
  return (
    <Suspense fallback={<HowItWorksDialogTrigger trigger={trigger} />}>
      <HowItWorksDialogInner trigger={trigger} />
    </Suspense>
  );
}

function HowItWorksDialogTrigger({ trigger }: { trigger?: React.ReactNode }) {
  const t = useTranslations("HowItWorks");
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            {t("title")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        </DialogHeader>
        <HowItWorksContent />
      </DialogContent>
    </Dialog>
  );
}

function HowItWorksDialogInner({ trigger }: { trigger?: React.ReactNode }) {
  const t = useTranslations("HowItWorks");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // `null` means "no manual override yet" — fall back to the URL flag so
  // the dialog can be deep-linked via `?how=1`.
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const open = manualOpen ?? searchParams.get("how") === "1";

  function handleOpenChange(next: boolean) {
    setManualOpen(next);
    if (!next && searchParams.get("how") === "1") {
      const params = new URLSearchParams(searchParams);
      params.delete("how");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            {t("title")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        </DialogHeader>
        <HowItWorksContent />
      </DialogContent>
    </Dialog>
  );
}

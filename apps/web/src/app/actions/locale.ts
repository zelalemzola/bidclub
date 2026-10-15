"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, type Locale } from "@/i18n/config";

/**
 * Server action that persists the active locale as a cookie so next-intl's
 * request config (src/i18n/request.ts) picks it up on the next render.
 */
export async function setLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

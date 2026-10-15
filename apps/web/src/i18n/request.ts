import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";

/**
 * next-intl request config for BidClub.
 *
 * BidClub does not use locale-prefixed routing (no `/en/...` or `/am/...`
 * segments). Instead the active locale is resolved from the `NEXT_LOCALE`
 * cookie (set via a language switcher / server action), falling back to the
 * `Accept-Language` header on first visit, and finally to `defaultLocale`.
 */
export default getRequestConfig(async () => {
  const locale = await resolveLocale();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const headerList = await headers();
  const acceptLanguage = headerList.get("accept-language");
  const preferred = acceptLanguage
    ?.split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase().slice(0, 2));
  const matched = preferred?.find((lang) => isLocale(lang));
  if (isLocale(matched)) {
    return matched;
  }

  return defaultLocale;
}

import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_Ethiopic, Poppins } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { MobileNav } from "@/components/mobile-nav";
import { PageBackdrop } from "@/components/page-backdrop";
import { PageTheme } from "@/components/page-theme";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoreProvider } from "@/store/provider";
import "./globals.css";
import "./page-themes.css";

/** UniteCar-style geometric UI — Poppins for display + body */
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-sans-face",
  weight: ["400", "500", "600", "700", "800"],
});

const display = Poppins({
  subsets: ["latin"],
  variable: "--font-display-face",
  weight: ["600", "700", "800"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  weight: ["500", "600", "700"],
});

const ethiopic = Noto_Sans_Ethiopic({
  subsets: ["ethiopic"],
  variable: "--font-ethiopic-face",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BidClub — Lowest unique bid wins",
  description:
    "Sealed bidding arenas in Ethiopian birr. Lock a private number, stay anonymous, and win with the lowest unique bid.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${poppins.variable} ${display.variable} ${mono.variable} ${ethiopic.variable}`}
    >
      <body className="overflow-x-clip">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <StoreProvider>
            <PageTheme>
              <PageBackdrop />
              <SiteHeader />
              <main className="relative mx-auto min-h-[calc(100dvh-3.5rem)] w-full max-w-[96rem] pb-32 md:pb-12">
                {children}
              </main>
              <SiteFooter />
              <MobileNav />
            </PageTheme>
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

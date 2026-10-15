import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { StoreProvider } from "@/store/provider";
import "./globals.css";

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-sans",
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-mono",
  weight: ["400", "500", "600"],
});

const nav = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "BidClub Admin",
    template: "%s · BidClub Admin",
  },
  description: "Operator console for arenas, winners, users, and fee reports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${mono.variable} ${nav.variable} h-full`}
    >
      <body className="min-h-full font-sans antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}

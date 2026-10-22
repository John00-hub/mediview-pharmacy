import type { Metadata, Viewport } from "next";
import { Montserrat, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { BasketProvider } from "@/components/basket-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AnnouncementBar } from "@/components/ui";
import { StickyMobileBar } from "@/components/sticky-mobile-bar";
import { JsonLd } from "@/components/JsonLd";
import { db } from "@/lib/data";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_URL,
  organizationJsonLd,
} from "@/lib/seo";
import { BUSINESS } from "@/lib/brand";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${BUSINESS.name}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: `${BUSINESS.name} — Demo`,
  keywords: ["pharmacy Abuja", "Wuse 2 pharmacy", "medicines Nigeria", BUSINESS.name],
};

export const viewport: Viewport = {
  themeColor: "#143d2b",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const store = db();
  const [categories, content] = await Promise.all([store.listCategories(), store.getContent()]);

  return (
    <html lang="en" className={`${montserrat.variable} ${sourceSans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-sm focus:bg-brand-900 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to main content
        </a>
        <BasketProvider>
          <AnnouncementBar text={content.announcement.text} enabled={content.announcement.enabled} />
          <Header categories={categories} />
          <main id="main" className="flex-1 pb-16 lg:pb-0">
            {children}
          </main>
          <Footer categories={categories} content={content} />
          <StickyMobileBar />
        </BasketProvider>
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}

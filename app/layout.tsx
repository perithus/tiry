import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "@/styles/globals.css";
import { HashScrollManager } from "@/components/shared/hash-scroll-manager";
import { env } from "@/lib/config/env";
import { getLocale } from "@/lib/i18n/server";
import { CookieBanner } from "@/components/shared/cookie-banner";
import { ToastProvider } from "@/components/shared/toast-provider";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans"
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  metadataBase: new URL(env.APP_URL),
  title: {
    default: `${env.APP_NAME} | Truck advertising marketplace`,
    template: `%s | ${env.APP_NAME}`
  },
  description:
    "B2B marketplace for truck advertising, trailer advertising, and fleet media campaigns across Europe.",
  keywords: [
    "truck advertising",
    "trailer advertising",
    "fleet advertising",
    "mobile outdoor advertising",
    "truck media marketplace",
    "advertising on trucks Europe"
  ],
  openGraph: {
    title: `${env.APP_NAME} | Truck advertising marketplace`,
    description: "Verified truck and trailer advertising inventory for B2B media planning across Europe.",
    url: env.APP_URL,
    siteName: env.APP_NAME,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: `${env.APP_NAME} | Truck advertising marketplace`,
    description: "Verified truck and trailer advertising inventory for B2B media planning across Europe."
  }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${manrope.variable} ${cormorantGaramond.variable}`}>
        <ToastProvider>
          <HashScrollManager />
          {children}
          <CookieBanner locale={locale} />
        </ToastProvider>
      </body>
    </html>
  );
}

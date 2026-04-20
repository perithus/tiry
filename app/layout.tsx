import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "@/styles/globals.css";
import { env } from "@/lib/config/env";
import { getLocale } from "@/lib/i18n/server";
import { CookieBanner } from "@/components/shared/cookie-banner";

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
    "B2B marketplace connecting advertisers with transport companies selling premium truck and trailer advertising space."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${manrope.variable} ${cormorantGaramond.variable}`}>
        {children}
        <CookieBanner locale={locale} />
      </body>
    </html>
  );
}

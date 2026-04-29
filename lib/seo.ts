import type { Metadata } from "next";
import { env } from "@/lib/config/env";
import type { Locale } from "@/lib/i18n/shared";

const localeMap: Record<Locale, string> = {
  en: "en_GB",
  pl: "pl_PL"
};

export function getLocalizedPath(path: string, locale: Locale) {
  if (locale === "en") {
    return path;
  }

  return `/api/locale?locale=${locale}&redirectTo=${encodeURIComponent(path)}`;
}

export function buildPageMetadata(input: {
  locale: Locale;
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}) {
  const canonicalPath = input.path || "/";
  const canonicalUrl = canonicalPath === "/" ? env.APP_URL : `${env.APP_URL}${canonicalPath}`;

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: {
      canonical: canonicalPath,
      languages: {
        "en-GB": canonicalPath,
        "pl-PL": getLocalizedPath(canonicalPath, "pl")
      }
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonicalUrl,
      siteName: env.APP_NAME,
      locale: localeMap[input.locale],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description
    }
  } satisfies Metadata;
}

export function organizationSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: env.APP_NAME,
    url: env.APP_URL,
    description:
      locale === "pl"
        ? "Marketplace B2B łączący reklamodawców z firmami transportowymi oferującymi reklamę na ciężarówkach i naczepach."
        : "B2B marketplace connecting advertisers with transport companies offering truck and trailer advertising inventory.",
    areaServed: "Europe"
  };
}

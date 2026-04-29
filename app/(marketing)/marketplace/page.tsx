import type { Metadata } from "next";
import { PricingModel } from "@prisma/client";
import { FilterBar } from "@/components/marketplace/filter-bar";
import { ListingCard } from "@/components/marketplace/listing-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getMarketplaceListings } from "@/lib/data/queries";
import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return buildPageMetadata({
    locale,
    title: locale === "pl" ? "Marketplace reklamy na ciężarówkach" : "Truck Advertising Marketplace Listings",
    description:
      locale === "pl"
        ? "Przeglądaj zweryfikowane oferty reklamy na ciężarówkach i naczepach, filtruj po krajach, trasach i modelach cenowych."
        : "Browse verified truck and trailer advertising listings, filtered by geography, route scope, and pricing model.",
    path: "/marketplace",
    keywords: ["truck advertising listings", "trailer advertising inventory", "fleet media listings"]
  });
}

export default async function MarketplacePage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const t = getMessages(locale);
  const params = (await searchParams) ?? {};
  const country = typeof params.country === "string" ? params.country : undefined;
  const routeScope = typeof params.routeScope === "string" ? params.routeScope as "DOMESTIC" | "INTERNATIONAL" | "MIXED" : undefined;
  const pricingModel = typeof params.pricingModel === "string" ? params.pricingModel as PricingModel : undefined;
  const search = typeof params.search === "string" ? params.search : undefined;
  const listings = await getMarketplaceListings({ country, routeScope, pricingModel, search });
  const countries = [...new Set(listings.map((listing) => listing.baseCountry))];
  const seoIntro =
    locale === "pl"
      ? "Ta strona marketplace została zoptymalizowana pod wyszukiwania związane z reklamą na ciężarówkach, reklamą flotową i inventory outdoorowym w Europie. Każda oferta łączy dane o trasach, dostępności i modelu cenowym, dzięki czemu łatwiej ocenić dopasowanie do kampanii."
      : "This marketplace page is optimized for searches around truck advertising, fleet advertising, and mobile outdoor inventory in Europe. Every listing combines route data, availability, and pricing context to help buyers assess fit faster.";

  return (
    <section className="container-shell py-20">
      <SectionHeading
        eyebrow={t.marketing.marketplace.eyebrow}
        title={t.marketing.marketplace.title}
        description={t.marketing.marketplace.description}
      />
      <div className="mt-10">
        <FilterBar countries={countries} pricingModels={Object.values(PricingModel)} locale={locale} />
      </div>
      <div className="mt-8 rounded-[1.75rem] border border-ink-100 bg-white/80 p-6 text-sm leading-7 text-ink-600">
        {seoIntro}
      </div>
      <div className="mt-10 grid gap-6">
        {listings.length ? (
          listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
        ) : (
          <div className="glass-panel p-10 text-center">
            <h3 className="font-display text-xl font-semibold tracking-tight text-ink-900">{t.marketing.marketplace.emptyTitle}</h3>
            <p className="mt-3 text-sm text-ink-600">{t.marketing.marketplace.emptyBody}</p>
          </div>
        )}
      </div>
    </section>
  );
}

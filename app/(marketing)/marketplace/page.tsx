import { PricingModel } from "@prisma/client";
import { FilterBar } from "@/components/marketplace/filter-bar";
import { ListingCard } from "@/components/marketplace/listing-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getMarketplaceListings } from "@/lib/data/queries";
import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";

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

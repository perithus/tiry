import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { StatusBadge } from "@/components/shared/status-badge";
import { getListingBySlug } from "@/lib/data/queries";
import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

export default async function ListingDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getLocale();
  const t = getMessages(locale);
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  return (
    <section className="container-shell py-20">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="glass-panel p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">{listing.company.displayName}</p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink-900">{listing.title}</h1>
              </div>
              <StatusBadge label={listing.verificationStatus.toLowerCase()} tone="success" />
            </div>
            <p className="mt-6 text-base leading-8 text-ink-700">{listing.description}</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <InfoItem label={t.marketing.listing.baseLocation} value={`${listing.baseCity}, ${listing.baseCountry}`} />
              <InfoItem label={t.marketing.listing.pricing} value={formatCurrency(listing.priceFromCents, listing.currency)} />
              <InfoItem label={t.marketing.listing.estimatedReach} value={formatNumber(listing.estimatedCampaignReach)} />
              <InfoItem label={t.marketing.listing.monthlyMileage} value={`${formatNumber(listing.estimatedMonthlyMileage)} km`} />
            </div>
          </div>
          <div className="glass-panel p-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-900">{t.marketing.listing.routeCoverage}</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {listing.routeCoverage.map((route) => (
                <span key={route.id} className="rounded-full bg-ink-100 px-4 py-2 text-sm text-ink-700">
                  {route.routeLabel ?? `${route.city ? `${route.city}, ` : ""}${route.country}`}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <InquiryForm listingId={listing.id} />
          <div className="glass-panel p-6">
            <h3 className="font-display text-lg font-semibold tracking-tight text-ink-900">{t.marketing.listing.advertiserInfoTitle}</h3>
            <p className="mt-3 text-sm leading-7 text-ink-600">{t.marketing.listing.advertiserInfoBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-ink-50 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-ink-500">{label}</p>
      <p className="mt-2 text-base font-medium text-ink-900">{value}</p>
    </div>
  );
}

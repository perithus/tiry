import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { StatusBadge } from "@/components/shared/status-badge";
import { removeSavedListing, saveListingForAdvertiser } from "@/lib/actions/advertiser";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getListingBySlug } from "@/lib/data/queries";
import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";
import { buildPageMetadata } from "@/lib/seo";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const locale = await getLocale();
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return buildPageMetadata({
      locale,
      title: locale === "pl" ? "Oferta nie została znaleziona" : "Listing not found",
      description: locale === "pl" ? "Ta oferta nie jest już dostępna." : "This listing is no longer available.",
      path: `/marketplace/${slug}`
    });
  }

  return buildPageMetadata({
    locale,
    title: `${listing.title} | ${listing.company.displayName}`,
    description: listing.description.slice(0, 155),
    path: `/marketplace/${listing.slug}`,
    keywords: [
      listing.baseCountry,
      listing.baseCity,
      listing.company.displayName,
      "truck advertising listing",
      "trailer advertising inventory"
    ]
  });
}

export default async function ListingDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getLocale();
  const t = getMessages(locale);
  const session = await getSession();
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    notFound();
  }

  const saved = session?.user.role === "ADVERTISER"
    ? await prisma.savedListing.findUnique({
        where: {
          userId_listingId: {
            userId: session.user.id,
            listingId: listing.id
          }
        },
        select: { id: true }
      })
    : null;

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
            {session?.user.role === "ADVERTISER" ? (
              <form action={saved ? removeSavedListing : saveListingForAdvertiser} className="mt-6">
                <input type="hidden" name="listingId" value={listing.id} />
                <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">
                  {saved ? (locale === "pl" ? "Usuń z zapisanych" : "Remove from saved") : (locale === "pl" ? "Zapisz ofertę" : "Save listing")}
                </button>
              </form>
            ) : null}
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <InfoItem label={t.marketing.listing.baseLocation} value={`${listing.baseCity}, ${listing.baseCountry}`} />
              <InfoItem label={t.marketing.listing.pricing} value={formatCurrency(listing.priceFromCents, listing.currency)} />
              <InfoItem label={t.marketing.listing.estimatedReach} value={formatNumber(listing.estimatedCampaignReach)} />
              <InfoItem label={t.marketing.listing.monthlyMileage} value={`${formatNumber(listing.estimatedMonthlyMileage)} km`} />
            </div>
          </div>
          {listing.images.length > 0 ? (
            <div className="glass-panel p-8">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
                {locale === "pl" ? "Zdjęcia nośnika" : "Listing media"}
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {listing.images.map((image) => (
                  <figure key={image.id} className="overflow-hidden rounded-[1.5rem] border border-ink-100 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt={image.alt} className="h-64 w-full object-cover" />
                    <figcaption className="px-4 py-3 text-sm text-ink-600">{image.alt}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ) : null}
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

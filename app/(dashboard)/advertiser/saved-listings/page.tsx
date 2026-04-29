import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { removeSavedListing } from "@/lib/actions/advertiser";
import { requireRole } from "@/lib/auth/permissions";
import { getAdvertiserNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

export default async function SavedListingsPage() {
  const locale = await getLocale();
  const t = getMessages(locale);
  const session = await requireRole("ADVERTISER");
  const savedListings = await prisma.savedListing.findMany({
    where: { userId: session.user.id },
    include: {
      listing: {
        include: {
          company: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardShell
      title={t.dashboard.advertiser.title}
      nav={getAdvertiserNav(locale)}
      heading={t.dashboard.advertiser.savedListings}
      subheading={t.dashboard.advertiser.savedListingsSubheading}
      locale={locale}
    >
      <div className="grid gap-4">
        {savedListings.length === 0 ? (
          <div className="glass-panel p-8 text-sm text-ink-600">
            {locale === "pl" ? "Nie masz jeszcze zapisanych ofert." : "You do not have any saved listings yet."}
          </div>
        ) : (
          savedListings.map(({ listing }) => (
            <div key={listing.id} className="glass-panel p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">{listing.company.displayName}</p>
                  <h2 className="font-display text-2xl font-semibold text-ink-900">
                    <Link href={`/marketplace/${listing.slug}`} className="hover:text-teal-700">
                      {listing.title}
                    </Link>
                  </h2>
                  <p className="text-sm leading-6 text-ink-600">{listing.description}</p>
                  <div className="grid gap-2 text-sm text-ink-600 md:grid-cols-3">
                    <p>{listing.baseCity}, {listing.baseCountry}</p>
                    <p>{formatNumber(listing.estimatedCampaignReach)} est.</p>
                    <p>{formatCurrency(listing.priceFromCents, listing.currency)}</p>
                  </div>
                </div>
                <form action={removeSavedListing}>
                  <input type="hidden" name="listingId" value={listing.id} />
                  <button className="rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-ink-900 ring-1 ring-ink-200 hover:bg-ink-50">
                    {locale === "pl" ? "Usuń z zapisanych" : "Remove from saved"}
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardShell>
  );
}

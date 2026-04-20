import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { getAdminNav } from "@/lib/data/navigation";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { reviewListing } from "@/lib/actions/admin";
import { getLocale } from "@/lib/i18n/server";

const copy = {
  en: {
    title: "Admin control",
    heading: "Listing moderation",
    subheading: "Control supply quality, visibility, and verification state while preserving an auditable moderation trail.",
    company: "Company",
    location: "Location",
    pricing: "Pricing",
    status: "Status",
    verification: "Verification",
    save: "Save moderation"
  },
  pl: {
    title: "Panel administratora",
    heading: "Moderacja ofert",
    subheading: "Kontroluj jakość podaży, widoczność i stan weryfikacji, zachowując audytowalny ślad moderacji.",
    company: "Firma",
    location: "Lokalizacja",
    pricing: "Cennik",
    status: "Status",
    verification: "Weryfikacja",
    save: "Zapisz moderację"
  }
} as const;

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "ACTIVE" || status === "VERIFIED") return "success";
  if (status === "DRAFT" || status === "PENDING" || status === "PAUSED") return "warning";
  if (status === "ARCHIVED" || status === "REJECTED") return "danger";
  return "neutral";
}

function formatPrice(value: number | null, currency: string) {
  if (value == null) return "Custom";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value / 100);
}

export default async function AdminListingsPage() {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  await requireRole("ADMIN");
  const listings = await prisma.listing.findMany({
    include: { company: true },
    orderBy: { updatedAt: "desc" },
    take: 50
  });

  return (
    <DashboardShell title={t.title} nav={getAdminNav(locale)} heading={t.heading} subheading={t.subheading} locale={locale}>
      <div className="grid gap-4">
        {listings.map((listing) => (
          <div key={listing.id} className="glass-panel p-6">
            <div className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-ink-900">{listing.title}</h2>
                  <StatusBadge label={listing.status} tone={getTone(listing.status)} />
                  <StatusBadge label={listing.verificationStatus} tone={getTone(listing.verificationStatus)} />
                </div>
                <div className="grid gap-2 text-sm text-ink-600 md:grid-cols-2">
                  <p><span className="font-medium text-ink-900">{t.company}:</span> {listing.company.displayName}</p>
                  <p><span className="font-medium text-ink-900">{t.location}:</span> {listing.baseCity}, {listing.baseCountry}</p>
                  <p><span className="font-medium text-ink-900">{t.pricing}:</span> {formatPrice(listing.priceFromCents, listing.currency)}</p>
                  <p><span className="font-medium text-ink-900">Route:</span> {listing.routeScope}</p>
                </div>
                <p className="text-sm leading-6 text-ink-700">{listing.description}</p>
              </div>
              <form action={reviewListing} className="grid gap-3 rounded-[1.75rem] border border-ink-100 bg-white/80 p-5">
                <input type="hidden" name="listingId" value={listing.id} />
                <label className="text-sm font-medium text-ink-700">
                  {t.status}
                  <select name="status" defaultValue={listing.status} className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                    <option value="DRAFT">DRAFT</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-ink-700">
                  {t.verification}
                  <select
                    name="verificationStatus"
                    defaultValue={listing.verificationStatus}
                    className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                  >
                    <option value="UNVERIFIED">UNVERIFIED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </label>
                <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.save}</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

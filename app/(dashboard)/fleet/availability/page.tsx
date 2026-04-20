import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/permissions";
import { getFleetNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";
import { updateListingAvailability } from "@/lib/actions/fleet";

const copy = {
  en: {
    title: "Fleet workspace",
    heading: "Availability management",
    subheading: "Control when inventory is available, minimum campaign length, and whether listings are commercially open.",
    availableFrom: "Available from",
    availableTo: "Available to",
    minimumDays: "Minimum campaign days",
    status: "Status",
    save: "Save availability"
  },
  pl: {
    title: "Panel floty",
    heading: "Zarządzanie dostępnością",
    subheading: "Kontroluj kiedy inventory jest dostępne, minimalną długość kampanii i czy listing jest komercyjnie otwarty.",
    availableFrom: "Dostępne od",
    availableTo: "Dostępne do",
    minimumDays: "Minimalna liczba dni kampanii",
    status: "Status",
    save: "Zapisz dostępność"
  }
} as const;

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "ACTIVE") return "success";
  if (status === "DRAFT" || status === "PAUSED") return "warning";
  if (status === "ARCHIVED") return "danger";
  return "neutral";
}

export default async function FleetAvailabilityPage() {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  const session = await requireRole("CARRIER_OWNER");
  const listings = await prisma.listing.findMany({
    where: {
      companyId: session.user.companyId ?? "missing-company"
    },
    orderBy: { updatedAt: "desc" },
    take: 50
  });

  return (
    <DashboardShell title={t.title} nav={getFleetNav(locale)} heading={t.heading} subheading={t.subheading} locale={locale}>
      <div className="grid gap-4">
        {listings.map((listing) => (
          <div key={listing.id} className="glass-panel p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-ink-900">{listing.title}</h3>
                <p className="mt-1 text-sm text-ink-600">{listing.baseCity}, {listing.baseCountry}</p>
              </div>
              <StatusBadge label={listing.status} tone={getTone(listing.status)} />
            </div>

            <form action={updateListingAvailability} className="grid gap-4 md:grid-cols-4">
              <input type="hidden" name="listingId" value={listing.id} />
              <Field label={t.availableFrom}>
                <input name="availableFrom" type="date" defaultValue={listing.availableFrom ? listing.availableFrom.toISOString().slice(0, 10) : ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <Field label={t.availableTo}>
                <input name="availableTo" type="date" defaultValue={listing.availableTo ? listing.availableTo.toISOString().slice(0, 10) : ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <Field label={t.minimumDays}>
                <input name="minimumCampaignDays" type="number" min={0} defaultValue={listing.minimumCampaignDays ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <Field label={t.status}>
                <select name="status" defaultValue={listing.status} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                  <option value="DRAFT">DRAFT</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </Field>
              <div className="md:col-span-4 flex justify-end">
                <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.save}</button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}

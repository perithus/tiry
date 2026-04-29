import { DashboardShell } from "@/components/layout/dashboard-shell";
import { updateFleetListingAvailability } from "@/lib/actions/fleet";
import { requireRole } from "@/lib/auth/permissions";
import { getFleetNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export default async function FleetAvailabilityPage() {
  const locale = await getLocale();
  const t = getMessages(locale);
  const session = await requireRole("CARRIER_OWNER");
  const listings = await prisma.listing.findMany({
    where: { companyId: session.user.companyId ?? "missing-company" },
    include: {
      bookings: {
        where: {
          status: {
            in: ["PENDING", "CONFIRMED", "ACTIVE"]
          }
        },
        include: {
          inquiry: {
            select: {
              campaignName: true
            }
          }
        },
        orderBy: { bookedFrom: "asc" }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <DashboardShell
      title={t.dashboard.fleet.title}
      nav={getFleetNav(locale)}
      heading={t.dashboard.fleet.availabilityHeading}
      subheading={t.dashboard.fleet.availabilitySubheading}
      locale={locale}
    >
      <div className="grid gap-4">
        {listings.map((listing) => (
          <form key={listing.id} action={updateFleetListingAvailability} className="glass-panel grid gap-4 p-6">
            <input type="hidden" name="listingId" value={listing.id} />
            <div>
              <h3 className="text-lg font-semibold text-ink-900">{listing.title}</h3>
              <p className="mt-1 text-sm text-ink-600">{listing.baseCity}, {listing.baseCountry}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <Field label={locale === "pl" ? "Dostępne od" : "Available from"}>
                <input name="availableFrom" type="date" defaultValue={listing.availableFrom?.toISOString().slice(0, 10) ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <Field label={locale === "pl" ? "Dostępne do" : "Available to"}>
                <input name="availableTo" type="date" defaultValue={listing.availableTo?.toISOString().slice(0, 10) ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <Field label={locale === "pl" ? "Min. dni kampanii" : "Min. campaign days"}>
                <input name="minimumCampaignDays" type="number" min={1} defaultValue={listing.minimumCampaignDays ?? 30} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <Field label={locale === "pl" ? "Status" : "Status"}>
                <select name="status" defaultValue={listing.status} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                  <option value="DRAFT">DRAFT</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </Field>
            </div>
            <div className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">
                {locale === "pl" ? "Aktywne okna bookingowe" : "Active booking windows"}
              </h4>
              <div className="mt-3 space-y-3">
                {listing.bookings.length === 0 ? (
                  <p className="text-sm text-ink-600">{locale === "pl" ? "Brak aktywnych bookingów." : "No active bookings."}</p>
                ) : (
                  listing.bookings.map((booking) => (
                    <div key={booking.id} className="rounded-2xl border border-ink-100 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium text-ink-900">{booking.inquiry.campaignName}</p>
                        <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700">{booking.status}</span>
                      </div>
                      <p className="mt-2 text-sm text-ink-600">
                        {booking.bookedFrom.toISOString().slice(0, 10)} - {booking.bookedTo.toISOString().slice(0, 10)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">
                {locale === "pl" ? "Zapisz dostępność" : "Save availability"}
              </button>
            </div>
          </form>
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

import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getFleetNav } from "@/lib/data/navigation";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export default async function FleetListingsPage() {
  noStore();
  const locale = await getLocale();
  const t = getMessages(locale);
  const session = await requireRole("CARRIER_OWNER");
  const listings = await prisma.listing.findMany({
    where: { companyId: session.user.companyId ?? "missing-company" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardShell
      title={t.dashboard.fleet.title}
      nav={getFleetNav(locale)}
      heading={t.dashboard.fleet.listingsHeading}
      subheading={t.dashboard.fleet.listingsSubheading}
      locale={locale}
    >
      <div className="grid gap-4">
        {listings.map((listing) => (
          <div key={listing.id} className="glass-panel flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <h3 className="text-lg font-semibold text-ink-900">{listing.title}</h3>
              <p className="mt-2 text-sm text-ink-600">{listing.baseCity}, {listing.baseCountry}</p>
            </div>
            <div className="flex gap-3">
              <StatusBadge label={listing.status.toLowerCase()} tone="neutral" />
              <StatusBadge label={listing.verificationStatus.toLowerCase()} tone="success" />
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

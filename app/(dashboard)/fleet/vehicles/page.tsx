import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getFleetNav } from "@/lib/data/navigation";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export default async function FleetVehiclesPage() {
  noStore();
  const locale = await getLocale();
  const t = getMessages(locale);
  const session = await requireRole("CARRIER_OWNER");
  const vehicles = await prisma.vehicle.findMany({
    where: { companyId: session.user.companyId ?? "missing-company" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardShell
      title={t.dashboard.fleet.title}
      nav={getFleetNav(locale)}
      heading={t.dashboard.fleet.vehiclesHeading}
      subheading={t.dashboard.fleet.vehiclesSubheading}
      locale={locale}
    >
      <div className="grid gap-4">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="glass-panel p-6">
            <h3 className="text-lg font-semibold text-ink-900">{vehicle.name}</h3>
            <p className="mt-2 text-sm text-ink-600">
              {vehicle.vehicleType} • {vehicle.registrationCountry} • {vehicle.monthlyMileageKm ?? "N/A"} km/{locale === "pl" ? t.dashboard.fleet.perMonth : "month"}
            </p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

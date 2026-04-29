import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { upsertFleetVehicle } from "@/lib/actions/fleet";
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
      <form action={upsertFleetVehicle} className="glass-panel grid gap-4 p-6 md:grid-cols-3">
        <Field label={locale === "pl" ? "Nazwa pojazdu" : "Vehicle name"}>
          <input name="name" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>
        <Field label={locale === "pl" ? "Kraj rejestracji" : "Registration country"}>
          <input name="registrationCountry" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>
        <Field label={locale === "pl" ? "Typ pojazdu" : "Vehicle type"}>
          <select name="vehicleType" defaultValue="TRAILER" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            <option value="TRUCK">TRUCK</option>
            <option value="TRAILER">TRAILER</option>
            <option value="TRUCK_TRAILER">TRUCK_TRAILER</option>
            <option value="VAN">VAN</option>
          </select>
        </Field>
        <Field label={locale === "pl" ? "Typ naczepy" : "Trailer type"}>
          <select name="trailerType" defaultValue="MEGA" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            <option value="">-</option>
            <option value="BOX">BOX</option>
            <option value="CURTAINSIDER">CURTAINSIDER</option>
            <option value="REFRIGERATED">REFRIGERATED</option>
            <option value="TANKER">TANKER</option>
            <option value="FLATBED">FLATBED</option>
            <option value="MEGA">MEGA</option>
            <option value="OTHER">OTHER</option>
          </select>
        </Field>
        <Field label={locale === "pl" ? "Miesięczny przebieg km" : "Monthly mileage km"}>
          <input name="monthlyMileageKm" type="number" min={0} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>
        <Field label={locale === "pl" ? "Szacowany miesięczny zasięg" : "Estimated monthly reach"}>
          <input name="estimatedMonthlyReach" type="number" min={0} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>
        <div className="md:col-span-3 flex justify-end">
          <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">
            {locale === "pl" ? "Dodaj pojazd" : "Add vehicle"}
          </button>
        </div>
      </form>

      <div className="grid gap-4">
        {vehicles.map((vehicle) => (
          <form key={vehicle.id} action={upsertFleetVehicle} className="glass-panel grid gap-4 p-6 md:grid-cols-3">
            <input type="hidden" name="vehicleId" value={vehicle.id} />
            <Field label={locale === "pl" ? "Nazwa pojazdu" : "Vehicle name"}>
              <input name="name" defaultValue={vehicle.name} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <Field label={locale === "pl" ? "Kraj rejestracji" : "Registration country"}>
              <input name="registrationCountry" defaultValue={vehicle.registrationCountry} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <Field label={locale === "pl" ? "Typ pojazdu" : "Vehicle type"}>
              <select name="vehicleType" defaultValue={vehicle.vehicleType} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                <option value="TRUCK">TRUCK</option>
                <option value="TRAILER">TRAILER</option>
                <option value="TRUCK_TRAILER">TRUCK_TRAILER</option>
                <option value="VAN">VAN</option>
              </select>
            </Field>
            <Field label={locale === "pl" ? "Typ naczepy" : "Trailer type"}>
              <select name="trailerType" defaultValue={vehicle.trailerType ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                <option value="">-</option>
                <option value="BOX">BOX</option>
                <option value="CURTAINSIDER">CURTAINSIDER</option>
                <option value="REFRIGERATED">REFRIGERATED</option>
                <option value="TANKER">TANKER</option>
                <option value="FLATBED">FLATBED</option>
                <option value="MEGA">MEGA</option>
                <option value="OTHER">OTHER</option>
              </select>
            </Field>
            <Field label={locale === "pl" ? "Miesięczny przebieg km" : "Monthly mileage km"}>
              <input name="monthlyMileageKm" type="number" min={0} defaultValue={vehicle.monthlyMileageKm ?? undefined} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <Field label={locale === "pl" ? "Szacowany miesięczny zasięg" : "Estimated monthly reach"}>
              <input name="estimatedMonthlyReach" type="number" min={0} defaultValue={vehicle.estimatedMonthlyReach ?? undefined} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <input type="hidden" name="active" value={vehicle.active ? "true" : "false"} />
            <div className="md:col-span-3 flex justify-end">
              <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">
                {locale === "pl" ? "Zapisz pojazd" : "Save vehicle"}
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

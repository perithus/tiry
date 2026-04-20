import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getFleetNav } from "@/lib/data/navigation";
import { getLocale } from "@/lib/i18n/server";
import { upsertVehicle } from "@/lib/actions/fleet";

const copy = {
  en: {
    title: "Fleet workspace",
    heading: "Vehicle management",
    subheading: "Create and maintain fleet records used by ad surfaces, listings, and commercial operations.",
    addVehicle: "Add vehicle",
    editVehicle: "Edit vehicle",
    name: "Vehicle name",
    country: "Registration country",
    vehicleType: "Vehicle type",
    trailerType: "Trailer type",
    mileage: "Monthly mileage (km)",
    reach: "Estimated monthly reach",
    active: "Active",
    save: "Save vehicle"
  },
  pl: {
    title: "Panel floty",
    heading: "Zarządzanie pojazdami",
    subheading: "Twórz i utrzymuj rekordy floty używane przez powierzchnie reklamowe, listingi i operacje handlowe.",
    addVehicle: "Dodaj pojazd",
    editVehicle: "Edytuj pojazd",
    name: "Nazwa pojazdu",
    country: "Kraj rejestracji",
    vehicleType: "Typ pojazdu",
    trailerType: "Typ naczepy",
    mileage: "Miesięczny przebieg (km)",
    reach: "Szacowany miesięczny zasięg",
    active: "Aktywny",
    save: "Zapisz pojazd"
  }
} as const;

type VehicleCopy = (typeof copy)[keyof typeof copy];

export default async function FleetVehiclesPage() {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  const session = await requireRole("CARRIER_OWNER");
  const vehicles = await prisma.vehicle.findMany({
    where: { companyId: session.user.companyId ?? "missing-company" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardShell title={t.title} nav={getFleetNav(locale)} heading={t.heading} subheading={t.subheading} locale={locale}>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel p-6">
          <h2 className="font-display text-2xl font-semibold text-ink-900">{t.addVehicle}</h2>
          <VehicleForm action={upsertVehicle} labels={t} />
        </div>

        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="glass-panel p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-ink-900">{vehicle.name}</h3>
                  <p className="mt-1 text-sm text-ink-600">{vehicle.vehicleType} · {vehicle.registrationCountry}</p>
                </div>
                <StatusBadge label={vehicle.active ? "active" : "inactive"} tone={vehicle.active ? "success" : "neutral"} />
              </div>
              <VehicleForm
                action={upsertVehicle}
                labels={t}
                defaultValues={{
                  vehicleId: vehicle.id,
                  name: vehicle.name,
                  registrationCountry: vehicle.registrationCountry,
                  vehicleType: vehicle.vehicleType,
                  trailerType: vehicle.trailerType ?? "",
                  monthlyMileageKm: vehicle.monthlyMileageKm ?? "",
                  estimatedMonthlyReach: vehicle.estimatedMonthlyReach ?? "",
                  active: vehicle.active
                }}
                submitLabel={t.save}
              />
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

function VehicleForm({
  action,
  labels,
  defaultValues,
  submitLabel
}: {
  action: (formData: FormData) => Promise<void>;
  labels: VehicleCopy;
  defaultValues?: {
    vehicleId?: string;
    name?: string;
    registrationCountry?: string;
    vehicleType?: string;
    trailerType?: string;
    monthlyMileageKm?: number | string;
    estimatedMonthlyReach?: number | string;
    active?: boolean;
  };
  submitLabel?: string;
}) {
  return (
    <form action={action} className="mt-5 grid gap-4">
      <input type="hidden" name="vehicleId" value={defaultValues?.vehicleId ?? ""} />
      <Field label={labels.name}>
        <input name="name" defaultValue={defaultValues?.name ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={labels.country}>
          <input name="registrationCountry" defaultValue={defaultValues?.registrationCountry ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>
        <Field label={labels.vehicleType}>
          <select name="vehicleType" defaultValue={defaultValues?.vehicleType ?? "TRAILER"} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            <option value="TRUCK">TRUCK</option>
            <option value="TRAILER">TRAILER</option>
            <option value="TRUCK_TRAILER">TRUCK_TRAILER</option>
            <option value="VAN">VAN</option>
          </select>
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={labels.trailerType}>
          <select name="trailerType" defaultValue={defaultValues?.trailerType ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            <option value="">NONE</option>
            <option value="BOX">BOX</option>
            <option value="CURTAINSIDER">CURTAINSIDER</option>
            <option value="REFRIGERATED">REFRIGERATED</option>
            <option value="TANKER">TANKER</option>
            <option value="FLATBED">FLATBED</option>
            <option value="MEGA">MEGA</option>
            <option value="OTHER">OTHER</option>
          </select>
        </Field>
        <Field label={labels.mileage}>
          <input name="monthlyMileageKm" type="number" min={0} defaultValue={defaultValues?.monthlyMileageKm ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>
      </div>
      <Field label={labels.reach}>
        <input name="estimatedMonthlyReach" type="number" min={0} defaultValue={defaultValues?.estimatedMonthlyReach ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <label className="inline-flex items-center gap-3 text-sm text-ink-700">
        <input type="checkbox" name="active" defaultChecked={defaultValues?.active ?? true} className="h-4 w-4 rounded border-ink-300" />
        {labels.active}
      </label>
      <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{submitLabel ?? labels.save}</button>
    </form>
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

import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getFleetNav } from "@/lib/data/navigation";
import { getLocale } from "@/lib/i18n/server";
import { upsertListing } from "@/lib/actions/fleet";

const copy = {
  en: {
    title: "Fleet workspace",
    heading: "Listings management",
    subheading: "Create, update, and moderate your commercial inventory before it reaches advertisers.",
    addListing: "Create listing",
    editListing: "Edit listing",
    vehicle: "Vehicle",
    titleField: "Title",
    description: "Description",
    baseCity: "Base city",
    baseCountry: "Base country",
    routeScope: "Route scope",
    countries: "Countries covered",
    cities: "Cities covered",
    surface: "Ad surface",
    pricingModel: "Pricing model",
    price: "Price from (cents)",
    currency: "Currency",
    mileage: "Estimated monthly mileage",
    reach: "Estimated campaign reach",
    availableFrom: "Available from",
    availableTo: "Available to",
    minimumDays: "Minimum campaign days",
    status: "Status",
    save: "Save listing"
  },
  pl: {
    title: "Panel floty",
    heading: "Zarządzanie ofertami",
    subheading: "Twórz, aktualizuj i moderuj swoje inventory handlowe zanim trafi do reklamodawców.",
    addListing: "Utwórz ofertę",
    editListing: "Edytuj ofertę",
    vehicle: "Pojazd",
    titleField: "Tytuł",
    description: "Opis",
    baseCity: "Miasto bazowe",
    baseCountry: "Kraj bazowy",
    routeScope: "Typ tras",
    countries: "Kraje pokrycia",
    cities: "Miasta pokrycia",
    surface: "Powierzchnia reklamowa",
    pricingModel: "Model cenowy",
    price: "Cena od (w centach)",
    currency: "Waluta",
    mileage: "Szacowany miesięczny przebieg",
    reach: "Szacowany zasięg kampanii",
    availableFrom: "Dostępne od",
    availableTo: "Dostępne do",
    minimumDays: "Minimalna liczba dni kampanii",
    status: "Status",
    save: "Zapisz ofertę"
  }
} as const;

type ListingCopy = (typeof copy)[keyof typeof copy];

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "ACTIVE" || status === "VERIFIED") return "success";
  if (status === "DRAFT" || status === "PAUSED" || status === "PENDING") return "warning";
  if (status === "ARCHIVED" || status === "REJECTED") return "danger";
  return "neutral";
}

export default async function FleetListingsPage() {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  const session = await requireRole("CARRIER_OWNER");
  const [listings, vehicles] = await Promise.all([
    prisma.listing.findMany({
      where: { companyId: session.user.companyId ?? "missing-company" },
      include: { vehicle: true, adSurface: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.vehicle.findMany({
      where: { companyId: session.user.companyId ?? "missing-company", active: true },
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <DashboardShell title={t.title} nav={getFleetNav(locale)} heading={t.heading} subheading={t.subheading} locale={locale}>
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel p-6">
          <h2 className="font-display text-2xl font-semibold text-ink-900">{t.addListing}</h2>
          <ListingForm action={upsertListing} labels={t} vehicles={vehicles} />
        </div>

        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className="glass-panel p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-ink-900">{listing.title}</h3>
                  <p className="mt-1 text-sm text-ink-600">{listing.baseCity}, {listing.baseCountry}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge label={listing.status} tone={getTone(listing.status)} />
                  <StatusBadge label={listing.verificationStatus} tone={getTone(listing.verificationStatus)} />
                </div>
              </div>
              <ListingForm
                action={upsertListing}
                labels={t}
                vehicles={vehicles}
                defaultValues={{
                  listingId: listing.id,
                  vehicleId: listing.vehicleId ?? "",
                  title: listing.title,
                  description: listing.description,
                  baseCity: listing.baseCity,
                  baseCountry: listing.baseCountry,
                  routeScope: listing.routeScope,
                  countriesCovered: listing.countriesCovered.join(", "),
                  citiesCovered: listing.citiesCovered.join(", "),
                  adSurfaceType: listing.adSurface?.type ?? "FULL_WRAP",
                  pricingModel: listing.pricingModel,
                  priceFromCents: listing.priceFromCents ?? "",
                  currency: listing.currency,
                  estimatedMonthlyMileage: listing.estimatedMonthlyMileage ?? "",
                  estimatedCampaignReach: listing.estimatedCampaignReach ?? "",
                  availableFrom: listing.availableFrom ? listing.availableFrom.toISOString().slice(0, 10) : "",
                  availableTo: listing.availableTo ? listing.availableTo.toISOString().slice(0, 10) : "",
                  minimumCampaignDays: listing.minimumCampaignDays ?? "",
                  status: listing.status
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

function ListingForm({
  action,
  labels,
  vehicles,
  defaultValues,
  submitLabel
}: {
  action: (formData: FormData) => Promise<void>;
  labels: ListingCopy;
  vehicles: Array<{ id: string; name: string }>;
  defaultValues?: Record<string, string | number>;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="mt-5 grid gap-4">
      <input type="hidden" name="listingId" value={(defaultValues?.listingId as string) ?? ""} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={labels.vehicle}>
          <select name="vehicleId" defaultValue={(defaultValues?.vehicleId as string) ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            <option value="">NONE</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label={labels.surface}>
          <select name="adSurfaceType" defaultValue={(defaultValues?.adSurfaceType as string) ?? "FULL_WRAP"} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            <option value="REAR_DOORS">REAR_DOORS</option>
            <option value="TRAILER_SIDE_LEFT">TRAILER_SIDE_LEFT</option>
            <option value="TRAILER_SIDE_RIGHT">TRAILER_SIDE_RIGHT</option>
            <option value="CABIN">CABIN</option>
            <option value="FULL_WRAP">FULL_WRAP</option>
          </select>
        </Field>
      </div>
      <Field label={labels.titleField}>
        <input name="title" defaultValue={(defaultValues?.title as string) ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <Field label={labels.description}>
        <textarea name="description" rows={4} defaultValue={(defaultValues?.description as string) ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={labels.baseCity}>
          <input name="baseCity" defaultValue={(defaultValues?.baseCity as string) ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>
        <Field label={labels.baseCountry}>
          <input name="baseCountry" defaultValue={(defaultValues?.baseCountry as string) ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={labels.routeScope}>
          <select name="routeScope" defaultValue={(defaultValues?.routeScope as string) ?? "INTERNATIONAL"} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            <option value="DOMESTIC">DOMESTIC</option>
            <option value="INTERNATIONAL">INTERNATIONAL</option>
            <option value="MIXED">MIXED</option>
          </select>
        </Field>
        <Field label={labels.pricingModel}>
          <select name="pricingModel" defaultValue={(defaultValues?.pricingModel as string) ?? "FIXED_MONTHLY"} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            <option value="FIXED_MONTHLY">FIXED_MONTHLY</option>
            <option value="CPM_ESTIMATE">CPM_ESTIMATE</option>
            <option value="ROUTE_PACKAGE">ROUTE_PACKAGE</option>
            <option value="CUSTOM_QUOTE">CUSTOM_QUOTE</option>
          </select>
        </Field>
        <Field label={labels.status}>
          <select name="status" defaultValue={(defaultValues?.status as string) ?? "DRAFT"} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            <option value="DRAFT">DRAFT</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PAUSED">PAUSED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </Field>
      </div>
      <Field label={labels.countries}>
        <input name="countriesCovered" defaultValue={(defaultValues?.countriesCovered as string) ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <Field label={labels.cities}>
        <input name="citiesCovered" defaultValue={(defaultValues?.citiesCovered as string) ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label={labels.price}>
          <input name="priceFromCents" type="number" min={0} defaultValue={(defaultValues?.priceFromCents as number | string) ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>
        <Field label={labels.currency}>
          <input name="currency" defaultValue={(defaultValues?.currency as string) ?? "EUR"} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>
        <Field label={labels.minimumDays}>
          <input name="minimumCampaignDays" type="number" min={0} defaultValue={(defaultValues?.minimumCampaignDays as number | string) ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={labels.mileage}>
          <input name="estimatedMonthlyMileage" type="number" min={0} defaultValue={(defaultValues?.estimatedMonthlyMileage as number | string) ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>
        <Field label={labels.reach}>
          <input name="estimatedCampaignReach" type="number" min={0} defaultValue={(defaultValues?.estimatedCampaignReach as number | string) ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={labels.availableFrom}>
          <input name="availableFrom" type="date" defaultValue={(defaultValues?.availableFrom as string) ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>
        <Field label={labels.availableTo}>
          <input name="availableTo" type="date" defaultValue={(defaultValues?.availableTo as string) ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </Field>
      </div>
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

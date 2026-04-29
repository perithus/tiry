import { unstable_noStore as noStore } from "next/cache";
import { ListingImageUploadForm } from "@/components/dashboard/listing-image-upload-form";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { upsertFleetListing } from "@/lib/actions/fleet";
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
  const [listings, vehicles] = await Promise.all([
    prisma.listing.findMany({
      where: { companyId: session.user.companyId ?? "missing-company" },
      include: {
        images: {
          orderBy: { sortOrder: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.vehicle.findMany({
      where: { companyId: session.user.companyId ?? "missing-company" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true }
    })
  ]);

  return (
    <DashboardShell
      title={t.dashboard.fleet.title}
      nav={getFleetNav(locale)}
      heading={t.dashboard.fleet.listingsHeading}
      subheading={t.dashboard.fleet.listingsSubheading}
      locale={locale}
    >
      <ListingForm locale={locale} vehicles={vehicles} />
      <div className="grid gap-4">
        {listings.map((listing) => (
          <div key={listing.id} className="glass-panel p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-ink-900">{listing.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{listing.baseCity}, {listing.baseCountry}</p>
              </div>
              <div className="flex gap-3">
                <StatusBadge label={listing.status.toLowerCase()} tone="neutral" />
                <StatusBadge label={listing.verificationStatus.toLowerCase()} tone="success" />
              </div>
            </div>

            {listing.images.length > 0 ? (
              <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {listing.images.map((image) => (
                  <div key={image.id} className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt={image.alt} className="h-40 w-full object-cover" />
                    <div className="px-3 py-2 text-xs text-ink-600">{image.alt}</div>
                  </div>
                ))}
              </div>
            ) : null}

            <ListingForm locale={locale} vehicles={vehicles} listing={listing} />
            <div className="mt-4 rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">
                {locale === "pl" ? "Zdjęcia oferty" : "Listing images"}
              </h4>
              <ListingImageUploadForm listingId={listing.id} locale={locale} />
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

function ListingForm({
  locale,
  vehicles,
  listing
}: {
  locale: "pl" | "en";
  vehicles: Array<{ id: string; name: string }>;
  listing?: {
    id: string;
    title: string;
    description: string;
    baseCity: string;
    baseCountry: string;
    routeScope: string;
    pricingModel: string;
    priceFromCents: number | null;
    currency: string;
    vehicleId: string | null;
    countriesCovered: string[];
    citiesCovered: string[];
    estimatedMonthlyMileage: number | null;
    estimatedCampaignReach: number | null;
    minimumCampaignDays: number | null;
    status: string;
  };
}) {
  return (
    <form action={upsertFleetListing} className="grid gap-4 md:grid-cols-3">
      <input type="hidden" name="listingId" value={listing?.id ?? ""} />
      <Field label={locale === "pl" ? "Tytuł" : "Title"}>
        <input name="title" defaultValue={listing?.title ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <Field label={locale === "pl" ? "Miasto bazowe" : "Base city"}>
        <input name="baseCity" defaultValue={listing?.baseCity ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <Field label={locale === "pl" ? "Kraj bazowy" : "Base country"}>
        <input name="baseCountry" defaultValue={listing?.baseCountry ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <Field label={locale === "pl" ? "Opis" : "Description"} className="md:col-span-3">
        <textarea name="description" rows={4} defaultValue={listing?.description ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <Field label={locale === "pl" ? "Pojazd" : "Vehicle"}>
        <select name="vehicleId" defaultValue={listing?.vehicleId ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
          <option value="">-</option>
          {vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}</option>)}
        </select>
      </Field>
      <Field label={locale === "pl" ? "Zakres tras" : "Route scope"}>
        <select name="routeScope" defaultValue={listing?.routeScope ?? "INTERNATIONAL"} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
          <option value="DOMESTIC">DOMESTIC</option>
          <option value="INTERNATIONAL">INTERNATIONAL</option>
          <option value="MIXED">MIXED</option>
        </select>
      </Field>
      <Field label={locale === "pl" ? "Model ceny" : "Pricing model"}>
        <select name="pricingModel" defaultValue={listing?.pricingModel ?? "FIXED_MONTHLY"} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
          <option value="FIXED_MONTHLY">FIXED_MONTHLY</option>
          <option value="CPM_ESTIMATE">CPM_ESTIMATE</option>
          <option value="ROUTE_PACKAGE">ROUTE_PACKAGE</option>
          <option value="CUSTOM_QUOTE">CUSTOM_QUOTE</option>
        </select>
      </Field>
      <Field label={locale === "pl" ? "Cena od (centy)" : "Price from (cents)"}>
        <input name="priceFromCents" type="number" min={0} defaultValue={listing?.priceFromCents ?? undefined} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <Field label={locale === "pl" ? "Waluta" : "Currency"}>
        <input name="currency" defaultValue={listing?.currency ?? "EUR"} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <Field label={locale === "pl" ? "Status" : "Status"}>
        <select name="status" defaultValue={listing?.status ?? "DRAFT"} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
          <option value="DRAFT">DRAFT</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="PAUSED">PAUSED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </Field>
      <Field label={locale === "pl" ? "Kraje (po przecinku)" : "Countries (comma separated)"}>
        <input name="countriesCovered" defaultValue={listing?.countriesCovered.join(", ") ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <Field label={locale === "pl" ? "Miasta (po przecinku)" : "Cities (comma separated)"}>
        <input name="citiesCovered" defaultValue={listing?.citiesCovered.join(", ") ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <Field label={locale === "pl" ? "Szacowany miesięczny przebieg" : "Estimated monthly mileage"}>
        <input name="estimatedMonthlyMileage" type="number" min={0} defaultValue={listing?.estimatedMonthlyMileage ?? undefined} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <Field label={locale === "pl" ? "Szacowany zasięg kampanii" : "Estimated campaign reach"}>
        <input name="estimatedCampaignReach" type="number" min={0} defaultValue={listing?.estimatedCampaignReach ?? undefined} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <Field label={locale === "pl" ? "Min. dni kampanii" : "Min. campaign days"}>
        <input name="minimumCampaignDays" type="number" min={1} defaultValue={listing?.minimumCampaignDays ?? undefined} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
      </Field>
      <div className="md:col-span-3 flex justify-end">
        <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">
          {listing ? (locale === "pl" ? "Zapisz ofertę" : "Save listing") : (locale === "pl" ? "Dodaj ofertę" : "Add listing")}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}

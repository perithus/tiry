import Link from "next/link";
import { RouteScope, type Listing, type Company } from "@prisma/client";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

type ListingCardProps = {
  listing: Listing & { company: Company };
};

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <article className="glass-panel ambient-card overflow-hidden p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">{listing.company.displayName}</p>
          <h3 className="font-display mt-2 text-xl font-semibold tracking-tight text-ink-900">
            <Link href={`/marketplace/${listing.slug}`} className="hover:text-teal-700">
              {listing.title}
            </Link>
          </h3>
        </div>
        <StatusBadge
          label={listing.routeScope === RouteScope.INTERNATIONAL ? "International routes" : "Domestic routes"}
          tone="success"
        />
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-ink-600">{listing.description}</p>
      <div className="premium-divider mt-6" />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <InfoItem label="Base" value={`${listing.baseCity}, ${listing.baseCountry}`} />
        <InfoItem label="Reach" value={`${formatNumber(listing.estimatedCampaignReach)} est.`} />
        <InfoItem label="Price from" value={formatCurrency(listing.priceFromCents, listing.currency)} />
      </div>
    </article>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-ink-50/80 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-ink-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-ink-900">{value}</p>
    </div>
  );
}

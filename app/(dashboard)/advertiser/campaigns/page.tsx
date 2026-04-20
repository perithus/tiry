import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/permissions";
import { getAdvertiserNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

const copy = {
  en: {
    emptyTitle: "No campaigns yet",
    emptyBody: "Once your inquiries move into active CRM handling, your campaigns will appear here.",
    linkedListing: "Listing",
    owner: "Owner",
    booking: "Booking",
    budget: "Budget",
    noBooking: "No booking yet"
  },
  pl: {
    emptyTitle: "Brak kampanii",
    emptyBody: "Gdy Twoje zapytania przejdą do aktywnej obsługi CRM, kampanie pojawią się tutaj.",
    linkedListing: "Oferta",
    owner: "Owner",
    booking: "Booking",
    budget: "Budżet",
    noBooking: "Brak bookingu"
  }
} as const;

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "ACTIVE" || status === "COMPLETED" || status === "CONFIRMED") return "success";
  if (status === "NEGOTIATION" || status === "READY_TO_BOOK" || status === "PENDING") return "warning";
  if (status === "CANCELLED") return "danger";
  return "neutral";
}

function formatCurrency(amountInCents?: number | null, currency = "EUR") {
  if (amountInCents == null) return "Custom";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amountInCents / 100);
}

export default async function AdvertiserCampaignsPage() {
  noStore();
  const locale = await getLocale();
  const t = getMessages(locale);
  const c = copy[locale];
  const session = await requireRole("ADVERTISER");

  const campaigns = await prisma.campaign.findMany({
    where: { advertiserId: session.user.id },
    include: {
      owner: true,
      primaryListing: true,
      inquiry: {
        include: {
          booking: true,
          offers: {
            where: { status: "ACCEPTED" },
            take: 1
          }
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <DashboardShell
      title={t.dashboard.advertiser.title}
      nav={getAdvertiserNav(locale)}
      heading={t.dashboard.advertiser.campaignsHeading}
      subheading={t.dashboard.advertiser.campaignsSubheading}
      locale={locale}
    >
      <div className="grid gap-4">
        {campaigns.length === 0 ? (
          <div className="glass-panel p-8 text-sm text-ink-600">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{c.emptyTitle}</h2>
            <p className="mt-2">{c.emptyBody}</p>
          </div>
        ) : (
          campaigns.map((campaign) => {
            const booking = campaign.inquiry?.booking;
            const acceptedOffer = campaign.inquiry?.offers[0];
            return (
              <div key={campaign.id} className="glass-panel p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-2xl font-semibold text-ink-900">{campaign.name}</h2>
                  <StatusBadge label={campaign.status} tone={getTone(campaign.status)} />
                  {booking ? <StatusBadge label={booking.status} tone={getTone(booking.status)} /> : null}
                </div>

                <div className="mt-4 grid gap-2 text-sm text-ink-600 md:grid-cols-2">
                  <p>{c.linkedListing}: {campaign.primaryListing?.title ?? "N/A"}</p>
                  <p>{c.owner}: {campaign.owner?.name ?? "N/A"}</p>
                  <p>{c.budget}: {formatCurrency(campaign.budgetCents, campaign.currency)}</p>
                  <p>
                    {c.booking}:{" "}
                    {booking
                      ? `${booking.bookedFrom.toISOString().slice(0, 10)} - ${booking.bookedTo.toISOString().slice(0, 10)}`
                      : c.noBooking}
                  </p>
                </div>

                {acceptedOffer ? (
                  <div className="mt-4 rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                    <p className="font-medium text-ink-900">{acceptedOffer.title}</p>
                    <p className="mt-1 text-sm text-ink-600">{formatCurrency(acceptedOffer.priceCents, acceptedOffer.currency)}</p>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </DashboardShell>
  );
}

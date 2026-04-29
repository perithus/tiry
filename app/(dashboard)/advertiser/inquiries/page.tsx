import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getAdvertiserNav } from "@/lib/data/navigation";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { acceptCampaignOffer } from "@/lib/actions/offers";
import { expireStaleOffers, parseOfferTerms } from "@/lib/utils/offers";

const copy = {
  en: {
    listing: "Listing",
    offers: "Offers",
    noOffers: "No offers yet.",
    accept: "Accept offer",
    bookedWindow: "Booked window",
    createdBooking: "Booking created after acceptance",
    expiresAt: "Expires"
  },
  pl: {
    listing: "Oferta",
    offers: "Oferty",
    noOffers: "Brak ofert.",
    accept: "Akceptuj oferte",
    bookedWindow: "Okno bookingu",
    createdBooking: "Booking powstanie po akceptacji",
    expiresAt: "Wygasa"
  }
} as const;

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "BOOKED" || status === "ACCEPTED") return "success";
  if (status === "SUBMITTED" || status === "IN_REVIEW" || status === "OFFER_SENT" || status === "SENT") return "warning";
  if (status === "DECLINED" || status === "REJECTED" || status === "CLOSED" || status === "EXPIRED") return "danger";
  return "neutral";
}

export default async function AdvertiserInquiriesPage() {
  noStore();
  const locale = await getLocale();
  const t = getMessages(locale);
  const c = copy[locale];
  const session = await requireRole("ADVERTISER");
  await expireStaleOffers();

  const inquiries = await prisma.campaignInquiry.findMany({
    where: { advertiserId: session.user.id },
    include: {
      listing: true,
      offers: {
        orderBy: { createdAt: "desc" }
      },
      booking: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardShell
      title={t.dashboard.advertiser.title}
      nav={getAdvertiserNav(locale)}
      heading={t.dashboard.advertiser.inquiriesHeading}
      subheading={t.dashboard.advertiser.inquiriesSubheading}
      locale={locale}
    >
      <div className="grid gap-4">
        {inquiries.map((inquiry) => (
          <div key={inquiry.id} className="glass-panel p-6">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-ink-900">{inquiry.campaignName}</h2>
              <StatusBadge label={inquiry.status.replaceAll("_", " ")} tone={getTone(inquiry.status)} />
              {inquiry.booking ? <StatusBadge label={inquiry.booking.status} tone="success" /> : null}
            </div>
            <p className="mt-3 text-sm text-ink-600">
              {c.listing}: {inquiry.listing.title}
            </p>

            <div className="mt-5 rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">{c.offers}</h3>
              <div className="mt-3 space-y-3">
                {inquiry.offers.length === 0 ? (
                  <p className="text-sm text-ink-600">{c.noOffers}</p>
                ) : (
                  inquiry.offers.map((offer) => {
                    const terms = parseOfferTerms(offer.terms);
                    return (
                      <div key={offer.id} className="rounded-2xl border border-ink-100 px-4 py-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-ink-900">{offer.title}</p>
                            <p className="mt-1 text-sm text-ink-600">
                              {new Intl.NumberFormat("en-GB", {
                                style: "currency",
                                currency: offer.currency,
                                maximumFractionDigits: 0
                              }).format(offer.priceCents / 100)}
                            </p>
                          </div>
                          <StatusBadge label={offer.status} tone={getTone(offer.status)} />
                        </div>
                        <p className="mt-3 text-sm leading-6 text-ink-700">{terms.body}</p>
                        {terms.bookedFrom && terms.bookedTo ? (
                          <p className="mt-3 text-sm text-ink-600">
                            {c.bookedWindow}: {terms.bookedFrom} - {terms.bookedTo}
                          </p>
                        ) : null}
                        {offer.expiresAt ? (
                          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ink-500">
                            {c.expiresAt}: {offer.expiresAt.toISOString().slice(0, 10)}
                          </p>
                        ) : null}
                        {offer.status === "SENT" && !inquiry.booking ? (
                          <form action={acceptCampaignOffer} className="mt-4">
                            <input type="hidden" name="offerId" value={offer.id} />
                            <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">
                              {c.accept}
                            </button>
                          </form>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
              {!inquiry.booking ? <p className="mt-4 text-xs uppercase tracking-[0.16em] text-ink-500">{c.createdBooking}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

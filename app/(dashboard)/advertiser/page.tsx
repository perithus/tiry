import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/permissions";
import { getAdvertiserNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "BOOKED" || status === "ACTIVE" || status === "CONFIRMED") return "success";
  if (status === "SUBMITTED" || status === "IN_REVIEW" || status === "OFFER_SENT" || status === "NEGOTIATION") return "warning";
  if (status === "DECLINED" || status === "CLOSED" || status === "CANCELLED") return "danger";
  return "neutral";
}

export default async function AdvertiserDashboardPage() {
  noStore();
  const locale = await getLocale();
  const t = getMessages(locale);
  const session = await requireRole("ADVERTISER");

  const [savedListings, inquiries, liveCampaigns] = await Promise.all([
    prisma.savedListing.count({
      where: { userId: session.user.id }
    }),
    prisma.campaignInquiry.findMany({
      where: { advertiserId: session.user.id },
      include: {
        listing: true
      },
      orderBy: { updatedAt: "desc" },
      take: 4
    }),
    prisma.campaign.findMany({
      where: { advertiserId: session.user.id },
      include: {
        inquiry: {
          include: {
            booking: true
          }
        }
      },
      orderBy: { updatedAt: "desc" },
      take: 4
    })
  ]);

  return (
    <DashboardShell
      title={t.dashboard.advertiser.title}
      nav={getAdvertiserNav(locale)}
      heading={t.dashboard.advertiser.overviewHeading}
      subheading={t.dashboard.advertiser.overviewSubheading}
      locale={locale}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard label={t.dashboard.advertiser.metricSavedListings} value={String(savedListings)} description={t.dashboard.advertiser.metricSavedListingsDesc} />
        <MetricCard
          label={t.dashboard.advertiser.metricActiveInquiries}
          value={String(inquiries.filter((item) => ["SUBMITTED", "IN_REVIEW", "OFFER_SENT"].includes(item.status)).length)}
          description={t.dashboard.advertiser.metricActiveInquiriesDesc}
        />
        <MetricCard
          label={t.dashboard.advertiser.metricLiveCampaigns}
          value={String(liveCampaigns.filter((item) => ["ACTIVE", "READY_TO_BOOK", "NEGOTIATION"].includes(item.status)).length)}
          description={t.dashboard.advertiser.metricLiveCampaignsDesc}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel p-6">
          <h2 className="font-display text-2xl font-semibold text-ink-900">{t.dashboard.advertiser.inquiriesHeading}</h2>
          <div className="mt-5 space-y-4">
            {inquiries.map((inquiry) => (
              <article key={inquiry.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900">{inquiry.campaignName}</h3>
                    <p className="mt-1 text-sm text-ink-600">{inquiry.listing.title}</p>
                  </div>
                  <StatusBadge label={inquiry.status} tone={getTone(inquiry.status)} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-panel p-6">
          <h2 className="font-display text-2xl font-semibold text-ink-900">{t.dashboard.advertiser.campaignsHeading}</h2>
          <div className="mt-5 space-y-4">
            {liveCampaigns.map((campaign) => (
              <article key={campaign.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900">{campaign.name}</h3>
                    <p className="mt-1 text-sm text-ink-600">
                      {campaign.inquiry?.booking
                        ? `${campaign.inquiry.booking.bookedFrom.toISOString().slice(0, 10)} - ${campaign.inquiry.booking.bookedTo.toISOString().slice(0, 10)}`
                        : "Awaiting booking"}
                    </p>
                  </div>
                  <StatusBadge label={campaign.status} tone={getTone(campaign.status)} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

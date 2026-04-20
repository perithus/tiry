import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/permissions";
import { getFleetNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "ACTIVE" || status === "VERIFIED") return "success";
  if (status === "PENDING" || status === "PENDING_VERIFICATION" || status === "SUBMITTED" || status === "IN_REVIEW") return "warning";
  if (status === "REJECTED" || status === "SUSPENDED") return "danger";
  return "neutral";
}

export default async function FleetDashboardPage() {
  noStore();
  const locale = await getLocale();
  const t = getMessages(locale);
  const session = await requireRole("CARRIER_OWNER");

  const companyId = session.user.companyId ?? "missing-company";

  const [listings, inquiries, documents, teamMembers, company] = await Promise.all([
    prisma.listing.findMany({
      where: { companyId },
      orderBy: { updatedAt: "desc" },
      take: 4
    }),
    prisma.campaignInquiry.findMany({
      where: {
        listing: { companyId }
      },
      include: { advertiser: true, listing: true },
      orderBy: { createdAt: "desc" },
      take: 4
    }),
    prisma.verificationDocument.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      take: 4
    }),
    prisma.user.count({
      where: { companyId }
    }),
    prisma.company.findUnique({
      where: { id: companyId }
    })
  ]);

  const activeListings = listings.filter((listing) => listing.status === "ACTIVE").length;
  const incomingInquiries = inquiries.filter((inquiry) => ["SUBMITTED", "IN_REVIEW", "OFFER_SENT"].includes(inquiry.status)).length;
  const verificationReadiness =
    company && (documents.length > 0 || company.verificationStatus === "VERIFIED")
      ? `${Math.min(100, Math.round(((documents.filter((item) => item.status === "VERIFIED").length + (company.verificationStatus === "VERIFIED" ? 2 : 0)) / Math.max(3, documents.length + 1)) * 100))}%`
      : "0%";

  return (
    <DashboardShell
      title={t.dashboard.fleet.title}
      nav={getFleetNav(locale)}
      heading={t.dashboard.fleet.overviewHeading}
      subheading={t.dashboard.fleet.overviewSubheading}
      locale={locale}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard label={t.dashboard.fleet.metricActiveListings} value={String(activeListings)} description={t.dashboard.fleet.metricActiveListingsDesc} />
        <MetricCard label={t.dashboard.fleet.metricIncomingInquiries} value={String(incomingInquiries)} description={t.dashboard.fleet.metricIncomingInquiriesDesc} />
        <MetricCard label={t.dashboard.fleet.metricVerificationReadiness} value={verificationReadiness} description={t.dashboard.fleet.metricVerificationReadinessDesc} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{t.dashboard.fleet.listingsHeading}</h2>
            <Link href="/fleet/listings" className="text-sm font-medium text-ink-900 underline-offset-4 hover:underline">
              Open
            </Link>
          </div>
          <div className="space-y-4">
            {listings.map((listing) => (
              <article key={listing.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900">{listing.title}</h3>
                    <p className="mt-1 text-sm text-ink-600">{listing.baseCity}, {listing.baseCountry}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge label={listing.status} tone={getTone(listing.status)} />
                    <StatusBadge label={listing.verificationStatus} tone={getTone(listing.verificationStatus)} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-panel p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{t.dashboard.fleet.inquiriesHeading}</h2>
            <Link href="/fleet/inquiries" className="text-sm font-medium text-ink-900 underline-offset-4 hover:underline">
              Open
            </Link>
          </div>
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <article key={inquiry.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900">{inquiry.campaignName}</h3>
                    <p className="mt-1 text-sm text-ink-600">{inquiry.advertiser.name} · {inquiry.listing.title}</p>
                  </div>
                  <StatusBadge label={inquiry.status} tone={getTone(inquiry.status)} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel p-6">
          <h2 className="font-display text-2xl font-semibold text-ink-900">{t.dashboard.fleet.verificationHeading}</h2>
          <div className="mt-5 space-y-4">
            {documents.map((document) => (
              <article key={document.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900">{document.filename}</h3>
                    <p className="mt-1 text-sm text-ink-600">{document.type}</p>
                  </div>
                  <StatusBadge label={document.status} tone={getTone(document.status)} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-panel p-6">
          <h2 className="font-display text-2xl font-semibold text-ink-900">{t.dashboard.fleet.settingsHeading}</h2>
          <div className="mt-5 rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
            <p className="text-sm text-ink-600">Team members: <span className="font-semibold text-ink-900">{teamMembers}</span></p>
            <p className="mt-2 text-sm text-ink-600">Company status: <span className="font-semibold text-ink-900">{company?.status ?? "DRAFT"}</span></p>
            <p className="mt-2 text-sm text-ink-600">Verification: <span className="font-semibold text-ink-900">{company?.verificationStatus ?? "UNVERIFIED"}</span></p>
            <Link href="/fleet/settings" className="mt-4 inline-flex rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">
              Manage team
            </Link>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

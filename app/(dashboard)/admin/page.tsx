import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getAdminNav } from "@/lib/data/navigation";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/shared";

const copy = {
  en: {
    title: "Admin control",
    heading: "Operations cockpit",
    subheading: "Run marketplace governance, campaign operations, company verification, and internal CMS from one admin workspace.",
    pendingVerifications: "Pending verifications",
    listingsToModerate: "Listings to moderate",
    openInquiries: "Open inquiries",
    activeCampaigns: "Active campaigns",
    suspendedUsers: "Suspended users",
    openTasks: "Open CRM tasks",
    reviewQueue: "Review queue",
    latestCampaigns: "Latest campaigns",
    latestAudit: "Latest audit events",
    manage: "Open panel",
    company: "Company",
    inquiry: "Inquiry",
    listing: "Listing",
    campaign: "Campaign",
    actor: "Actor",
    noCompany: "No company",
    system: "System"
  },
  pl: {
    title: "Panel administratora",
    heading: "Cockpit operacyjny",
    subheading: "Prowadź governance marketplace, operacje kampanii, weryfikację firm i wewnętrzny CMS z jednego panelu admina.",
    pendingVerifications: "Oczekujące weryfikacje",
    listingsToModerate: "Oferty do moderacji",
    openInquiries: "Otwarte zapytania",
    activeCampaigns: "Aktywne kampanie",
    suspendedUsers: "Zawieszeni użytkownicy",
    openTasks: "Otwarte taski CRM",
    reviewQueue: "Kolejka review",
    latestCampaigns: "Najnowsze kampanie",
    latestAudit: "Najnowsze zdarzenia audytowe",
    manage: "Otwórz panel",
    company: "Firma",
    inquiry: "Zapytanie",
    listing: "Oferta",
    campaign: "Kampania",
    actor: "Aktor",
    noCompany: "Brak firmy",
    system: "System"
  }
} as const;

function formatDate(value: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "VERIFIED" || status === "ACTIVE" || status === "COMPLETED") {
    return "success";
  }
  if (status === "PENDING" || status === "PENDING_VERIFICATION" || status === "IN_REVIEW" || status === "NEGOTIATION") {
    return "warning";
  }
  if (status === "REJECTED" || status === "SUSPENDED" || status === "CANCELLED") {
    return "danger";
  }
  return "neutral";
}

export default async function AdminDashboardPage() {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  await requireRole("ADMIN");

  const [
    pendingVerifications,
    listingsToModerate,
    openInquiries,
    activeCampaigns,
    suspendedUsers,
    openTasks,
    reviewCompanies,
    reviewListings,
    recentInquiries,
    recentCampaigns,
    recentAudit
  ] = await Promise.all([
    prisma.company.count({ where: { verificationStatus: { in: ["PENDING", "UNVERIFIED"] } } }),
    prisma.listing.count({ where: { OR: [{ verificationStatus: { in: ["PENDING", "UNVERIFIED"] } }, { status: { in: ["DRAFT", "PAUSED"] } }] } }),
    prisma.campaignInquiry.count({ where: { status: { in: ["SUBMITTED", "IN_REVIEW", "OFFER_SENT"] } } }),
    prisma.campaign.count({ where: { status: { in: ["PLANNING", "NEGOTIATION", "READY_TO_BOOK", "ACTIVE"] } } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.campaignTask.count({ where: { status: { in: ["TODO", "IN_PROGRESS", "BLOCKED"] } } }),
    prisma.company.findMany({
      where: { verificationStatus: { in: ["PENDING", "UNVERIFIED"] } },
      orderBy: { updatedAt: "desc" },
      take: 4
    }),
    prisma.listing.findMany({
      where: { OR: [{ verificationStatus: { in: ["PENDING", "UNVERIFIED"] } }, { status: { in: ["DRAFT", "PAUSED"] } }] },
      include: { company: true },
      orderBy: { updatedAt: "desc" },
      take: 4
    }),
    prisma.campaignInquiry.findMany({
      include: { advertiser: true, listing: { include: { company: true } } },
      orderBy: { updatedAt: "desc" },
      take: 4
    }),
    prisma.campaign.findMany({
      include: { advertiser: true, owner: true },
      orderBy: { updatedAt: "desc" },
      take: 4
    }),
    prisma.auditLog.findMany({
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: 6
    })
  ]);

  return (
    <DashboardShell title={t.title} nav={getAdminNav(locale)} heading={t.heading} subheading={t.subheading} locale={locale}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label={t.pendingVerifications} value={String(pendingVerifications)} description={t.reviewQueue} />
        <MetricCard label={t.listingsToModerate} value={String(listingsToModerate)} description={t.manage} />
        <MetricCard label={t.openInquiries} value={String(openInquiries)} description={t.inquiry} />
        <MetricCard label={t.activeCampaigns} value={String(activeCampaigns)} description={t.campaign} />
        <MetricCard label={t.suspendedUsers} value={String(suspendedUsers)} description={t.actor} />
        <MetricCard label={t.openTasks} value={String(openTasks)} description={t.latestCampaigns} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{t.reviewQueue}</h2>
            <Link href="/admin/verifications" className="text-sm font-medium text-ink-900 underline-offset-4 hover:underline">
              {t.manage}
            </Link>
          </div>
          <div className="space-y-4">
            {reviewCompanies.map((company) => (
              <div key={company.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{t.company}</p>
                    <h3 className="mt-1 text-lg font-semibold text-ink-900">{company.displayName}</h3>
                  </div>
                  <StatusBadge label={company.verificationStatus} tone={getTone(company.verificationStatus)} />
                </div>
              </div>
            ))}
            {reviewListings.map((listing) => (
              <div key={listing.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{t.listing}</p>
                    <h3 className="mt-1 text-lg font-semibold text-ink-900">{listing.title}</h3>
                    <p className="mt-1 text-sm text-ink-600">{listing.company.displayName}</p>
                  </div>
                  <StatusBadge label={listing.verificationStatus} tone={getTone(listing.verificationStatus)} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{t.latestCampaigns}</h2>
            <Link href="/admin/campaigns" className="text-sm font-medium text-ink-900 underline-offset-4 hover:underline">
              {t.manage}
            </Link>
          </div>
          <div className="space-y-4">
            {recentCampaigns.map((campaign) => (
              <div key={campaign.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{t.campaign}</p>
                    <h3 className="mt-1 text-lg font-semibold text-ink-900">{campaign.name}</h3>
                    <p className="mt-1 text-sm text-ink-600">{campaign.advertiser.name} · {campaign.owner?.name ?? t.system}</p>
                  </div>
                  <StatusBadge label={campaign.status} tone={getTone(campaign.status)} />
                </div>
              </div>
            ))}
            {recentInquiries.map((inquiry) => (
              <div key={inquiry.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{t.inquiry}</p>
                    <h3 className="mt-1 text-lg font-semibold text-ink-900">{inquiry.campaignName}</h3>
                    <p className="mt-1 text-sm text-ink-600">
                      {inquiry.advertiser.email} · {inquiry.listing.company.displayName}
                    </p>
                  </div>
                  <StatusBadge label={inquiry.status} tone={getTone(inquiry.status)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="glass-panel p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold text-ink-900">{t.latestAudit}</h2>
          <Link href="/admin/audit-logs" className="text-sm font-medium text-ink-900 underline-offset-4 hover:underline">
            {t.manage}
          </Link>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {recentAudit.map((entry) => (
            <article key={entry.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <StatusBadge label={entry.action} tone="neutral" />
                <span className="text-xs uppercase tracking-[0.18em] text-ink-500">{formatDate(entry.createdAt, locale)}</span>
              </div>
              <p className="mt-3 text-sm text-ink-700">
                <span className="font-medium text-ink-900">{t.actor}:</span> {entry.actor?.email ?? t.system}
              </p>
              <p className="mt-1 text-sm text-ink-600">{entry.entityType} {entry.entityId ? `· ${entry.entityId.slice(0, 8)}` : ""}</p>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

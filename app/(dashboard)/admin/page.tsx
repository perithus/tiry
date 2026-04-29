import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SalesPipelinePanel } from "@/components/dashboard/sales-pipeline-panel";
import { DashboardEmptyState } from "@/components/shared/dashboard-empty-state";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { getAdminNav } from "@/lib/data/navigation";
import { requireRole } from "@/lib/auth/permissions";
import { getSalesPipelineSnapshot } from "@/lib/data/sales-pipeline";
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
    securityIncidents: "Security incidents",
    suspendedUsers: "Suspended users",
    openTasks: "Open CRM tasks",
    pipelineValue: "Pipeline value",
    bookedRevenue: "Booked revenue",
    conversionRate: "Inquiry conversion",
    avgResponse: "Avg first-offer time",
    sentOffers: "Sent offers",
    draftOffers: "Draft offers",
    salesPipeline: "Sales pipeline",
    salesPipelineBody: "Track the whole flow from incoming inquiry to booked and active campaign delivery.",
    submitted: "Submitted",
    inReview: "In review",
    offerSentStage: "Offer sent",
    bookedStage: "Booked",
    planningStage: "Planning",
    negotiationStage: "Negotiation",
    readyStage: "Ready",
    activeStage: "Active",
    completedStage: "Completed",
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
    system: "System",
    emptyReviewTitle: "No items in review",
    emptyReviewBody: "Verification and listing moderation queues are clear right now.",
    emptyCampaignsTitle: "No recent campaigns or inquiries",
    emptyCampaignsBody: "New operational activity will appear here as soon as the marketplace starts moving.",
    emptyAuditTitle: "No audit events yet",
    emptyAuditBody: "Security and moderation events will appear here once users start acting on the platform."
  },
  pl: {
    title: "Panel administratora",
    heading: "Cockpit operacyjny",
    subheading: "Prowadź governance marketplace, operacje kampanii, weryfikację firm i wewnętrzny CMS z jednego panelu admina.",
    pendingVerifications: "Oczekujące weryfikacje",
    listingsToModerate: "Oferty do moderacji",
    openInquiries: "Otwarte zapytania",
    activeCampaigns: "Aktywne kampanie",
    securityIncidents: "Incydenty bezpieczenstwa",
    suspendedUsers: "Zawieszeni użytkownicy",
    openTasks: "Otwarte taski CRM",
    pipelineValue: "Wartosc pipeline",
    bookedRevenue: "Przychod booked",
    conversionRate: "Konwersja inquiry",
    avgResponse: "Sredni czas do oferty",
    sentOffers: "Wyslane oferty",
    draftOffers: "Oferty draft",
    salesPipeline: "Pipeline sprzedazowy",
    salesPipelineBody: "Sledz caly przeplyw od nowego inquiry do zabookowanej i aktywnej kampanii.",
    submitted: "Nowe",
    inReview: "W review",
    offerSentStage: "Oferta wyslana",
    bookedStage: "Booked",
    planningStage: "Planowanie",
    negotiationStage: "Negocjacje",
    readyStage: "Ready to book",
    activeStage: "Aktywne",
    completedStage: "Zakonczone",
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
    system: "System",
    emptyReviewTitle: "Brak elementow w review",
    emptyReviewBody: "Kolejka weryfikacji i moderacji ofert jest teraz pusta.",
    emptyCampaignsTitle: "Brak ostatnich kampanii i inquiry",
    emptyCampaignsBody: "Nowa aktywnosc operacyjna pojawi sie tutaj, gdy marketplace ruszy.",
    emptyAuditTitle: "Brak zdarzen audytowych",
    emptyAuditBody: "Zdarzenia bezpieczenstwa i moderacji pojawia sie tutaj po pierwszych akcjach uzytkownikow."
  }
} as const;

function formatDate(value: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function formatCurrency(amountInCents: number, locale: Locale, currency = "EUR") {
  return new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amountInCents / 100);
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
    securityIncidents,
    suspendedUsers,
    openTasks,
    reviewCompanies,
    reviewListings,
    recentInquiries,
    recentCampaigns,
    recentAudit,
    pipeline
  ] = await Promise.all([
    prisma.company.count({ where: { verificationStatus: { in: ["PENDING", "UNVERIFIED"] } } }),
    prisma.listing.count({ where: { OR: [{ verificationStatus: { in: ["PENDING", "UNVERIFIED"] } }, { status: { in: ["DRAFT", "PAUSED"] } }] } }),
    prisma.campaignInquiry.count({ where: { status: { in: ["SUBMITTED", "IN_REVIEW", "OFFER_SENT"] } } }),
    prisma.campaign.count({ where: { status: { in: ["PLANNING", "NEGOTIATION", "READY_TO_BOOK", "ACTIVE"] } } }),
    prisma.auditLog.count({
      where: {
        OR: [
          { action: "SIGN_IN", metadata: { path: ["kind"], equals: "new_device_sign_in" } },
          { action: "SIGN_IN", metadata: { path: ["kind"], equals: "new_network_sign_in" } },
          { action: "SIGN_IN", metadata: { path: ["kind"], equals: "new_user_agent_sign_in" } },
          { action: "SIGN_IN", metadata: { path: ["kind"], equals: "session_burst_sign_in" } },
          { action: "SIGN_IN", metadata: { path: ["kind"], equals: "rapid_ip_rotation_sign_in" } },
          { action: "SIGN_OUT", metadata: { path: ["kind"], string_contains: "revoke" } }
        ],
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    }),
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
    }),
    getSalesPipelineSnapshot()
  ]);

  return (
    <DashboardShell title={t.title} nav={getAdminNav(locale)} heading={t.heading} subheading={t.subheading} locale={locale}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label={t.pendingVerifications} value={String(pendingVerifications)} description={t.reviewQueue} />
        <MetricCard label={t.listingsToModerate} value={String(listingsToModerate)} description={t.manage} />
        <MetricCard label={t.openInquiries} value={String(openInquiries)} description={t.inquiry} />
        <MetricCard label={t.activeCampaigns} value={String(activeCampaigns)} description={t.campaign} />
        <MetricCard label={t.pipelineValue} value={formatCurrency(pipeline.pipelineValueCents, locale)} description={t.salesPipeline} />
        <MetricCard label={t.bookedRevenue} value={formatCurrency(pipeline.bookedRevenueCents, locale)} description={t.bookedStage} />
        <MetricCard label={t.conversionRate} value={`${pipeline.conversionRate}%`} description={t.inquiry} />
        <MetricCard label={t.avgResponse} value={`${pipeline.avgResponseHours}h`} description={t.offerSentStage} />
        <MetricCard label={t.sentOffers} value={String(pipeline.sentOffers)} description={t.offerSentStage} />
        <MetricCard label={t.draftOffers} value={String(pipeline.draftOffers)} description={t.salesPipeline} />
        <MetricCard label={t.securityIncidents} value={String(securityIncidents)} description={locale === "pl" ? "ostatnie 7 dni" : "last 7 days"} />
        <MetricCard label={t.suspendedUsers} value={String(suspendedUsers)} description={t.actor} />
        <MetricCard label={t.openTasks} value={String(openTasks)} description={t.latestCampaigns} />
      </div>

      <SalesPipelinePanel
        title={t.salesPipeline}
        subtitle={t.salesPipelineBody}
        stageLabels={{
          submitted: t.submitted,
          inReview: t.inReview,
          offerSent: t.offerSentStage,
          booked: t.bookedStage,
          planning: t.planningStage,
          negotiation: t.negotiationStage,
          ready: t.readyStage,
          active: t.activeStage,
          completed: t.completedStage
        }}
        stageCounts={pipeline.stageCounts}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="glass-panel p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{t.reviewQueue}</h2>
            <Link href="/admin/verifications" className="text-sm font-medium text-ink-900 underline-offset-4 hover:underline">
              {t.manage}
            </Link>
          </div>
          <div className="space-y-4">
            {reviewCompanies.length === 0 && reviewListings.length === 0 ? (
              <DashboardEmptyState title={t.emptyReviewTitle} body={t.emptyReviewBody} />
            ) : (
              <>
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
              </>
            )}
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
            {recentCampaigns.length === 0 && recentInquiries.length === 0 ? (
              <DashboardEmptyState title={t.emptyCampaignsTitle} body={t.emptyCampaignsBody} />
            ) : (
              <>
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
              </>
            )}
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
          {recentAudit.length === 0 ? (
            <DashboardEmptyState title={t.emptyAuditTitle} body={t.emptyAuditBody} />
          ) : (
            recentAudit.map((entry) => (
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
            ))
          )}
        </div>
      </section>
    </DashboardShell>
  );
}

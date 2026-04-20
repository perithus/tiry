import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CampaignCreateForm } from "@/components/forms/campaign-create-form";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/permissions";
import { getAdminNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/shared";

const copy = {
  en: {
    title: "Admin control",
    heading: "Campaign CRM",
    subheading: "Create and govern internal campaigns, assign ownership, and keep operational context inside one admin workflow.",
    totalCampaigns: "Total campaigns",
    activeCampaigns: "Active campaigns",
    openTasks: "Open tasks",
    details: "Open details",
    emptyTitle: "No campaigns yet",
    emptyBody: "Create the first internal campaign to start tracking advertiser demand and execution notes.",
    advertiser: "Advertiser",
    owner: "Owner",
    listing: "Listing",
    budget: "Budget",
    tasks: "Tasks",
    notes: "Notes",
    unassigned: "Unassigned",
    noListing: "No listing linked",
    noCompany: "No company linked",
    noBudget: "Custom budget"
  },
  pl: {
    title: "Panel administratora",
    heading: "CRM kampanii",
    subheading: "Twórz i prowadź kampanie wewnętrzne, przypisuj ownerów i trzymaj kontekst operacyjny w jednym workflow admina.",
    totalCampaigns: "Liczba kampanii",
    activeCampaigns: "Aktywne kampanie",
    openTasks: "Otwarte taski",
    details: "Otwórz szczegóły",
    emptyTitle: "Brak kampanii",
    emptyBody: "Utwórz pierwszą kampanię wewnętrzną, aby zacząć śledzić popyt reklamodawców i notatki realizacyjne.",
    advertiser: "Reklamodawca",
    owner: "Owner",
    listing: "Oferta",
    budget: "Budżet",
    tasks: "Taski",
    notes: "Notatki",
    unassigned: "Bez przypisania",
    noListing: "Brak podpiętej oferty",
    noCompany: "Brak podpiętej firmy",
    noBudget: "Budżet ustalany indywidualnie"
  }
} as const;

function formatBudget(amountInCents: number | null, currency: string, locale: Locale) {
  if (amountInCents == null) {
    return null;
  }

  return new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amountInCents / 100);
}

function getStatusTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "ACTIVE" || status === "COMPLETED") {
    return "success";
  }

  if (status === "NEGOTIATION" || status === "READY_TO_BOOK") {
    return "warning";
  }

  if (status === "CANCELLED") {
    return "danger";
  }

  return "neutral";
}

export default async function AdminCampaignsPage() {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  await requireRole("ADMIN");

  const [campaigns, advertisers, companies, listings, inquiries, owners] = await Promise.all([
    prisma.campaign.findMany({
      include: {
        advertiser: true,
        owner: true,
        company: true,
        primaryListing: true,
        _count: {
          select: {
            notes: true,
            tasks: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.user.findMany({
      where: { role: "ADVERTISER" },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true }
    }),
    prisma.company.findMany({
      orderBy: { displayName: "asc" },
      select: { id: true, displayName: true, headquartersCountry: true }
    }),
    prisma.listing.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        company: {
          select: {
            displayName: true
          }
        }
      }
    }),
    prisma.campaignInquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        campaignName: true,
        advertiser: {
          select: {
            name: true
          }
        }
      }
    }),
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true }
    })
  ]);

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "ACTIVE").length;
  const openTasks = await prisma.campaignTask.count({
    where: {
      status: {
        in: ["TODO", "IN_PROGRESS", "BLOCKED"]
      }
    }
  });

  return (
    <DashboardShell
      title={t.title}
      nav={getAdminNav(locale)}
      heading={t.heading}
      subheading={t.subheading}
      locale={locale}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard label={t.totalCampaigns} value={String(totalCampaigns)} description={t.subheading} />
        <MetricCard label={t.activeCampaigns} value={String(activeCampaigns)} description={t.heading} />
        <MetricCard label={t.openTasks} value={String(openTasks)} description={t.details} />
      </div>

      <CampaignCreateForm
        locale={locale}
        advertisers={advertisers.map((advertiser) => ({
          id: advertiser.id,
          label: `${advertiser.name} (${advertiser.email})`
        }))}
        companies={companies.map((company) => ({
          id: company.id,
          label: company.headquartersCountry ? `${company.displayName} · ${company.headquartersCountry}` : company.displayName
        }))}
        listings={listings.map((listing) => ({
          id: listing.id,
          label: `${listing.title} · ${listing.company.displayName}`
        }))}
        inquiries={inquiries.map((inquiry) => ({
          id: inquiry.id,
          label: `${inquiry.campaignName} · ${inquiry.advertiser.name}`
        }))}
        owners={owners.map((owner) => ({
          id: owner.id,
          label: `${owner.name} (${owner.email})`
        }))}
      />

      <div className="grid gap-4">
        {campaigns.length === 0 ? (
          <div className="glass-panel p-8">
            <h3 className="font-display text-2xl font-semibold text-ink-900">{t.emptyTitle}</h3>
            <p className="mt-2 text-sm text-ink-600">{t.emptyBody}</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="glass-panel p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-2xl font-semibold text-ink-900">{campaign.name}</h3>
                    <StatusBadge label={campaign.status} tone={getStatusTone(campaign.status)} />
                    <StatusBadge label={campaign.priority} tone={campaign.priority === "URGENT" ? "danger" : "neutral"} />
                  </div>
                  <div className="grid gap-2 text-sm text-ink-600 md:grid-cols-2">
                    <p>
                      <span className="font-medium text-ink-800">{t.advertiser}:</span> {campaign.advertiser.name}
                    </p>
                    <p>
                      <span className="font-medium text-ink-800">{t.owner}:</span> {campaign.owner?.name ?? t.unassigned}
                    </p>
                    <p>
                      <span className="font-medium text-ink-800">{t.listing}:</span> {campaign.primaryListing?.title ?? t.noListing}
                    </p>
                    <p>
                      <span className="font-medium text-ink-800">{t.budget}:</span>{" "}
                      {formatBudget(campaign.budgetCents, campaign.currency, locale) ?? t.noBudget}
                    </p>
                  </div>
                  {campaign.internalSummary ? <p className="max-w-3xl text-sm text-ink-600">{campaign.internalSummary}</p> : null}
                </div>

                <div className="flex min-w-[220px] flex-col gap-3 rounded-[1.5rem] border border-ink-100 bg-white/70 p-4">
                  <p className="text-sm text-ink-600">
                    {t.tasks}: <span className="font-semibold text-ink-900">{campaign._count.tasks}</span>
                  </p>
                  <p className="text-sm text-ink-600">
                    {t.notes}: <span className="font-semibold text-ink-900">{campaign._count.notes}</span>
                  </p>
                  <p className="text-sm text-ink-600">{campaign.company?.displayName ?? t.noCompany}</p>
                  <Link
                    href={`/admin/campaigns/${campaign.id}`}
                    className="inline-flex items-center justify-center rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-ink-800"
                  >
                    {t.details}
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardShell>
  );
}

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { addCampaignNote } from "@/lib/actions/campaigns";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getFleetNav } from "@/lib/data/navigation";
import { getLocale } from "@/lib/i18n/server";

const copy = {
  en: {
    title: "Fleet workspace",
    heading: "Campaign operations",
    subheading: "Track campaigns connected to your listings, keep execution notes close to the booking, and coordinate delivery readiness.",
    advertiser: "Advertiser",
    listing: "Listing",
    budget: "Budget",
    owner: "Owner",
    notes: "Operational notes",
    empty: "No campaigns are linked to your company yet.",
    noNotes: "No notes yet.",
    notePlaceholder: "Add a fleet-side update, blocker, route note, or installation detail.",
    addNote: "Add note"
  },
  pl: {
    title: "Panel floty",
    heading: "Operacje kampanii",
    subheading: "Śledź kampanie powiązane z Twoimi ofertami, trzymaj notatki realizacyjne blisko bookingu i koordynuj gotowość dostawy.",
    advertiser: "Reklamodawca",
    listing: "Oferta",
    budget: "Budżet",
    owner: "Owner",
    notes: "Notatki operacyjne",
    empty: "Nie ma jeszcze kampanii powiązanych z Twoją firmą.",
    noNotes: "Brak notatek.",
    notePlaceholder: "Dodaj update po stronie floty, blocker, notatkę o trasie lub szczegół montażu.",
    addNote: "Dodaj notatkę"
  }
} as const;

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "ACTIVE" || status === "COMPLETED" || status === "CONFIRMED") return "success";
  if (status === "NEGOTIATION" || status === "READY_TO_BOOK" || status === "PLANNING") return "warning";
  if (status === "CANCELLED") return "danger";
  return "neutral";
}

function formatCurrency(amountInCents?: number | null, currency = "EUR") {
  if (amountInCents == null) return "Custom";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(amountInCents / 100);
}

export default async function FleetCampaignsPage() {
  const locale = await getLocale();
  const t = copy[locale];
  const session = await requireRole("CARRIER_OWNER");
  const campaigns = await prisma.campaign.findMany({
    where: {
      companyId: session.user.companyId ?? "missing-company"
    },
    include: {
      advertiser: true,
      owner: true,
      primaryListing: true,
      notes: {
        include: {
          author: true
        },
        orderBy: { createdAt: "desc" },
        take: 6
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <DashboardShell title={t.title} nav={getFleetNav(locale)} heading={t.heading} subheading={t.subheading} locale={locale}>
      <div className="grid gap-4">
        {campaigns.length === 0 ? (
          <div className="glass-panel p-8 text-sm text-ink-600">{t.empty}</div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="glass-panel p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold text-ink-900">{campaign.name}</h2>
                <StatusBadge label={campaign.status} tone={getTone(campaign.status)} />
              </div>
              <div className="mt-4 grid gap-2 text-sm text-ink-600 md:grid-cols-2">
                <p><span className="font-medium text-ink-900">{t.advertiser}:</span> {campaign.advertiser.name}</p>
                <p><span className="font-medium text-ink-900">{t.owner}:</span> {campaign.owner?.name ?? "N/A"}</p>
                <p><span className="font-medium text-ink-900">{t.listing}:</span> {campaign.primaryListing?.title ?? "N/A"}</p>
                <p><span className="font-medium text-ink-900">{t.budget}:</span> {formatCurrency(campaign.budgetCents, campaign.currency)}</p>
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-ink-100 bg-white/85 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">{t.notes}</h3>
                <form action={addCampaignNote} className="mt-4 grid gap-3">
                  <input type="hidden" name="campaignId" value={campaign.id} />
                  <textarea name="body" rows={4} placeholder={t.notePlaceholder} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
                  <div className="flex justify-end">
                    <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.addNote}</button>
                  </div>
                </form>
                <div className="mt-4 space-y-3">
                  {campaign.notes.length === 0 ? (
                    <p className="text-sm text-ink-600">{t.noNotes}</p>
                  ) : (
                    campaign.notes.map((note) => (
                      <div key={note.id} className="rounded-2xl border border-ink-100 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">{note.author.name}</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-700">{note.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardShell>
  );
}

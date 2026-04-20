import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getAdminNav } from "@/lib/data/navigation";
import { getLocale } from "@/lib/i18n/server";
import { updateInquiryStatus } from "@/lib/actions/admin";

const copy = {
  en: {
    title: "Admin control",
    heading: "Inquiry operations",
    subheading: "Monitor advertiser demand, intervene in risky activity, and move qualified leads into campaign execution.",
    advertiser: "Advertiser",
    listing: "Listing",
    budget: "Budget",
    countries: "Countries",
    status: "Status",
    save: "Save status",
    openCampaigns: "Open CRM"
  },
  pl: {
    title: "Panel administratora",
    heading: "Operacje zapytań",
    subheading: "Monitoruj popyt reklamodawców, reaguj na ryzykowną aktywność i przesuwaj jakościowe leady do realizacji kampanii.",
    advertiser: "Reklamodawca",
    listing: "Oferta",
    budget: "Budżet",
    countries: "Kraje",
    status: "Status",
    save: "Zapisz status",
    openCampaigns: "Otwórz CRM"
  }
} as const;

function formatBudget(min: number | null, max: number | null) {
  if (min == null && max == null) {
    return "Custom";
  }

  const format = (value: number) =>
    new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0
    }).format(value / 100);

  if (min != null && max != null) {
    return `${format(min)} - ${format(max)}`;
  }

  return format(min ?? max ?? 0);
}

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "BOOKED") return "success";
  if (status === "SUBMITTED" || status === "IN_REVIEW" || status === "OFFER_SENT") return "warning";
  if (status === "DECLINED" || status === "CLOSED") return "danger";
  return "neutral";
}

export default async function AdminInquiriesPage() {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  await requireRole("ADMIN");
  const inquiries = await prisma.campaignInquiry.findMany({
    include: { advertiser: true, listing: { include: { company: true } }, campaigns: true },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <DashboardShell title={t.title} nav={getAdminNav(locale)} heading={t.heading} subheading={t.subheading} locale={locale}>
      <div className="grid gap-4">
        {inquiries.map((inquiry) => (
          <div key={inquiry.id} className="glass-panel p-6">
            <div className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-ink-900">{inquiry.campaignName}</h2>
                  <StatusBadge label={inquiry.status} tone={getTone(inquiry.status)} />
                </div>
                <div className="grid gap-2 text-sm text-ink-600 md:grid-cols-2">
                  <p><span className="font-medium text-ink-900">{t.advertiser}:</span> {inquiry.advertiser.email}</p>
                  <p><span className="font-medium text-ink-900">{t.listing}:</span> {inquiry.listing.title}</p>
                  <p><span className="font-medium text-ink-900">{t.budget}:</span> {formatBudget(inquiry.budgetMinCents, inquiry.budgetMaxCents)}</p>
                  <p><span className="font-medium text-ink-900">{t.countries}:</span> {inquiry.targetCountries.join(", ")}</p>
                </div>
                <p className="text-sm leading-6 text-ink-700">{inquiry.message}</p>
              </div>
              <div className="grid gap-3 rounded-[1.75rem] border border-ink-100 bg-white/80 p-5">
                <form action={updateInquiryStatus} className="grid gap-3">
                  <input type="hidden" name="inquiryId" value={inquiry.id} />
                  <label className="text-sm font-medium text-ink-700">
                    {t.status}
                    <select name="status" defaultValue={inquiry.status} className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                      <option value="SUBMITTED">SUBMITTED</option>
                      <option value="IN_REVIEW">IN_REVIEW</option>
                      <option value="OFFER_SENT">OFFER_SENT</option>
                      <option value="BOOKED">BOOKED</option>
                      <option value="DECLINED">DECLINED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </label>
                  <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.save}</button>
                </form>
                <Link
                  href={inquiry.campaigns[0] ? `/admin/campaigns/${inquiry.campaigns[0].id}` : "/admin/campaigns"}
                  className="inline-flex items-center justify-center rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50"
                >
                  {t.openCampaigns}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

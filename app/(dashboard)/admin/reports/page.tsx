import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { getAdminReportSnapshot, parseAdminReportRange } from "@/lib/admin/reports";
import { requireRole } from "@/lib/auth/permissions";
import { getAdminNav } from "@/lib/data/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { MetricCard } from "@/components/shared/metric-card";
import { ButtonLink } from "@/components/shared/button";
import { getLocale } from "@/lib/i18n/server";

const copy = {
  en: {
    title: "Admin control",
    heading: "Reports and exports",
    subheading: "Generate operational summaries and export admin audit data for compliance, security reviews, and leadership updates.",
    lastDays: "Last days",
    auditEvents: "Audit events",
    securityIncidents: "Security incidents",
    newCompanies: "New companies",
    newListings: "New listings",
    newInquiries: "New inquiries",
    newCampaigns: "New campaigns",
    activeCampaigns: "Active campaigns",
    suspendedUsers: "Suspended users",
    exportSummary: "Export summary CSV",
    exportSummaryJson: "Export summary JSON",
    exportAudit: "Export audit CSV",
    exportSecurityAudit: "Export security audit CSV",
    dataExports: "Business data exports",
    dataExportsBody: "Download structured CRM datasets for finance, operations, handoff, or BI tooling.",
    campaigns: "Campaigns",
    inquiries: "Inquiries",
    bookings: "Bookings",
    listings: "Listings",
    companies: "Companies",
    users: "Users",
    csv: "CSV",
    json: "JSON",
    generated: "Generated",
    downloads: "Downloads",
    downloadsBody: "Use these exports for finance, security review, compliance handoff, or leadership reporting."
  },
  pl: {
    title: "Panel administratora",
    heading: "Raporty i eksporty",
    subheading: "Generuj podsumowania operacyjne i eksportuj dane audytowe do compliance, przegladow security i raportowania dla leadershipu.",
    lastDays: "Ostatnie dni",
    auditEvents: "Zdarzenia audytowe",
    securityIncidents: "Incydenty bezpieczenstwa",
    newCompanies: "Nowe firmy",
    newListings: "Nowe oferty",
    newInquiries: "Nowe zapytania",
    newCampaigns: "Nowe kampanie",
    activeCampaigns: "Aktywne kampanie",
    suspendedUsers: "Zawieszeni uzytkownicy",
    exportSummary: "Eksportuj podsumowanie CSV",
    exportSummaryJson: "Eksportuj podsumowanie JSON",
    exportAudit: "Eksportuj audyt CSV",
    exportSecurityAudit: "Eksportuj security audit CSV",
    dataExports: "Eksporty danych biznesowych",
    dataExportsBody: "Pobieraj uporzadkowane dane CRM do finansow, operacji, handoffow i narzedzi BI.",
    campaigns: "Kampanie",
    inquiries: "Zapytania",
    bookings: "Bookingi",
    listings: "Oferty",
    companies: "Firmy",
    users: "Uzytkownicy",
    csv: "CSV",
    json: "JSON",
    generated: "Wygenerowano",
    downloads: "Pobrania",
    downloadsBody: "Uzywaj tych eksportow do finansow, przegladow security, handoffow compliance i raportow zarzadzczych."
  }
} as const;

export default async function AdminReportsPage({
  searchParams
}: {
  searchParams?: Promise<{ range?: string }>;
}) {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  await requireRole("ADMIN");
  const params = (await searchParams) ?? {};
  const range = parseAdminReportRange(params.range);
  const snapshot = await getAdminReportSnapshot(range);

  return (
    <DashboardShell title={t.title} nav={getAdminNav(locale)} heading={t.heading} subheading={t.subheading} locale={locale}>
      <div className="sticky top-20 z-10 flex flex-wrap gap-2 rounded-[1.75rem] border border-white/70 bg-sand/90 p-2 shadow-sm backdrop-blur">
        {[7, 30, 90].map((value) => (
          <Link
            key={value}
            aria-current={range === value ? "page" : undefined}
            href={value === 7 ? "/admin/reports" : `/admin/reports?range=${value}`}
            className={
              range === value
                ? "rounded-2xl bg-ink-900 px-4 py-2 text-sm font-medium text-white"
                : "rounded-2xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-900 hover:bg-ink-50"
            }
          >
            {t.lastDays}: {value}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t.auditEvents} value={String(snapshot.auditEvents)} description={`${range}d`} />
        <MetricCard label={t.securityIncidents} value={String(snapshot.securityIncidents)} description={`${range}d`} />
        <MetricCard label={t.newCompanies} value={String(snapshot.newCompanies)} description={`${range}d`} />
        <MetricCard label={t.newListings} value={String(snapshot.newListings)} description={`${range}d`} />
        <MetricCard label={t.newInquiries} value={String(snapshot.newInquiries)} description={`${range}d`} />
        <MetricCard label={t.newCampaigns} value={String(snapshot.newCampaigns)} description={`${range}d`} />
        <MetricCard label={t.activeCampaigns} value={String(snapshot.activeCampaigns)} description={locale === "pl" ? "stan biezacy" : "current state"} />
        <MetricCard label={t.suspendedUsers} value={String(snapshot.suspendedUsers)} description={locale === "pl" ? "stan biezacy" : "current state"} />
      </div>

      <section className="glass-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink-900">{t.downloads}</h2>
            <p className="mt-2 text-sm text-ink-600">{t.downloadsBody}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ink-500">
              {t.generated}: {new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(snapshot.generatedAt))}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={`/api/admin/reports/summary?range=${range}`} variant="primary">
              {t.exportSummary}
            </ButtonLink>
            <ButtonLink href={`/api/admin/reports/summary?range=${range}&format=json`} variant="secondary">
              {t.exportSummaryJson}
            </ButtonLink>
            <ButtonLink href={`/api/admin/reports/audit?range=${range}`} variant="secondary">
              {t.exportAudit}
            </ButtonLink>
            <ButtonLink href={`/api/admin/reports/audit?scope=security&range=${range}`} variant="secondary">
              {t.exportSecurityAudit}
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="glass-panel p-6">
        <h2 className="font-display text-2xl font-semibold text-ink-900">{t.dataExports}</h2>
        <p className="mt-2 text-sm text-ink-600">{t.dataExportsBody}</p>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            { key: "campaigns", label: t.campaigns },
            { key: "inquiries", label: t.inquiries },
            { key: "bookings", label: t.bookings },
            { key: "listings", label: t.listings },
            { key: "companies", label: t.companies },
            { key: "users", label: t.users }
          ].map((item) => (
            <article key={item.key} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-ink-900">{item.label}</h3>
                <span className="text-xs uppercase tracking-[0.16em] text-ink-500">{range}d</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <ButtonLink href={`/api/admin/reports/data?entity=${item.key}&range=${range}`} variant="primary">
                  {t.csv}
                </ButtonLink>
                <ButtonLink href={`/api/admin/reports/data?entity=${item.key}&range=${range}&format=json`} variant="secondary">
                  {t.json}
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}

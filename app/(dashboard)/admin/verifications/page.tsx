import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getAdminNav } from "@/lib/data/navigation";
import { getLocale } from "@/lib/i18n/server";
import { reviewCompany } from "@/lib/actions/admin";

const copy = {
  en: {
    title: "Admin control",
    heading: "Company verification and carrier governance",
    subheading: "Review readiness, moderation status, documents, and operational quality before supply goes live.",
    headquarters: "Headquarters",
    fleetSize: "Fleet size",
    listings: "Listings",
    documents: "Documents",
    verification: "Verification",
    companyStatus: "Company status",
    save: "Save review",
    noHeadquarters: "Unknown HQ",
    noDocuments: "No documents uploaded"
  },
  pl: {
    title: "Panel administratora",
    heading: "Weryfikacja firm i governance przewoźników",
    subheading: "Przeglądaj gotowość, status moderacji, dokumenty i jakość operacyjną zanim podaż trafi live.",
    headquarters: "Siedziba",
    fleetSize: "Wielkość floty",
    listings: "Oferty",
    documents: "Dokumenty",
    verification: "Weryfikacja",
    companyStatus: "Status firmy",
    save: "Zapisz review",
    noHeadquarters: "Nieznana siedziba",
    noDocuments: "Brak dodanych dokumentów"
  }
} as const;

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "VERIFIED") return "success";
  if (status === "PENDING" || status === "PENDING_VERIFICATION") return "warning";
  if (status === "REJECTED" || status === "SUSPENDED") return "danger";
  return "neutral";
}

export default async function AdminVerificationsPage() {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  await requireRole("ADMIN");

  const companies = await prisma.company.findMany({
    include: {
      listings: {
        select: {
          id: true,
          title: true,
          status: true,
          verificationStatus: true
        },
        take: 3,
        orderBy: { updatedAt: "desc" }
      },
      verificationDocs: {
        select: {
          id: true,
          type: true,
          status: true,
          filename: true
        },
        take: 3,
        orderBy: { createdAt: "desc" }
      },
      _count: {
        select: {
          listings: true,
          verificationDocs: true,
          users: true
        }
      }
    },
    orderBy: { updatedAt: "desc" },
    take: 25
  });

  return (
    <DashboardShell title={t.title} nav={getAdminNav(locale)} heading={t.heading} subheading={t.subheading} locale={locale}>
      <div className="grid gap-4">
        {companies.map((company) => (
          <div key={company.id} className="glass-panel p-6">
            <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-ink-900">{company.displayName}</h2>
                  <StatusBadge label={company.verificationStatus} tone={getTone(company.verificationStatus)} />
                  <StatusBadge label={company.status} tone={getTone(company.status)} />
                </div>

                <div className="grid gap-2 text-sm text-ink-600 md:grid-cols-2">
                  <p><span className="font-medium text-ink-900">{t.headquarters}:</span> {company.headquartersCountry ?? t.noHeadquarters}</p>
                  <p><span className="font-medium text-ink-900">{t.fleetSize}:</span> {company.fleetSize}</p>
                  <p><span className="font-medium text-ink-900">{t.listings}:</span> {company._count.listings}</p>
                  <p><span className="font-medium text-ink-900">{t.documents}:</span> {company._count.verificationDocs}</p>
                </div>

                {company.description ? <p className="text-sm leading-6 text-ink-600">{company.description}</p> : null}

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">{t.documents}</h3>
                    <div className="mt-3 space-y-3">
                      {company.verificationDocs.length === 0 ? (
                        <p className="text-sm text-ink-600">{t.noDocuments}</p>
                      ) : (
                        company.verificationDocs.map((document) => (
                          <div key={document.id} className="flex items-center justify-between gap-3 rounded-2xl border border-ink-100 px-3 py-2">
                            <div>
                              <p className="text-sm font-medium text-ink-900">{document.type}</p>
                              <p className="text-xs text-ink-500">{document.filename}</p>
                            </div>
                            <StatusBadge label={document.status} tone={getTone(document.status)} />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">{t.listings}</h3>
                    <div className="mt-3 space-y-3">
                      {company.listings.map((listing) => (
                        <div key={listing.id} className="rounded-2xl border border-ink-100 px-3 py-2">
                          <p className="text-sm font-medium text-ink-900">{listing.title}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <StatusBadge label={listing.status} tone={getTone(listing.status)} />
                            <StatusBadge label={listing.verificationStatus} tone={getTone(listing.verificationStatus)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <form action={reviewCompany} className="grid gap-3 rounded-[1.75rem] border border-ink-100 bg-white/80 p-5">
                <input type="hidden" name="companyId" value={company.id} />
                <label className="text-sm font-medium text-ink-700">
                  {t.verification}
                  <select
                    name="verificationStatus"
                    defaultValue={company.verificationStatus}
                    className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                  >
                    <option value="UNVERIFIED">UNVERIFIED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-ink-700">
                  {t.companyStatus}
                  <select name="status" defaultValue={company.status} className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                    <option value="DRAFT">DRAFT</option>
                    <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="REJECTED">REJECTED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </label>
                <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.save}</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}

import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { addVerificationDocument } from "@/lib/actions/company";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getFleetNav } from "@/lib/data/navigation";
import { getLocale } from "@/lib/i18n/server";

const copy = {
  en: {
    title: "Fleet workspace",
    heading: "Verification and document readiness",
    subheading: "Track review state, register compliance documents, and improve company readiness before listings scale.",
    addDocument: "Register document",
    type: "Document type",
    filename: "Filename",
    mimeType: "MIME type",
    sizeBytes: "File size (bytes)",
    storageKey: "Storage key",
    save: "Add document",
    noDocuments: "No documents uploaded yet.",
    reviewed: "Reviewed"
  },
  pl: {
    title: "Panel floty",
    heading: "Weryfikacja i gotowość dokumentów",
    subheading: "Śledź status review, rejestruj dokumenty compliance i zwiększaj gotowość firmy zanim oferty zaczną skalować.",
    addDocument: "Zarejestruj dokument",
    type: "Typ dokumentu",
    filename: "Nazwa pliku",
    mimeType: "Typ MIME",
    sizeBytes: "Rozmiar pliku (bajty)",
    storageKey: "Klucz storage",
    save: "Dodaj dokument",
    noDocuments: "Nie dodano jeszcze żadnych dokumentów.",
    reviewed: "Sprawdzono"
  }
} as const;

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "VERIFIED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "REJECTED") return "danger";
  return "neutral";
}

export default async function FleetVerificationPage() {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  const session = await requireRole("CARRIER_OWNER");
  const documents = await prisma.verificationDocument.findMany({
    where: { companyId: session.user.companyId ?? "missing-company" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardShell title={t.title} nav={getFleetNav(locale)} heading={t.heading} subheading={t.subheading} locale={locale}>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel p-6">
          <div className="space-y-4">
            {documents.length ? (
              documents.map((document) => (
                <div key={document.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-ink-900">{document.filename}</h3>
                      <p className="mt-2 text-sm text-ink-600">{document.type.replaceAll("_", " ")}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-500">{document.mimeType} • {document.sizeBytes} B</p>
                      {document.reviewedAt ? (
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-500">
                          {t.reviewed}: {document.reviewedAt.toLocaleDateString(locale)}
                        </p>
                      ) : null}
                    </div>
                    <StatusBadge label={document.status} tone={getTone(document.status)} />
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel p-8 text-sm text-ink-600">{t.noDocuments}</div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="font-display text-2xl font-semibold text-ink-900">{t.addDocument}</h2>
          <form action={addVerificationDocument} className="mt-5 grid gap-4">
            <Field label={t.type}>
              <select name="type" defaultValue="COMPANY_REGISTRATION" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                <option value="COMPANY_REGISTRATION">COMPANY_REGISTRATION</option>
                <option value="VAT_CERTIFICATE">VAT_CERTIFICATE</option>
                <option value="INSURANCE">INSURANCE</option>
                <option value="IDENTITY">IDENTITY</option>
                <option value="OTHER">OTHER</option>
              </select>
            </Field>
            <Field label={t.filename}>
              <input name="filename" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <Field label={t.mimeType}>
              <input name="mimeType" defaultValue="application/pdf" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <Field label={t.sizeBytes}>
              <input name="sizeBytes" type="number" min={1} defaultValue={250000} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <Field label={t.storageKey}>
              <input name="storageKey" placeholder="verification/company-registration.pdf" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.save}</button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}

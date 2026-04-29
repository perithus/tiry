import { unstable_noStore as noStore } from "next/cache";
import { DocumentUploadForm } from "@/components/dashboard/document-upload-form";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/permissions";
import { env } from "@/lib/config/env";
import { prisma } from "@/lib/db/prisma";
import { getFleetNav } from "@/lib/data/navigation";
import { getLocale } from "@/lib/i18n/server";

const copy = {
  en: {
    title: "Fleet workspace",
    heading: "Verification and document readiness",
    subheading: "Track review state, register compliance documents, and improve company readiness before listings scale.",
    addDocument: "Register document",
    noDocuments: "No documents uploaded yet.",
    reviewed: "Reviewed",
    open: "Open document"
  },
  pl: {
    title: "Panel floty",
    heading: "Weryfikacja i gotowość dokumentów",
    subheading: "Śledź status review, rejestruj dokumenty compliance i zwiększaj gotowość firmy zanim oferty zaczną skalować.",
    addDocument: "Zarejestruj dokument",
    noDocuments: "Nie dodano jeszcze żadnych dokumentów.",
    reviewed: "Sprawdzono",
    open: "Otwórz dokument"
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
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-500">
                        {document.mimeType} • {document.sizeBytes} B
                      </p>
                      <a
                        href={`/api/verification-documents/${document.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex text-sm font-medium text-teal-700 hover:text-teal-800"
                      >
                        {t.open}
                      </a>
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
          <DocumentUploadForm
            locale={locale}
            allowedTypes={env.UPLOAD_ALLOWED_TYPES}
            maxSizeMb={env.UPLOAD_MAX_FILE_SIZE_MB}
          />
        </div>
      </div>
    </DashboardShell>
  );
}

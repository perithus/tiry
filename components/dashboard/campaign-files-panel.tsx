import { env } from "@/lib/config/env";
import type { CampaignFileRecord } from "@/lib/campaign-files";
import { uploadCampaignFile } from "@/lib/actions/campaign-files";
import type { Locale } from "@/lib/i18n/shared";
import { FormSubmitButton } from "@/components/shared/form-submit-button";

function formatDate(value: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(value);
}

function formatFileSize(sizeBytes: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-GB", {
    style: "unit",
    unit: sizeBytes >= 1024 * 1024 ? "megabyte" : "kilobyte",
    maximumFractionDigits: 1
  }).format(sizeBytes >= 1024 * 1024 ? sizeBytes / (1024 * 1024) : Math.max(sizeBytes / 1024, 0.1));
}

type CampaignFilesPanelProps = {
  campaignId: string;
  files: CampaignFileRecord[];
  locale: Locale;
  copy: {
    title: string;
    uploadHelp: string;
    label: string;
    labelPlaceholder: string;
    file: string;
    save: string;
    open: string;
    noFiles: string;
    uploadedBy: string;
    uploadedAt: string;
  };
};

export function CampaignFilesPanel({ campaignId, files, locale, copy }: CampaignFilesPanelProps) {
  return (
    <section className="glass-panel p-6">
      <h2 className="font-display text-2xl font-semibold text-ink-900">{copy.title}</h2>

      <form action={uploadCampaignFile} className="mt-5 grid gap-3 rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
        <input type="hidden" name="campaignId" value={campaignId} />
        <p className="text-sm text-ink-600">{copy.uploadHelp}</p>
        <label className="block text-sm font-medium text-ink-700">
          {copy.label}
          <input
            name="label"
            maxLength={120}
            placeholder={copy.labelPlaceholder}
            className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-ink-700">
          {copy.file}
          <input
            name="file"
            type="file"
            accept={env.UPLOAD_ALLOWED_TYPES}
            className="mt-2 block w-full rounded-2xl border border-dashed border-ink-200 bg-white px-4 py-3 text-sm text-ink-700"
          />
        </label>
        <FormSubmitButton pendingLabel={`${copy.save}...`}>{copy.save}</FormSubmitButton>
      </form>

      <div className="mt-5 space-y-3">
        {files.length === 0 ? (
          <p className="text-sm text-ink-600">{copy.noFiles}</p>
        ) : (
          files.map((file) => (
            <article key={file.id} className="rounded-[1.5rem] border border-ink-100 bg-white/85 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{file.label || file.filename}</p>
                  {file.label ? <p className="mt-1 truncate text-sm text-ink-600">{file.filename}</p> : null}
                  <div className="mt-3 flex flex-wrap gap-4 text-xs uppercase tracking-[0.16em] text-ink-500">
                    <span>{file.mimeType}</span>
                    <span>{formatFileSize(file.sizeBytes, locale)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs uppercase tracking-[0.16em] text-ink-500">
                    <span>{copy.uploadedBy}: {file.uploadedByName ?? "N/A"}</span>
                    <span>{copy.uploadedAt}: {formatDate(file.createdAt, locale)}</span>
                  </div>
                </div>

                <a
                  href={`/api/campaign-files/${file.id}`}
                  className="rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50"
                >
                  {copy.open}
                </a>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

import type { AuditAction, AuditLog, User } from "@prisma/client";
import type { Locale } from "@/lib/i18n/shared";

type ActivityLog = AuditLog & {
  actor: Pick<User, "name" | "email"> | null;
};

const actionLabels: Record<AuditAction, { en: string; pl: string }> = {
  SIGN_IN: { en: "signed in", pl: "zalogowal sie" },
  SIGN_OUT: { en: "signed out", pl: "wylogowal sie" },
  SIGN_UP: { en: "created an account", pl: "utworzyl konto" },
  USER_UPDATED: { en: "updated a record", pl: "zaktualizowal rekord" },
  COMPANY_UPDATED: { en: "updated company data", pl: "zaktualizowal dane firmy" },
  LISTING_CREATED: { en: "created a listing", pl: "utworzyl oferte" },
  LISTING_UPDATED: { en: "updated a listing", pl: "zaktualizowal oferte" },
  LISTING_MODERATED: { en: "moderated a listing", pl: "zmoderowal oferte" },
  VERIFICATION_REVIEWED: { en: "reviewed verification", pl: "przeanalizowal weryfikacje" },
  INQUIRY_UPDATED: { en: "updated an inquiry", pl: "zaktualizowal inquiry" },
  CAMPAIGN_CREATED: { en: "created the campaign", pl: "utworzyl kampanie" },
  CAMPAIGN_UPDATED: { en: "updated the campaign", pl: "zaktualizowal kampanie" },
  CAMPAIGN_NOTE_CREATED: { en: "added a campaign note", pl: "dodal notatke kampanii" },
  CAMPAIGN_TASK_CREATED: { en: "created a task", pl: "utworzyl task" },
  CONTENT_PAGE_UPDATED: { en: "updated content", pl: "zaktualizowal tresc" },
  FAQ_ITEM_UPDATED: { en: "updated FAQ", pl: "zaktualizowal FAQ" },
  ROLE_CHANGED: { en: "changed a role", pl: "zmienil role" }
};

function formatActivityTitle(log: ActivityLog, locale: Locale) {
  const actor = log.actor?.name || log.actor?.email || (locale === "pl" ? "System" : "System");
  const label = actionLabels[log.action]?.[locale] ?? log.action;

  return `${actor} ${label}`;
}

function formatActivityDetails(log: ActivityLog, locale: Locale) {
  const metadata = (log.metadata ?? {}) as Record<string, unknown>;

  if (typeof metadata.kind === "string") {
    if (metadata.kind === "milestone_created" || metadata.kind === "milestone_updated") {
      const title = typeof metadata.title === "string" ? metadata.title : log.entityType;
      const phase = typeof metadata.phase === "string" ? metadata.phase : null;
      const status = typeof metadata.status === "string" ? metadata.status : null;
      const detail = [title, phase, status].filter(Boolean).join(" · ");
      return detail;
    }

    if (String(metadata.kind).startsWith("wrap_up")) {
      return locale === "pl" ? "Zaktualizowano podsumowanie kampanii" : "Campaign wrap-up updated";
    }
  }

  if (log.entityType === "Booking" && typeof metadata.status === "string") {
    return locale === "pl" ? `Status bookingu: ${metadata.status}` : `Booking status: ${metadata.status}`;
  }

  if (log.entityType === "CampaignTask" && typeof metadata.status === "string") {
    return locale === "pl" ? `Status taska: ${metadata.status}` : `Task status: ${metadata.status}`;
  }

  if (typeof metadata.priority === "string") {
    return locale === "pl" ? `Priorytet: ${metadata.priority}` : `Priority: ${metadata.priority}`;
  }

  if (typeof metadata.status === "string") {
    return locale === "pl" ? `Status: ${metadata.status}` : `Status: ${metadata.status}`;
  }

  if (typeof metadata.name === "string") {
    return locale === "pl" ? `Kampania: ${metadata.name}` : `Campaign: ${metadata.name}`;
  }

  return locale === "pl" ? `${log.entityType} ${log.entityId ?? ""}`.trim() : `${log.entityType} ${log.entityId ?? ""}`.trim();
}

function formatDateTime(value: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

export function CampaignActivityFeed({
  locale,
  logs,
  title,
  emptyLabel
}: {
  locale: Locale;
  logs: ActivityLog[];
  title: string;
  emptyLabel: string;
}) {
  return (
    <section className="glass-panel p-6">
      <h2 className="font-display text-2xl font-semibold text-ink-900">{title}</h2>
      <div className="mt-5 space-y-3">
        {logs.length === 0 ? (
          <p className="text-sm text-ink-600">{emptyLabel}</p>
        ) : (
          logs.map((log) => (
            <article key={log.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{formatActivityTitle(log, locale)}</p>
                  <p className="mt-1 text-sm text-ink-600">{formatActivityDetails(log, locale)}</p>
                </div>
                <p className="text-xs uppercase tracking-[0.16em] text-ink-500">{formatDateTime(log.createdAt, locale)}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

import Link from "next/link";
import type { AuditAction } from "@prisma/client";
import { PaginationControls } from "@/components/shared/pagination-controls";
import type { Locale } from "@/lib/i18n/shared";

type SecurityLogItem = {
  id: string;
  action: AuditAction;
  entityType: string;
  ipAddress: string | null;
  createdAt: Date;
  metadata: {
    kind?: string;
    severity?: string;
    signals?: string[];
    userAgent?: string;
    ipAddress?: string;
    signInCount1h?: number;
    distinctIpCount24h?: number;
  } | null;
};

function getEventLabel(locale: Locale, item: SecurityLogItem) {
  const kind = item.metadata?.kind;

  if (item.action === "SIGN_IN") {
    if (kind === "new_device_sign_in") return locale === "pl" ? "Nowe urzadzenie" : "New device sign-in";
    if (kind === "new_network_sign_in") return locale === "pl" ? "Nowa siec" : "New network sign-in";
    if (kind === "new_user_agent_sign_in") return locale === "pl" ? "Nowa przegladarka" : "New browser sign-in";
    if (kind === "session_burst_sign_in") return locale === "pl" ? "Burst logowan" : "Burst sign-in pattern";
    if (kind === "rapid_ip_rotation_sign_in") return locale === "pl" ? "Rotacja IP" : "Rapid IP rotation";
    return locale === "pl" ? "Logowanie" : "Sign-in";
  }

  if (item.action === "SIGN_OUT") {
    if (kind === "revoke_other_sessions") return locale === "pl" ? "Wylogowano inne sesje" : "Other sessions revoked";
    if (kind === "current_session_revoke") return locale === "pl" ? "Wylogowano biezaca sesje" : "Current session signed out";
    return locale === "pl" ? "Wylogowanie" : "Sign-out";
  }

  if (item.action === "USER_UPDATED" && kind === "password_change") return locale === "pl" ? "Zmiana hasla" : "Password changed";
  return locale === "pl" ? "Aktualizacja konta" : "Account update";
}

function getDetails(locale: Locale, item: SecurityLogItem) {
  const details = [item.metadata?.userAgent, item.ipAddress ?? item.metadata?.ipAddress].filter(Boolean) as string[];

  if (item.metadata?.kind === "session_burst_sign_in" && item.metadata.signInCount1h) {
    details.push(locale === "pl" ? `${item.metadata.signInCount1h} logowan w 1h` : `${item.metadata.signInCount1h} sign-ins in 1h`);
  }

  if (item.metadata?.kind === "rapid_ip_rotation_sign_in" && item.metadata.distinctIpCount24h) {
    details.push(locale === "pl" ? `${item.metadata.distinctIpCount24h} adresy IP w 24h` : `${item.metadata.distinctIpCount24h} IPs in 24h`);
  }

  return details.length > 0 ? details.join(" • ") : locale === "pl" ? "Brak dodatkowych danych." : "No additional details.";
}

export function SecurityAuditLogTable({
  locale,
  logs,
  currentFilter,
  basePath,
  page,
  pageSize,
  totalItems
}: {
  locale: Locale;
  logs: SecurityLogItem[];
  currentFilter: string;
  basePath: string;
  page: number;
  pageSize: number;
  totalItems: number;
}) {
  const filters = [
    { key: "all", label: locale === "pl" ? "Wszystkie" : "All" },
    { key: "sign_in", label: locale === "pl" ? "Logowania" : "Sign-ins" },
    { key: "sign_out", label: locale === "pl" ? "Wylogowania" : "Sign-outs" },
    { key: "account", label: locale === "pl" ? "Zmiany konta" : "Account changes" }
  ];

  return (
    <div className="space-y-4">
      <div className="sticky top-20 z-20 -mx-1 overflow-x-auto px-1 pb-2">
        <div className="inline-flex min-w-full gap-2 rounded-[1.75rem] border border-white/70 bg-sand/90 p-2 shadow-sm backdrop-blur sm:flex sm:flex-wrap">
          {filters.map((filter) => (
            <Link
              key={filter.key}
              aria-current={currentFilter === filter.key ? "page" : undefined}
              href={filter.key === "all" ? basePath : `${basePath}?filter=${filter.key}`}
              className={
                currentFilter === filter.key
                  ? "whitespace-nowrap rounded-2xl bg-ink-900 px-4 py-2 text-sm font-medium text-white"
                  : "whitespace-nowrap rounded-2xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-900 hover:bg-ink-50"
              }
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="grid gap-3 p-4 md:hidden">
          {logs.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-ink-200 bg-white/80 p-4 text-sm text-ink-600">
              {locale === "pl" ? "Brak dopasowanych zdarzen bezpieczenstwa." : "No matching security events."}
            </div>
          ) : (
            logs.map((log) => (
              <article key={log.id} className="rounded-[1.5rem] border border-ink-100 bg-white/90 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-medium text-ink-900">{getEventLabel(locale, log)}</h3>
                  <span className="text-xs uppercase tracking-[0.16em] text-ink-500">
                    {new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    }).format(log.createdAt)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-ink-600">{getDetails(locale, log)}</p>
              </article>
            ))
          )}
        </div>

        <table className="hidden min-w-full text-left text-sm md:table">
          <thead className="bg-ink-50 text-ink-600">
            <tr>
              <th className="px-6 py-4 font-medium">{locale === "pl" ? "Zdarzenie" : "Event"}</th>
              <th className="px-6 py-4 font-medium">{locale === "pl" ? "Szczegoly" : "Details"}</th>
              <th className="px-6 py-4 font-medium">{locale === "pl" ? "Czas" : "Time"}</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-sm text-ink-600">
                  {locale === "pl" ? "Brak dopasowanych zdarzen bezpieczenstwa." : "No matching security events."}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-t border-ink-100 align-top">
                  <td className="px-6 py-4 font-medium text-ink-900">{getEventLabel(locale, log)}</td>
                  <td className="px-6 py-4 text-ink-600">{getDetails(locale, log)}</td>
                  <td className="px-6 py-4 text-ink-600">
                    {new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    }).format(log.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <PaginationControls
          locale={locale}
          page={page}
          pageSize={pageSize}
          totalItems={totalItems}
          basePath={basePath}
          query={currentFilter === "all" ? undefined : { filter: currentFilter }}
          itemLabel={locale === "pl" ? "zdarzen" : "events"}
        />
      </div>
    </div>
  );
}

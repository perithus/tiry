import { AuditAction } from "@prisma/client";
import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ButtonLink } from "@/components/shared/button";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { updateUserAccess } from "@/lib/actions/admin";
import { requireRole } from "@/lib/auth/permissions";
import { getAdminNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";
import { normalizeSecurityMetadata } from "@/lib/security/activity";
import { isSecurityIncidentKind } from "@/lib/security/anomaly";

const copy = {
  en: {
    title: "Admin control",
    heading: "Security incidents",
    subheading: "Track suspicious sign-ins, session revocations, and the most important security signals across the platform.",
    anomalousSignIns: "Anomalous sign-ins",
    highRiskSignIns: "High-risk sign-ins",
    todayLogins: "Sign-ins today",
    revokedSessions: "Session revocations",
    suspendedUsers: "Suspended users",
    recentIncidents: "Recent incidents",
    actor: "Actor",
    event: "Event",
    details: "Details",
    time: "Time",
    response: "Response",
    system: "System",
    noEvents: "No security incidents matched the current window.",
    suspend: "Suspend user",
    reactivate: "Reactivate user",
    openUsers: "Open users"
  },
  pl: {
    title: "Panel administratora",
    heading: "Incydenty bezpieczenstwa",
    subheading: "Monitoruj podejrzane logowania, zamykanie sesji i najwazniejsze sygnaly bezpieczenstwa w calej platformie.",
    anomalousSignIns: "Anomalne logowania",
    highRiskSignIns: "Logowania wysokiego ryzyka",
    todayLogins: "Logowania dzisiaj",
    revokedSessions: "Zamkniete sesje",
    suspendedUsers: "Zawieszeni uzytkownicy",
    recentIncidents: "Ostatnie incydenty",
    actor: "Aktor",
    event: "Zdarzenie",
    details: "Szczegoly",
    time: "Czas",
    response: "Reakcja",
    system: "System",
    noEvents: "Brak incydentow bezpieczenstwa w tym oknie.",
    suspend: "Zawies uzytkownika",
    reactivate: "Aktywuj ponownie",
    openUsers: "Otworz uzytkownikow"
  }
} as const;

function getTone(action: AuditAction, kind?: string) {
  if (action === "SIGN_IN" && (kind === "rapid_ip_rotation_sign_in" || kind === "session_burst_sign_in")) return "danger" as const;
  if (action === "SIGN_IN" && isSecurityIncidentKind(kind)) return "warning" as const;
  if (action === "USER_UPDATED" && kind === "password_change") return "success" as const;
  return "neutral" as const;
}

function getLabel(locale: "en" | "pl", action: AuditAction, kind?: string) {
  if (action === "SIGN_IN") {
    if (kind === "new_device_sign_in") return locale === "pl" ? "Nowe urzadzenie" : "New device sign-in";
    if (kind === "new_network_sign_in") return locale === "pl" ? "Nowa siec" : "New network sign-in";
    if (kind === "new_user_agent_sign_in") return locale === "pl" ? "Nowa przegladarka" : "New browser sign-in";
    if (kind === "session_burst_sign_in") return locale === "pl" ? "Burst logowan" : "Burst sign-in pattern";
    if (kind === "rapid_ip_rotation_sign_in") return locale === "pl" ? "Rotacja IP" : "Rapid IP rotation";
    return locale === "pl" ? "Logowanie" : "Sign-in";
  }

  if (action === "SIGN_OUT") {
    if (kind === "revoke_other_sessions") return locale === "pl" ? "Wylogowano inne sesje" : "Other sessions revoked";
    if (kind === "current_session_revoke") return locale === "pl" ? "Wylogowano biezaca sesje" : "Current session signed out";
    if (kind === "session_revoke") return locale === "pl" ? "Zamknieto sesje" : "Session revoked";
    return locale === "pl" ? "Wylogowanie" : "Sign-out";
  }

  if (action === "USER_UPDATED" && kind === "password_change") {
    return locale === "pl" ? "Zmiana hasla" : "Password changed";
  }

  return locale === "pl" ? "Aktualizacja konta" : "Account update";
}

function getDetails(locale: "en" | "pl", metadata: ReturnType<typeof normalizeSecurityMetadata>, ipAddress: string | null) {
  const details = [metadata?.userAgent, ipAddress ?? metadata?.ipAddress].filter(Boolean) as string[];

  if (metadata?.kind === "session_burst_sign_in" && metadata.signInCount1h) {
    details.push(locale === "pl" ? `${metadata.signInCount1h} logowan w 1h` : `${metadata.signInCount1h} sign-ins in 1h`);
  }

  if (metadata?.kind === "rapid_ip_rotation_sign_in" && metadata.distinctIpCount24h) {
    details.push(locale === "pl" ? `${metadata.distinctIpCount24h} adresy IP w 24h` : `${metadata.distinctIpCount24h} IPs in 24h`);
  }

  return details.join(" | ") || (locale === "pl" ? "Brak dodatkowych danych." : "No additional details.");
}

export default async function AdminSecurityPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  await requireRole("ADMIN");
  const params = (await searchParams) ?? {};
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = 10;

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const incidentWhere = {
    OR: [
      { action: "SIGN_IN" as const, metadata: { path: ["kind"], equals: "new_device_sign_in" } },
      { action: "SIGN_IN" as const, metadata: { path: ["kind"], equals: "new_network_sign_in" } },
      { action: "SIGN_IN" as const, metadata: { path: ["kind"], equals: "new_user_agent_sign_in" } },
      { action: "SIGN_IN" as const, metadata: { path: ["kind"], equals: "session_burst_sign_in" } },
      { action: "SIGN_IN" as const, metadata: { path: ["kind"], equals: "rapid_ip_rotation_sign_in" } },
      { action: "SIGN_OUT" as const, metadata: { path: ["kind"], string_contains: "revoke" } },
      { action: "USER_UPDATED" as const, metadata: { path: ["kind"], equals: "password_change" } }
    ]
  };

  const [anomalousSignIns, highRiskSignIns, todayLogins, revokedSessions, suspendedUsers, totalIncidents, recentIncidents] = await Promise.all([
    prisma.auditLog.count({
      where: {
        action: "SIGN_IN",
        createdAt: { gte: weekAgo },
        OR: [
          { metadata: { path: ["kind"], equals: "new_device_sign_in" } },
          { metadata: { path: ["kind"], equals: "new_network_sign_in" } },
          { metadata: { path: ["kind"], equals: "new_user_agent_sign_in" } },
          { metadata: { path: ["kind"], equals: "session_burst_sign_in" } },
          { metadata: { path: ["kind"], equals: "rapid_ip_rotation_sign_in" } }
        ]
      }
    }),
    prisma.auditLog.count({
      where: {
        action: "SIGN_IN",
        createdAt: { gte: weekAgo },
        metadata: { path: ["severity"], equals: "danger" }
      }
    }),
    prisma.auditLog.count({
      where: {
        action: "SIGN_IN",
        createdAt: { gte: dayAgo }
      }
    }),
    prisma.auditLog.count({
      where: {
        action: "SIGN_OUT",
        createdAt: { gte: weekAgo },
        metadata: { path: ["kind"], string_contains: "revoke" }
      }
    }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.auditLog.count({ where: incidentWhere }),
    prisma.auditLog.findMany({
      where: incidentWhere,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  return (
    <DashboardShell title={t.title} nav={getAdminNav(locale)} heading={t.heading} subheading={t.subheading} locale={locale}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label={t.anomalousSignIns} value={String(anomalousSignIns)} description={locale === "pl" ? "ostatnie 7 dni" : "last 7 days"} />
        <MetricCard label={t.highRiskSignIns} value={String(highRiskSignIns)} description={locale === "pl" ? "ostatnie 7 dni" : "last 7 days"} />
        <MetricCard label={t.todayLogins} value={String(todayLogins)} description={locale === "pl" ? "ostatnie 24h" : "last 24h"} />
        <MetricCard label={t.revokedSessions} value={String(revokedSessions)} description={locale === "pl" ? "ostatnie 7 dni" : "last 7 days"} />
        <MetricCard label={t.suspendedUsers} value={String(suspendedUsers)} description={locale === "pl" ? "biezacy stan" : "current state"} />
      </div>

      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/api/admin/reports/audit?scope=security" variant="primary">
          {locale === "pl" ? "Eksportuj security CSV" : "Export security CSV"}
        </ButtonLink>
        <ButtonLink href="/api/admin/reports/summary" variant="secondary">
          {locale === "pl" ? "Pobierz summary CSV" : "Download summary CSV"}
        </ButtonLink>
      </div>

      <section className="glass-panel overflow-hidden">
        <div className="border-b border-ink-100 px-6 py-5">
          <h2 className="font-display text-2xl font-semibold text-ink-900">{t.recentIncidents}</h2>
        </div>
        <div className="grid gap-3 p-4 md:hidden">
          {recentIncidents.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-ink-200 bg-white/80 p-4 text-sm text-ink-600">{t.noEvents}</div>
          ) : (
            recentIncidents.map((incident) => {
              const metadata = normalizeSecurityMetadata(incident.metadata);
              const details = getDetails(locale, metadata, incident.ipAddress);

              return (
                <article key={incident.id} className="rounded-[1.5rem] border border-ink-100 bg-white/90 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="font-medium text-ink-900">{incident.actor?.email ?? t.system}</p>
                      <StatusBadge label={getLabel(locale, incident.action, metadata?.kind)} tone={getTone(incident.action, metadata?.kind)} />
                    </div>
                    <span className="text-xs uppercase tracking-[0.16em] text-ink-500">
                      {new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(incident.createdAt)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-ink-600">{details || (locale === "pl" ? "Brak dodatkowych danych." : "No additional details.")}</p>
                  {incident.actor ? (
                    <form action={updateUserAccess} className="mt-4 flex flex-wrap gap-2">
                      <input type="hidden" name="userId" value={incident.actor.id} />
                      <input type="hidden" name="role" value={incident.actor.role} />
                      <input type="hidden" name="status" value={incident.actor.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"} />
                      <button className="rounded-2xl border border-ink-200 bg-white px-3 py-2 text-xs font-medium text-ink-900 hover:bg-ink-50">
                        {incident.actor.status === "SUSPENDED" ? t.reactivate : t.suspend}
                      </button>
                    </form>
                  ) : null}
                </article>
              );
            })
          )}
        </div>

        <table className="hidden min-w-full text-left text-sm md:table">
          <thead className="bg-ink-50 text-ink-600">
            <tr>
              <th className="px-6 py-4 font-medium">{t.actor}</th>
              <th className="px-6 py-4 font-medium">{t.event}</th>
              <th className="px-6 py-4 font-medium">{t.details}</th>
              <th className="px-6 py-4 font-medium">{t.time}</th>
            </tr>
          </thead>
          <tbody>
            {recentIncidents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-sm text-ink-600">
                  {t.noEvents}
                </td>
              </tr>
            ) : (
              recentIncidents.map((incident) => {
                const metadata = normalizeSecurityMetadata(incident.metadata);
                const details = getDetails(locale, metadata, incident.ipAddress);

                return (
                  <tr key={incident.id} className="border-t border-ink-100 align-top">
                    <td className="px-6 py-4 text-ink-900">{incident.actor?.email ?? t.system}</td>
                    <td className="px-6 py-4">
                      <StatusBadge label={getLabel(locale, incident.action, metadata?.kind)} tone={getTone(incident.action, metadata?.kind)} />
                    </td>
                    <td className="px-6 py-4 text-ink-600">{details || (locale === "pl" ? "Brak dodatkowych danych." : "No additional details.")}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-3">
                        <p className="text-ink-600">
                          {new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
                            incident.createdAt
                          )}
                        </p>
                        {incident.actor ? (
                          <form action={updateUserAccess} className="flex flex-wrap gap-2">
                            <input type="hidden" name="userId" value={incident.actor.id} />
                            <input type="hidden" name="role" value={incident.actor.role} />
                            <input type="hidden" name="status" value={incident.actor.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"} />
                            <button className="rounded-2xl border border-ink-200 bg-white px-3 py-2 text-xs font-medium text-ink-900 hover:bg-ink-50">
                              {incident.actor.status === "SUSPENDED" ? t.reactivate : t.suspend}
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <PaginationControls locale={locale} page={page} pageSize={pageSize} totalItems={totalIncidents} basePath="/admin/security" itemLabel={locale === "pl" ? "incydentow" : "incidents"} />
      </section>
    </DashboardShell>
  );
}

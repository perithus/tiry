"use client";

import type { AuditAction } from "@prisma/client";
import type { Locale } from "@/lib/i18n/shared";

type SecurityActivityItem = {
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

function getActivityTitle(locale: Locale, item: SecurityActivityItem) {
  const kind = item.metadata?.kind;

  if (item.action === "SIGN_IN") {
    if (kind === "new_device_sign_in") return locale === "pl" ? "Logowanie z nowego urzadzenia" : "Sign-in from a new device";
    if (kind === "new_network_sign_in") return locale === "pl" ? "Logowanie z nowej sieci" : "Sign-in from a new network";
    if (kind === "new_user_agent_sign_in") return locale === "pl" ? "Logowanie z nowej przegladarki" : "Sign-in from a new browser";
    if (kind === "session_burst_sign_in") return locale === "pl" ? "Nagly wzrost logowan" : "Burst of recent sign-ins";
    if (kind === "rapid_ip_rotation_sign_in") return locale === "pl" ? "Szybka rotacja adresow IP" : "Rapid IP rotation detected";
    return locale === "pl" ? "Logowanie do konta" : "Account sign-in";
  }

  if (item.action === "SIGN_OUT") {
    if (kind === "revoke_other_sessions") return locale === "pl" ? "Wylogowano pozostale sesje" : "Other sessions signed out";
    if (kind === "current_session_revoke") return locale === "pl" ? "Wylogowanie biezacej sesji" : "Current session signed out";
    if (kind === "session_revoke") return locale === "pl" ? "Zamknieto inna sesje" : "Another session was revoked";
    return locale === "pl" ? "Wylogowanie z konta" : "Account sign-out";
  }

  if (item.action === "USER_UPDATED" && kind === "password_change") return locale === "pl" ? "Zmiana hasla" : "Password changed";
  if (item.action === "USER_UPDATED" && kind === "fleet_owner_profile") return locale === "pl" ? "Aktualizacja profilu ownera" : "Owner profile updated";
  if (item.action === "USER_UPDATED") return locale === "pl" ? "Aktualizacja danych konta" : "Account details updated";

  return locale === "pl" ? "Zdarzenie bezpieczenstwa" : "Security event";
}

function getActivityBody(locale: Locale, item: SecurityActivityItem) {
  const parts: string[] = [];
  const userAgent = item.metadata?.userAgent;
  const ipAddress = item.ipAddress ?? item.metadata?.ipAddress;

  if (userAgent) parts.push(userAgent);
  if (ipAddress) parts.push(ipAddress);

  if (item.metadata?.kind === "session_burst_sign_in" && item.metadata.signInCount1h) {
    parts.push(locale === "pl" ? `${item.metadata.signInCount1h} logowan w 1h` : `${item.metadata.signInCount1h} sign-ins in 1h`);
  }

  if (item.metadata?.kind === "rapid_ip_rotation_sign_in" && item.metadata.distinctIpCount24h) {
    parts.push(locale === "pl" ? `${item.metadata.distinctIpCount24h} adresy IP w 24h` : `${item.metadata.distinctIpCount24h} IPs in 24h`);
  }

  return parts.length > 0 ? parts.join(" • ") : locale === "pl" ? "Brak dodatkowych danych kontekstowych." : "No extra context captured.";
}

export function SecurityActivityList({
  locale,
  title,
  description,
  activities
}: {
  locale: Locale;
  title: string;
  description: string;
  activities: SecurityActivityItem[];
}) {
  return (
    <div className="glass-panel p-6">
      <h2 className="font-display text-2xl font-semibold text-ink-900">{title}</h2>
      <p className="mt-2 text-sm text-ink-600">{description}</p>

      <div className="mt-5 space-y-3">
        {activities.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-ink-200 bg-white/70 p-4 text-sm text-ink-600">
            {locale === "pl" ? "Brak ostatnich zdarzen bezpieczenstwa." : "No recent security activity."}
          </div>
        ) : (
          activities.map((activity) => (
            <article key={activity.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
              <p className="text-sm font-semibold text-ink-900">{getActivityTitle(locale, activity)}</p>
              <p className="mt-2 text-sm text-ink-600">{getActivityBody(locale, activity)}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ink-500">
                {activity.createdAt.toLocaleString(locale === "pl" ? "pl-PL" : "en-GB")}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

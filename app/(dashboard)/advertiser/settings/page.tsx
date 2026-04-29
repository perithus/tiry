import Link from "next/link";
import { NotificationPreferencesPanel } from "@/components/dashboard/notification-preferences-panel";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SecurityActivityList } from "@/components/dashboard/security-activity-list";
import { changeAdvertiserPassword, saveAdvertiserProfile } from "@/lib/actions/advertiser";
import { revokeOtherSessions, revokeSession } from "@/lib/actions/security";
import { requireRole } from "@/lib/auth/permissions";
import { getAdvertiserNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { getNotificationPreferences } from "@/lib/notifications/preferences";
import { normalizeSecurityMetadata } from "@/lib/security/activity";

export default async function AdvertiserSettingsPage() {
  const locale = await getLocale();
  const t = getMessages(locale);
  const session = await requireRole("ADVERTISER");
  const [user, sessions, securityActivity, notificationPreferences] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true, avatarUrl: true }
    }),
    prisma.session.findMany({
      where: { userId: session.user.id },
      orderBy: [{ lastSeenAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        lastSeenAt: true
      }
    }),
    prisma.auditLog.findMany({
      where: {
        actorId: session.user.id,
        OR: [
          { action: "SIGN_IN" },
          { action: "SIGN_OUT" },
          { action: "USER_UPDATED" }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        action: true,
        entityType: true,
        ipAddress: true,
        createdAt: true,
        metadata: true
      }
    }),
    getNotificationPreferences(session.user.id)
  ]);

  return (
    <DashboardShell
      title={t.dashboard.advertiser.title}
      nav={getAdvertiserNav(locale)}
      heading={t.dashboard.advertiser.settingsHeading}
      subheading={t.dashboard.advertiser.settingsSubheading}
      locale={locale}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{locale === "pl" ? "Profil konta" : "Account profile"}</h2>
            <form action={saveAdvertiserProfile} className="mt-5 grid gap-4">
              <Field label={locale === "pl" ? "Imie i nazwisko" : "Full name"}>
                <input name="name" defaultValue={user?.name ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <Field label="Email">
                <input name="email" type="email" defaultValue={user?.email ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <Field label={locale === "pl" ? "Telefon" : "Phone"}>
                <input name="phone" defaultValue={user?.phone ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <Field label={locale === "pl" ? "URL avatara" : "Avatar URL"}>
                <input name="avatarUrl" defaultValue={user?.avatarUrl ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">
                {locale === "pl" ? "Zapisz profil" : "Save profile"}
              </button>
            </form>
          </div>

          <div className="glass-panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink-900">{locale === "pl" ? "Centrum bezpieczenstwa" : "Security center"}</h2>
                <p className="mt-2 text-sm text-ink-600">
                  {locale === "pl"
                    ? "Sprawdz aktywne sesje, rozpoznaj urzadzenia i zamknij dostep z innych przegladarek."
                    : "Review active sessions, recognize devices, and close access from other browsers."}
                </p>
              </div>
              <form action={revokeOtherSessions}>
                <button className="rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50">
                  {locale === "pl" ? "Wyloguj pozostale sesje" : "Sign out other sessions"}
                </button>
              </form>
            </div>

            <div className="mt-5 space-y-3">
              {sessions.map((activeSession) => (
                <article key={activeSession.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">
                        {activeSession.id === session.sessionId
                          ? locale === "pl"
                            ? "Biezaca sesja"
                            : "Current session"
                          : locale === "pl"
                            ? "Aktywna sesja"
                            : "Active session"}
                      </p>
                      <p className="mt-2 text-sm text-ink-600">{activeSession.userAgent ?? (locale === "pl" ? "Nieznane urzadzenie" : "Unknown device")}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-500">{activeSession.ipAddress ?? "unknown"}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-500">
                        {locale === "pl" ? "Ostatnia aktywnosc" : "Last active"}: {activeSession.lastSeenAt.toLocaleString(locale === "pl" ? "pl-PL" : "en-GB")}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-500">
                        {locale === "pl" ? "Utworzono" : "Created"}: {activeSession.createdAt.toLocaleString(locale === "pl" ? "pl-PL" : "en-GB")}
                      </p>
                    </div>
                    <form action={revokeSession}>
                      <input type="hidden" name="sessionId" value={activeSession.id} />
                      <button className="rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50">
                        {activeSession.id === session.sessionId
                          ? locale === "pl"
                            ? "Wyloguj"
                            : "Sign out"
                          : locale === "pl"
                            ? "Zamknij sesje"
                            : "Revoke session"}
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <SecurityActivityList
            locale={locale}
            title={locale === "pl" ? "Ostatnia aktywnosc bezpieczenstwa" : "Recent security activity"}
            description={
              locale === "pl"
                ? "Tu widzisz logowania, wylogowania i najwazniejsze zmiany zwiazane z bezpieczenstwem konta."
                : "Review recent sign-ins, sign-outs, and the most important account security changes."
            }
            activities={securityActivity.map((entry) => ({
              ...entry,
              metadata: normalizeSecurityMetadata(entry.metadata)
            }))}
          />
          <div className="flex justify-end">
            <Link
              href="/advertiser/security"
              className="rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50"
            >
              {locale === "pl" ? "Zobacz pelne logi bezpieczenstwa" : "View full security logs"}
            </Link>
          </div>
          <NotificationPreferencesPanel
            locale={locale}
            title={locale === "pl" ? "Preferencje powiadomien" : "Notification preferences"}
            description={
              locale === "pl"
                ? "Wybierz, ktore typy alertow maja pojawiac sie w Twoim centrum powiadomien."
                : "Choose which alert types should appear in your notification center."
            }
            preferences={notificationPreferences}
            redirectPath="/advertiser/settings"
          />
        </div>

        <div className="glass-panel p-6">
          <h2 className="font-display text-2xl font-semibold text-ink-900">{locale === "pl" ? "Zmiana hasla" : "Change password"}</h2>
          <form action={changeAdvertiserPassword} className="mt-5 grid gap-4">
            <Field label={locale === "pl" ? "Obecne haslo" : "Current password"}>
              <input name="currentPassword" type="password" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <Field label={locale === "pl" ? "Nowe haslo" : "New password"}>
              <input name="newPassword" type="password" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <Field label={locale === "pl" ? "Powtorz nowe haslo" : "Confirm new password"}>
              <input name="confirmPassword" type="password" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">
              {locale === "pl" ? "Zmien haslo" : "Update password"}
            </button>
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

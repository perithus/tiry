import { saveNotificationPreferencesAction } from "@/lib/actions/notifications";
import type { NotificationPreferences } from "@/lib/notifications/preferences";
import type { Locale } from "@/lib/i18n/shared";

export function NotificationPreferencesPanel({
  locale,
  title,
  description,
  preferences,
  redirectPath
}: {
  locale: Locale;
  title: string;
  description: string;
  preferences: NotificationPreferences;
  redirectPath: string;
}) {
  const copy = {
    en: {
      messages: "Messages",
      offers: "Offers",
      bookings: "Bookings",
      campaignUpdates: "Campaign updates",
      securityAlerts: "Security alerts",
      verificationUpdates: "Verification updates",
      messagesBody: "Get notified when a conversation thread receives a new reply.",
      offersBody: "Receive alerts when offers are sent or accepted.",
      bookingsBody: "Stay updated on booking confirmations and status changes.",
      campaignUpdatesBody: "Follow inquiry and campaign workflow changes across your workspace.",
      securityAlertsBody: "Hear about sign-ins, suspicious activity, and access events.",
      verificationUpdatesBody: "Track document reviews and verification-related decisions.",
      save: "Save notification preferences"
    },
    pl: {
      messages: "Wiadomosci",
      offers: "Oferty",
      bookings: "Bookingi",
      campaignUpdates: "Aktualizacje kampanii",
      securityAlerts: "Alerty bezpieczenstwa",
      verificationUpdates: "Aktualizacje weryfikacji",
      messagesBody: "Otrzymuj powiadomienia, gdy watek rozmowy dostanie nowa odpowiedz.",
      offersBody: "Dostawaj alerty, gdy oferty sa wysylane lub akceptowane.",
      bookingsBody: "Sledz potwierdzenia bookingow i zmiany ich statusu.",
      campaignUpdatesBody: "Badz na biezaco ze zmianami inquiry i kampanii w swoim workspace.",
      securityAlertsBody: "Otrzymuj informacje o logowaniach, podejrzanej aktywnosci i zdarzeniach dostepu.",
      verificationUpdatesBody: "Sledz review dokumentow i decyzje zwiazane z weryfikacja.",
      save: "Zapisz preferencje powiadomien"
    }
  } as const;
  const t = copy[locale];

  const items: Array<{ key: keyof NotificationPreferences; title: string; body: string }> = [
    { key: "messages", title: t.messages, body: t.messagesBody },
    { key: "offers", title: t.offers, body: t.offersBody },
    { key: "bookings", title: t.bookings, body: t.bookingsBody },
    { key: "campaign_updates", title: t.campaignUpdates, body: t.campaignUpdatesBody },
    { key: "security_alerts", title: t.securityAlerts, body: t.securityAlertsBody },
    { key: "verification_updates", title: t.verificationUpdates, body: t.verificationUpdatesBody }
  ];

  return (
    <div className="glass-panel p-6">
      <h2 className="font-display text-2xl font-semibold text-ink-900">{title}</h2>
      <p className="mt-2 text-sm text-ink-600">{description}</p>

      <form action={saveNotificationPreferencesAction} className="mt-5 space-y-3">
        <input type="hidden" name="redirectPath" value={redirectPath} />
        {items.map((item) => (
          <label key={item.key} className="flex items-start gap-3 rounded-[1.25rem] border border-ink-100 bg-white/80 p-4">
            <input
              type="checkbox"
              name={item.key}
              defaultChecked={preferences[item.key]}
              className="mt-1 h-4 w-4 rounded border-ink-300 text-ink-900 focus:ring-ink-900"
            />
            <span>
              <span className="block text-sm font-semibold text-ink-900">{item.title}</span>
              <span className="mt-1 block text-sm leading-6 text-ink-600">{item.body}</span>
            </span>
          </label>
        ))}
        <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.save}</button>
      </form>
    </div>
  );
}

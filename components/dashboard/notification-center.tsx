import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/notifications";
import type { Locale } from "@/lib/i18n/shared";

export function NotificationCenter({
  locale,
  notifications
}: {
  locale: Locale;
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    type: string;
    readAt: Date | null;
    createdAt: Date;
  }>;
}) {
  const copy = {
    en: {
      empty: "No notifications yet.",
      markAll: "Mark all as read",
      markRead: "Mark as read",
      unread: "Unread",
      read: "Read"
    },
    pl: {
      empty: "Brak powiadomień.",
      markAll: "Oznacz wszystkie jako przeczytane",
      markRead: "Oznacz jako przeczytane",
      unread: "Nieprzeczytane",
      read: "Przeczytane"
    }
  } as const;
  const t = copy[locale];

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <form action={markAllNotificationsRead}>
          <button className="rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-ink-900 ring-1 ring-ink-200 hover:bg-ink-50">
            {t.markAll}
          </button>
        </form>
      </div>
      {notifications.length === 0 ? (
        <div className="glass-panel p-8 text-sm text-ink-600">{t.empty}</div>
      ) : (
        notifications.map((notification) => (
          <div key={notification.id} className="glass-panel p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-700">{notification.type}</span>
                  <span className={notification.readAt ? "text-xs uppercase tracking-[0.16em] text-ink-400" : "text-xs uppercase tracking-[0.16em] text-teal-700"}>
                    {notification.readAt ? t.read : t.unread}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-ink-900">{notification.title}</h2>
                <p className="text-sm leading-6 text-ink-600">{notification.body}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-ink-400">
                  {notification.createdAt.toLocaleString(locale === "pl" ? "pl-PL" : "en-GB")}
                </p>
              </div>
              {!notification.readAt ? (
                <form action={markNotificationRead}>
                  <input type="hidden" name="notificationId" value={notification.id} />
                  <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">
                    {t.markRead}
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

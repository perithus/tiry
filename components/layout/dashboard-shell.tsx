import Link from "next/link";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getNotificationsHref, getSearchHref } from "@/lib/auth/routing";
import type { Locale } from "@/lib/i18n/shared";
import type { NavItem } from "@/lib/data/navigation";
import { getMessages } from "@/lib/i18n/messages";

export function DashboardShell({
  title,
  nav,
  heading,
  subheading,
  locale = "en",
  children
}: {
  title: string;
  nav: NavItem[];
  heading: string;
  subheading: string;
  locale?: Locale;
  children: React.ReactNode;
}) {
  const t = getMessages(locale);
  const sessionPromise = getSession();

  return (
    <div className="container-shell py-10">
      <div className="dashboard-grid">
        <DashboardSidebar title={title} nav={nav} />
        <div className="space-y-8">
          <div className="glass-panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-500">{t.dashboard.workspace}</p>
              <p className="mt-1 text-sm text-ink-600">{title}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <DashboardSearchLink locale={locale} sessionPromise={sessionPromise} />
              <DashboardNotificationLink locale={locale} sessionPromise={sessionPromise} />
              <LanguageSwitcher locale={locale} />
              <SignOutButton locale={locale} />
            </div>
          </div>
          <div className="glass-panel p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">{title}</p>
            <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-ink-900">{heading}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-600">{subheading}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

async function DashboardSearchLink({
  locale,
  sessionPromise
}: {
  locale: Locale;
  sessionPromise: ReturnType<typeof getSession>;
}) {
  const session = await sessionPromise;
  if (!session) return null;

  return (
    <form action={getSearchHref(session.user)} className="flex min-w-[220px] items-center gap-2 rounded-2xl bg-white px-3 py-2 ring-1 ring-ink-200">
      <input
        name="q"
        type="search"
        placeholder={locale === "pl" ? "Szukaj w CRM..." : "Search across CRM..."}
        className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
      />
      <button type="submit" className="rounded-xl bg-ink-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-800">
        {locale === "pl" ? "Szukaj" : "Search"}
      </button>
    </form>
  );
}

async function DashboardNotificationLink({
  locale,
  sessionPromise
}: {
  locale: Locale;
  sessionPromise: ReturnType<typeof getSession>;
}) {
  const session = await sessionPromise;
  if (!session) return null;

  const unreadCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      readAt: null
    }
  });

  return (
    <Link
      href={getNotificationsHref(session.user)}
      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-ink-900 ring-1 ring-ink-200 hover:bg-ink-50"
    >
      {locale === "pl" ? "Powiadomienia" : "Notifications"}
      {unreadCount > 0 ? <span className="rounded-full bg-teal-600 px-2 py-0.5 text-xs text-white">{unreadCount}</span> : null}
    </Link>
  );
}

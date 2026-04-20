import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { SignOutButton } from "@/components/shared/sign-out-button";
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

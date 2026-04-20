import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getSession } from "@/lib/auth/session";
import { getDashboardHref } from "@/lib/auth/routing";
import { getLocale } from "@/lib/i18n/server";

export default async function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const session = await getSession();
  const dashboardHref = session ? getDashboardHref(session.user) : null;

  return (
    <div className="min-h-screen">
      <SiteHeader locale={locale} dashboardHref={dashboardHref} />
      <main>{children}</main>
      <SiteFooter locale={locale} />
    </div>
  );
}

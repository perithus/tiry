import { unstable_noStore as noStore } from "next/cache";
import { GlobalSearchPanel } from "@/components/dashboard/global-search-panel";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/permissions";
import { getAdminNav } from "@/lib/data/navigation";
import { getLocale } from "@/lib/i18n/server";
import { getGlobalSearchResults } from "@/lib/search/global";

export default async function AdminSearchPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  noStore();
  const locale = await getLocale();
  const session = await requireRole("ADMIN");
  const params = (await searchParams) ?? {};
  const query = params.q ?? "";
  const sections = await getGlobalSearchResults(session.user, query, locale);

  return (
    <DashboardShell
      title={locale === "pl" ? "Panel administratora" : "Admin control"}
      nav={getAdminNav(locale)}
      heading={locale === "pl" ? "Global search" : "Global search"}
      subheading={
        locale === "pl"
          ? "Przeszukuj uzytkownikow, firmy, oferty, zapytania i kampanie z jednego miejsca."
          : "Search users, companies, listings, inquiries, and campaigns from one place."
      }
      locale={locale}
    >
      <GlobalSearchPanel locale={locale} query={query} sections={sections} />
    </DashboardShell>
  );
}

import Link from "next/link";
import { cn } from "@/lib/utils/cn";

function buildHref(basePath: string, page: number, query?: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) params.set(key, value);
  }

  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }

  const search = params.toString();
  return search ? `${basePath}?${search}` : basePath;
}

export function PaginationControls({
  locale,
  page,
  pageSize,
  totalItems,
  basePath,
  query,
  itemLabel
}: {
  locale: "en" | "pl";
  page: number;
  pageSize: number;
  totalItems: number;
  basePath: string;
  query?: Record<string, string | undefined>;
  itemLabel?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(totalItems, safePage * pageSize);
  const rangeLabel =
    locale === "pl"
      ? `Pokazano ${start}-${end} z ${totalItems}${itemLabel ? ` ${itemLabel}` : ""}`
      : `Showing ${start}-${end} of ${totalItems}${itemLabel ? ` ${itemLabel}` : ""}`;

  const prevLabel = locale === "pl" ? "Poprzednia" : "Previous";
  const nextLabel = locale === "pl" ? "Nastepna" : "Next";
  const pageLabel = locale === "pl" ? `Strona ${safePage} z ${totalPages}` : `Page ${safePage} of ${totalPages}`;

  return (
    <nav
      aria-label={locale === "pl" ? "Paginacja" : "Pagination"}
      className="flex flex-col gap-3 border-t border-ink-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <p className="text-sm text-ink-600">{rangeLabel}</p>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">{pageLabel}</span>
        <div className="flex items-center gap-2">
          <Link
            aria-disabled={safePage <= 1}
            tabIndex={safePage <= 1 ? -1 : 0}
            href={buildHref(basePath, safePage - 1, query)}
            className={cn(
              "rounded-2xl border px-3 py-2 text-sm font-medium",
              safePage <= 1
                ? "pointer-events-none border-ink-100 bg-ink-50 text-ink-400"
                : "border-ink-200 bg-white text-ink-900 hover:bg-ink-50"
            )}
          >
            {prevLabel}
          </Link>
          <Link
            aria-disabled={safePage >= totalPages}
            tabIndex={safePage >= totalPages ? -1 : 0}
            href={buildHref(basePath, safePage + 1, query)}
            className={cn(
              "rounded-2xl border px-3 py-2 text-sm font-medium",
              safePage >= totalPages
                ? "pointer-events-none border-ink-100 bg-ink-50 text-ink-400"
                : "border-ink-200 bg-white text-ink-900 hover:bg-ink-50"
            )}
          >
            {nextLabel}
          </Link>
        </div>
      </div>
    </nav>
  );
}

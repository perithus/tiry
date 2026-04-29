import Link from "next/link";
import { Search } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Locale } from "@/lib/i18n/shared";
import type { SearchResultSection } from "@/lib/search/global";

function getTone(status?: string): "neutral" | "success" | "warning" | "danger" {
  if (!status) return "neutral";
  if (["ACTIVE", "VERIFIED", "COMPLETED", "ACCEPTED"].includes(status)) return "success";
  if (["PENDING", "IN_REVIEW", "SUBMITTED", "DRAFT", "INVITED", "NEGOTIATION", "READY_TO_BOOK", "OFFER_SENT"].includes(status)) return "warning";
  if (["REJECTED", "SUSPENDED", "ARCHIVED", "CANCELLED", "DECLINED", "EXPIRED"].includes(status)) return "danger";
  return "neutral";
}

export function GlobalSearchPanel({
  locale,
  query,
  sections
}: {
  locale: Locale;
  query: string;
  sections: SearchResultSection[];
}) {
  const hasQuery = query.trim().length >= 2;

  return (
    <div className="space-y-6">
      {!hasQuery ? (
        <div className="glass-panel p-8 text-center">
          <Search className="mx-auto h-10 w-10 text-ink-400" />
          <p className="mt-4 text-lg font-semibold text-ink-900">{locale === "pl" ? "Wpisz minimum 2 znaki" : "Type at least 2 characters"}</p>
          <p className="mt-2 text-sm text-ink-600">
            {locale === "pl" ? "Szukaj kampanii, ofert, zapytan, uzytkownikow i innych rekordow CRM." : "Search campaigns, listings, inquiries, users, and other CRM records."}
          </p>
        </div>
      ) : sections.length === 0 ? (
        <div className="glass-panel p-8 text-center">
          <Search className="mx-auto h-10 w-10 text-ink-400" />
          <p className="mt-4 text-lg font-semibold text-ink-900">{locale === "pl" ? "Brak wynikow" : "No results found"}</p>
          <p className="mt-2 text-sm text-ink-600">
            {locale === "pl" ? "Sprobuj innego hasla albo krotszej frazy." : "Try a different keyword or a shorter phrase."}
          </p>
        </div>
      ) : (
        sections.map((section) => (
          <section key={section.key} className="glass-panel p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold text-ink-900">{section.title}</h2>
              <StatusBadge label={String(section.items.length)} tone="neutral" />
            </div>
            <div className="mt-5 grid gap-3">
              {section.items.map((item) => (
                <Link key={`${section.key}:${item.id}`} href={item.href} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4 hover:bg-white">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                      <p className="mt-1 text-sm text-ink-600">{item.subtitle}</p>
                      {item.meta ? <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ink-500">{item.meta}</p> : null}
                    </div>
                    {item.status ? <StatusBadge label={item.status.replaceAll("_", " ")} tone={getTone(item.status)} /> : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

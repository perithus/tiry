"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/shared";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/shared";
import { cn } from "@/lib/utils/cn";

const localeMeta: Record<Locale, { label: string; symbol: string }> = {
  pl: { label: "Polski", symbol: "PL" },
  en: { label: "English", symbol: "EN" }
};

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setLocale(nextLocale: Locale) {
    if (nextLocale === locale) {
      return;
    }

    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;

    startTransition(() => {
      router.refresh();
    });
  }

  const isPolish = locale === "pl";

  return (
    <button
      type="button"
      onClick={() => setLocale(isPolish ? "en" : "pl")}
      aria-label={isPolish ? "Przelacz na jezyk angielski" : "Switch to Polish"}
      aria-busy={isPending}
      className={cn(
        "relative inline-flex h-12 min-w-[110px] items-center rounded-full border border-ink-200 bg-white px-2 shadow-sm transition",
        isPending ? "opacity-70" : "hover:border-ink-300"
      )}
    >
      <span
        className={cn(
          "absolute bottom-1 left-1 top-1 w-[calc(50%-0.5rem)] rounded-full bg-ink-900 shadow-sm transition-transform duration-300",
          isPolish ? "translate-x-0" : "translate-x-[calc(100%+0.5rem)]"
        )}
      />
      <span className="relative z-10 grid w-full grid-cols-2 items-center text-sm font-semibold">
        <LocaleSide active={isPolish} meta={localeMeta.pl} />
        <LocaleSide active={!isPolish} meta={localeMeta.en} />
      </span>
    </button>
  );
}

function LocaleSide({
  active,
  meta
}: {
  active: boolean;
  meta: { label: string; symbol: string };
}) {
  return (
    <span className={cn("flex items-center justify-center px-2", active ? "text-white" : "text-ink-500")}>
      <span className="relative inline-flex h-6 w-6 overflow-hidden rounded-full border border-current/20 shadow-sm">
        {meta.symbol === "PL" ? (
          <>
            <span className="absolute inset-x-0 top-0 h-1/2 bg-white" />
            <span className="absolute inset-x-0 bottom-0 h-1/2 bg-[#dc143c]" />
          </>
        ) : (
          <>
            <span className="absolute inset-0 bg-[#012169]" />
            <span className="absolute left-1/2 top-0 h-full w-[22%] -translate-x-1/2 bg-white" />
            <span className="absolute left-0 top-1/2 h-[22%] w-full -translate-y-1/2 bg-white" />
            <span className="absolute left-1/2 top-0 h-full w-[12%] -translate-x-1/2 bg-[#c8102e]" />
            <span className="absolute left-0 top-1/2 h-[12%] w-full -translate-y-1/2 bg-[#c8102e]" />
          </>
        )}
      </span>
    </span>
  );
}

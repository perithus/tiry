"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Locale } from "@/lib/i18n/shared";
import { getMessages } from "@/lib/i18n/messages";
import { Button } from "@/components/shared/button";

const COOKIE_NAME = "tiy_cookie_preferences";

type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

function persistPreferences(preferences: CookiePreferences) {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(preferences))}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  localStorage.setItem(COOKIE_NAME, JSON.stringify(preferences));
}

export function CookieBanner({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const existing = localStorage.getItem(COOKIE_NAME);
    if (!existing) {
      setVisible(true);
      return;
    }

    try {
      setPreferences(JSON.parse(existing) as CookiePreferences);
    } catch {
      setVisible(true);
    }
  }, []);

  function save(nextPreferences: CookiePreferences) {
    persistPreferences(nextPreferences);
    setPreferences(nextPreferences);
    setVisible(false);
    setExpanded(false);
  }

  function dismiss() {
    save(preferences);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-900">{t.cookies.title}</h2>
              <button
                type="button"
                onClick={dismiss}
                aria-label={locale === "pl" ? "Zamknij baner cookies" : "Close cookie banner"}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-500 hover:border-ink-300 hover:text-ink-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink-700">{t.cookies.description}</p>
            <p className="mt-2 text-sm leading-6 text-ink-600">{t.cookies.processing}</p>

            {expanded ? (
              <div className="mt-5 grid gap-3">
                <PreferenceRow
                  title={t.cookies.necessary}
                  description={t.cookies.necessaryDescription}
                  checked
                  disabled
                  onChange={() => undefined}
                />
                <PreferenceRow
                  title={t.cookies.analytics}
                  description={t.cookies.analyticsDescription}
                  checked={preferences.analytics}
                  onChange={(checked) => setPreferences((current) => ({ ...current, analytics: checked }))}
                />
                <PreferenceRow
                  title={t.cookies.marketing}
                  description={t.cookies.marketingDescription}
                  checked={preferences.marketing}
                  onChange={(checked) => setPreferences((current) => ({ ...current, marketing: checked }))}
                />
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 lg:min-w-56">
            <Button onClick={() => save({ necessary: true, analytics: true, marketing: true })}>
              {t.cookies.acceptAll}
            </Button>
            <Button
              variant="secondary"
              onClick={() => save({ necessary: true, analytics: false, marketing: false })}
            >
              {t.cookies.rejectOptional}
            </Button>
            <Button variant="ghost" onClick={() => expanded ? save(preferences) : setExpanded(true)}>
              {expanded ? t.cookies.save : t.cookies.manage}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreferenceRow({
  title,
  description,
  checked,
  disabled,
  onChange
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl bg-ink-50 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-ink-600">{description}</p>
      </div>
      <input
        type="checkbox"
        className="mt-1 rounded border-ink-300 text-ink-900"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

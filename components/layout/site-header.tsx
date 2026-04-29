"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { ButtonLink } from "@/components/shared/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { SignOutButton } from "@/components/shared/sign-out-button";
import type { Locale } from "@/lib/i18n/shared";
import { getMessages } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils/cn";

export function SiteHeader({
  locale,
  dashboardHref
}: {
  locale: Locale;
  dashboardHref?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const t = getMessages(locale);
  const marketingNav = [
    { href: "/#how-it-works", label: t.nav.howItWorks },
    { href: "/#for-advertisers", label: t.nav.advertisers },
    { href: "/#for-carriers", label: t.nav.carriers },
    { href: "/marketplace", label: t.nav.marketplace },
    { href: "/faq", label: t.nav.faq },
    { href: "/contact", label: t.nav.contact }
  ];

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-sand/75 backdrop-blur-xl">
      <div className="container-shell flex min-h-20 items-center justify-between gap-4 py-4">
        <Logo />

        <nav className="hidden items-center gap-6 lg:flex">
          {marketingNav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-ink-700 hover:text-ink-900">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher locale={locale} />
          {dashboardHref ? (
            <>
              <ButtonLink href={dashboardHref} variant="ghost">
                {locale === "pl" ? "Dashboard" : "Dashboard"}
              </ButtonLink>
              <SignOutButton locale={locale} />
            </>
          ) : (
            <>
              <ButtonLink href="/sign-in" variant="ghost">
                {t.nav.signIn}
              </ButtonLink>
              <ButtonLink href="/sign-up">{t.nav.getStarted}</ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-ink-200 bg-white text-ink-900 shadow-sm lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn("lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}>
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "fixed inset-0 top-[81px] z-40 bg-ink-950/55 backdrop-blur-md transition duration-300",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "container-shell fixed inset-x-0 top-[92px] z-50 transition duration-300",
            open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          )}
        >
          <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-ink-900 via-ink-800 to-ink-900 p-5 text-white shadow-[0_30px_100px_rgba(15,23,42,0.45)] ring-1 ring-white/10">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                {locale === "pl" ? "Nawigacja" : "Navigation"}
              </p>
              <LanguageSwitcher locale={locale} />
            </div>

            <nav className="grid gap-2">
              {marketingNav.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="animate-rise rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-medium text-white/92 hover:border-white/20 hover:bg-white/10"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {dashboardHref ? (
                <>
                  <ButtonLink
                    href={dashboardHref}
                    variant="ghost"
                    className="w-full justify-center border border-white/12 bg-white/8 text-white hover:bg-white/12"
                    onClick={() => setOpen(false)}
                  >
                    {locale === "pl" ? "Dashboard" : "Dashboard"}
                  </ButtonLink>
                  <div onClick={() => setOpen(false)} className="w-full">
                    <SignOutButton locale={locale} />
                  </div>
                </>
              ) : (
                <>
                  <ButtonLink
                    href="/sign-in"
                    variant="ghost"
                    className="w-full justify-center border border-white/12 bg-white/8 text-white hover:bg-white/12"
                    onClick={() => setOpen(false)}
                  >
                    {t.nav.signIn}
                  </ButtonLink>
                  <ButtonLink href="/sign-up" className="w-full justify-center bg-white text-ink-900 hover:bg-white/90" onClick={() => setOpen(false)}>
                    {t.nav.getStarted}
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { Logo } from "@/components/branding/logo";
import type { Locale } from "@/lib/i18n/shared";
import { getMessages } from "@/lib/i18n/messages";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getMessages(locale);

  return (
    <footer className="border-t border-ink-100 bg-white/80">
      <div className="container-shell grid gap-8 py-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-md text-sm leading-6 text-ink-600">{t.footer.description}</p>
        </div>
        <FooterColumn
          title={t.footer.platform}
          links={[
            { href: "/marketplace", label: t.nav.marketplace },
            { href: "/advertisers", label: t.nav.advertisers },
            { href: "/transport-companies", label: t.nav.carriers }
          ]}
        />
        <FooterColumn
          title={t.footer.company}
          links={[
            { href: "/how-it-works", label: t.nav.howItWorks },
            { href: "/faq", label: t.nav.faq },
            { href: "/contact", label: t.nav.contact }
          ]}
        />
        <FooterColumn
          title={t.footer.legal}
          links={[
            { href: "/privacy-policy", label: t.footer.privacy },
            { href: "/terms", label: t.footer.terms }
          ]}
        />
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<{ href: string; label: string }> }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-500">{title}</h3>
      <div className="flex flex-col gap-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="text-sm text-ink-700 hover:text-ink-900">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

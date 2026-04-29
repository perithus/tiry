import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/contact-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";
import { getCaptchaConfig } from "@/lib/security/captcha";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return buildPageMetadata({
    locale,
    title: locale === "pl" ? "Kontakt w sprawie reklamy na ciężarówkach" : "Contact the Truck Advertising Marketplace Team",
    description:
      locale === "pl"
        ? "Skontaktuj się w sprawie partnerstwa, wdrożenia, onboardingu lub kampanii reklamy na ciężarówkach i naczepach."
        : "Contact the team for partnerships, onboarding, rollout planning, or truck and trailer advertising campaigns.",
    path: "/contact",
    keywords: ["truck advertising contact", "fleet media contact", "advertising marketplace contact"]
  });
}

export default async function ContactPage() {
  const locale = await getLocale();
  const t = getMessages(locale);
  const captchaConfig = getCaptchaConfig();
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: locale === "pl" ? "Kontakt" : "Contact",
    url: `${process.env.APP_URL ?? "http://localhost:3000"}/contact`
  };

  return (
    <section className="container-shell py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }} />
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <SectionHeading eyebrow={t.contact.eyebrow} title={t.contact.title} description={t.contact.description} />
          <div className="glass-panel p-8">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-900">{t.contact.detailsTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-ink-600">{t.contact.detailsBody}</p>
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">{t.contact.emailLabel}</p>
                <p className="mt-2 text-base text-ink-900">hello@example.com</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">{t.contact.responseLabel}</p>
                <p className="mt-2 text-base text-ink-900">{t.contact.responseValue}</p>
              </div>
            </div>
          </div>
        </div>
        <ContactForm locale={locale} captchaEnabled={captchaConfig.CAPTCHA_PROVIDER !== "disabled"} />
      </div>
    </section>
  );
}

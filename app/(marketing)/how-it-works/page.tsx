import { SectionHeading } from "@/components/shared/section-heading";
import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";

export default async function HowItWorksPage() {
  const locale = await getLocale();
  const t = getMessages(locale);
  const steps = t.marketing.how.steps;

  return (
    <section className="container-shell py-20">
      <SectionHeading
        eyebrow={t.marketing.how.eyebrow}
        title={t.marketing.how.title}
        description={t.marketing.how.description}
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="glass-panel p-6">
            <p className="text-sm font-semibold text-teal-700">0{index + 1}</p>
            <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink-900">{step.title}</h3>
            <p className="mt-3 text-sm leading-7 text-ink-600">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

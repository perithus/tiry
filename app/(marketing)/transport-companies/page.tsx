import { SectionHeading } from "@/components/shared/section-heading";
import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";

export default async function TransportCompaniesPage() {
  const locale = await getLocale();
  const t = getMessages(locale);

  return (
    <section className="container-shell py-20">
      <SectionHeading
        eyebrow={t.marketing.carriers.eyebrow}
        title={t.marketing.carriers.title}
        description={t.marketing.carriers.description}
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {t.marketing.carriers.features.map(([title, body]) => (
          <FeatureCard key={title} title={title} body={body} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass-panel p-6">
      <h3 className="font-display text-xl font-semibold tracking-tight text-ink-900">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-ink-600">{body}</p>
    </div>
  );
}

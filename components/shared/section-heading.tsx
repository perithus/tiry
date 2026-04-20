export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">{eyebrow}</p>
      <h2 className="font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{title}</h2>
      <p className="text-base leading-7 text-ink-700">{description}</p>
    </div>
  );
}

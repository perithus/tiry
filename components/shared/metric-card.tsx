export function MetricCard({
  label,
  value,
  description
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="metric-card">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="font-display mt-3 text-3xl font-semibold tracking-tight text-ink-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-ink-600">{description}</p>
    </div>
  );
}

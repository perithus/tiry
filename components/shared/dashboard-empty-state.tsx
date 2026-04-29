import Link from "next/link";

export function DashboardEmptyState({
  title,
  body,
  href,
  cta
}: {
  title: string;
  body: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-ink-200 bg-white/70 p-6 text-center">
      <h3 className="font-display text-2xl font-semibold text-ink-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-ink-600">{body}</p>
      {href && cta ? (
        <Link
          href={href}
          className="mt-5 inline-flex rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800"
        >
          {cta}
        </Link>
      ) : null}
    </div>
  );
}

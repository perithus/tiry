function LoadingCard() {
  return (
    <div className="glass-panel-premium ambient-card p-6">
      <div className="skeleton-block h-4 w-28" />
      <div className="mt-5 space-y-3">
        <div className="skeleton-block h-10 w-4/5" />
        <div className="skeleton-block h-4 w-full" />
        <div className="skeleton-block h-4 w-3/4" />
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <div className="skeleton-block h-24 w-full" />
        <div className="skeleton-block h-24 w-full" />
      </div>
    </div>
  );
}

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-sand">
      <div className="container-shell py-12">
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/70 bg-white/80 px-5 py-4 shadow-soft backdrop-blur-xl">
          <div className="skeleton-block h-8 w-36" />
          <div className="flex items-center gap-3">
            <div className="skeleton-block h-10 w-20 rounded-full" />
            <div className="skeleton-block h-10 w-28 rounded-full" />
          </div>
        </div>

        <div className="grid gap-6 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-teal-700">
              Ładowanie<span className="loading-dots" />
            </div>
            <div className="space-y-4">
              <div className="skeleton-block h-16 w-full max-w-3xl" />
              <div className="skeleton-block h-16 w-4/5 max-w-2xl" />
              <div className="skeleton-block h-5 w-full max-w-2xl" />
              <div className="skeleton-block h-5 w-3/4 max-w-xl" />
            </div>
            <div className="flex gap-3">
              <div className="skeleton-block h-12 w-40 rounded-full" />
              <div className="skeleton-block h-12 w-44 rounded-full" />
            </div>
          </div>

          <div className="grid gap-5">
            <LoadingCard />
            <LoadingCard />
          </div>
        </div>
      </div>
    </div>
  );
}

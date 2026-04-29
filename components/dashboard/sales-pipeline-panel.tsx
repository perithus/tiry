type SalesPipelinePanelProps = {
  title: string;
  subtitle: string;
  stageLabels: {
    submitted: string;
    inReview: string;
    offerSent: string;
    booked: string;
    planning: string;
    negotiation: string;
    ready: string;
    active: string;
    completed: string;
  };
  stageCounts: {
    submitted: number;
    inReview: number;
    offerSent: number;
    booked: number;
    campaignsPlanning: number;
    campaignsNegotiation: number;
    campaignsReady: number;
    campaignsActive: number;
    campaignsCompleted: number;
  };
};

export function SalesPipelinePanel({ title, subtitle, stageLabels, stageCounts }: SalesPipelinePanelProps) {
  const stages = [
    { label: stageLabels.submitted, value: stageCounts.submitted },
    { label: stageLabels.inReview, value: stageCounts.inReview },
    { label: stageLabels.offerSent, value: stageCounts.offerSent },
    { label: stageLabels.booked, value: stageCounts.booked },
    { label: stageLabels.planning, value: stageCounts.campaignsPlanning },
    { label: stageLabels.negotiation, value: stageCounts.campaignsNegotiation },
    { label: stageLabels.ready, value: stageCounts.campaignsReady },
    { label: stageLabels.active, value: stageCounts.campaignsActive },
    { label: stageLabels.completed, value: stageCounts.campaignsCompleted }
  ];

  return (
    <section className="glass-panel p-6">
      <div className="mb-5">
        <h2 className="font-display text-2xl font-semibold text-ink-900">{title}</h2>
        <p className="mt-2 text-sm text-ink-600">{subtitle}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stages.map((stage) => (
          <div key={stage.label} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-ink-500">{stage.label}</p>
            <p className="mt-3 font-display text-3xl font-semibold text-ink-900">{stage.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

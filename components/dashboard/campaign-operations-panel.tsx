import type { CampaignMilestoneRecord } from "@/lib/campaign-operations";
import type { Locale } from "@/lib/i18n/shared";
import { addCampaignMilestoneAction, updateCampaignMilestoneAction } from "@/lib/actions/campaigns";
import { FormSubmitButton } from "@/components/shared/form-submit-button";
import { campaignMilestoneStatusValues } from "@/lib/validation/campaign";

function formatDate(value: Date | null, locale: Locale) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(value);
}

function getTone(status: string) {
  if (status === "DONE") return "success";
  if (status === "IN_PROGRESS" || status === "BLOCKED") return "warning";
  return "neutral";
}

export function CampaignOperationsPanel({
  locale,
  campaignId,
  milestones,
  assignees,
  copy
}: {
  locale: Locale;
  campaignId: string;
  milestones: CampaignMilestoneRecord[];
  assignees: Array<{ id: string; name: string; email: string }>;
  copy: {
    title: string;
    add: string;
    noItems: string;
    milestoneTitle: string;
    phase: string;
    assignee: string;
    dueDate: string;
    status: string;
    save: string;
    unassigned: string;
  };
}) {
  return (
    <section className="glass-panel p-6">
      <h2 className="font-display text-2xl font-semibold text-ink-900">{copy.title}</h2>

      <form action={addCampaignMilestoneAction} className="mt-4 grid gap-3 rounded-2xl border border-ink-100 bg-white/80 p-4">
        <input type="hidden" name="campaignId" value={campaignId} />
        <input name="title" placeholder={copy.milestoneTitle} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        <div className="grid gap-3 md:grid-cols-2">
          <input name="phase" placeholder={copy.phase} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
          <select name="assigneeId" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            <option value="">{copy.unassigned}</option>
            {assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name} ({assignee.email})
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input name="dueDate" type="date" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
          <select name="status" defaultValue="TODO" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
            {campaignMilestoneStatusValues.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <FormSubmitButton pendingLabel={`${copy.add}...`}>{copy.add}</FormSubmitButton>
      </form>

      <div className="mt-5 space-y-4">
        {milestones.length === 0 ? (
          <p className="text-sm text-ink-600">{copy.noItems}</p>
        ) : (
          milestones.map((milestone) => (
            <article key={milestone.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink-900">{milestone.title}</p>
                  <p className="mt-1 text-sm text-ink-600">{milestone.phase}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  getTone(milestone.status) === "success"
                    ? "bg-emerald-100 text-emerald-700"
                    : getTone(milestone.status) === "warning"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-ink-100 text-ink-700"
                }`}>
                  {milestone.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs uppercase tracking-[0.16em] text-ink-500">
                <span>{copy.assignee}: {milestone.assigneeName ?? copy.unassigned}</span>
                {milestone.dueDate ? <span>{copy.dueDate}: {formatDate(milestone.dueDate, locale)}</span> : null}
              </div>

              <form action={updateCampaignMilestoneAction} className="mt-4 grid gap-3 rounded-2xl border border-ink-100 bg-ink-50/70 p-4">
                <input type="hidden" name="milestoneId" value={milestone.id} />
                <input type="hidden" name="campaignId" value={campaignId} />
                <input name="title" defaultValue={milestone.title} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
                <div className="grid gap-3 md:grid-cols-2">
                  <input name="phase" defaultValue={milestone.phase} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
                  <select name="assigneeId" defaultValue={milestone.assigneeId ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                    <option value="">{copy.unassigned}</option>
                    {assignees.map((assignee) => (
                      <option key={assignee.id} value={assignee.id}>
                        {assignee.name} ({assignee.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    name="dueDate"
                    type="date"
                    defaultValue={milestone.dueDate ? milestone.dueDate.toISOString().slice(0, 10) : ""}
                    className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                  />
                  <select name="status" defaultValue={milestone.status} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                    {campaignMilestoneStatusValues.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                <FormSubmitButton pendingLabel={`${copy.save}...`}>{copy.save}</FormSubmitButton>
              </form>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

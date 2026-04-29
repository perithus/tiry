import type { CampaignWrapUpRecord } from "@/lib/campaign-operations";
import { saveAdminCampaignWrapUpAction, saveParticipantCampaignWrapUpAction } from "@/lib/actions/campaigns";
import { FormSubmitButton } from "@/components/shared/form-submit-button";

export function AdminCampaignWrapUpPanel({
  campaignId,
  wrapUp,
  copy
}: {
  campaignId: string;
  wrapUp: CampaignWrapUpRecord | null;
  copy: {
    title: string;
    deliverySummary: string;
    proofOfDelivery: string;
    internalOutcome: string;
    renewalOpportunity: string;
    followUpOwner: string;
    save: string;
  };
}) {
  return (
    <section className="glass-panel p-6">
      <h2 className="font-display text-2xl font-semibold text-ink-900">{copy.title}</h2>
      <form action={saveAdminCampaignWrapUpAction} className="mt-4 grid gap-3">
        <input type="hidden" name="campaignId" value={campaignId} />
        <textarea name="deliverySummary" rows={4} defaultValue={wrapUp?.deliverySummary ?? ""} placeholder={copy.deliverySummary} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        <textarea name="proofOfDelivery" rows={3} defaultValue={wrapUp?.proofOfDelivery ?? ""} placeholder={copy.proofOfDelivery} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        <textarea name="internalOutcome" rows={3} defaultValue={wrapUp?.internalOutcome ?? ""} placeholder={copy.internalOutcome} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        <div className="grid gap-3 md:grid-cols-2">
          <input name="renewalOpportunity" defaultValue={wrapUp?.renewalOpportunity ?? ""} placeholder={copy.renewalOpportunity} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
          <input name="followUpOwner" defaultValue={wrapUp?.followUpOwner ?? ""} placeholder={copy.followUpOwner} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        </div>
        <FormSubmitButton pendingLabel={`${copy.save}...`}>{copy.save}</FormSubmitButton>
      </form>
    </section>
  );
}

export function ParticipantCampaignWrapUpPanel({
  campaignId,
  wrapUp,
  role,
  copy
}: {
  campaignId: string;
  wrapUp: CampaignWrapUpRecord | null;
  role: "advertiser" | "carrier";
  copy: {
    title: string;
    feedback: string;
    rating: string;
    save: string;
  };
}) {
  const feedback = role === "advertiser" ? wrapUp?.advertiserFeedback ?? "" : wrapUp?.carrierFeedback ?? "";
  const rating = role === "advertiser" ? wrapUp?.advertiserRating ?? "" : wrapUp?.carrierRating ?? "";

  return (
    <section className="glass-panel p-6">
      <h2 className="font-display text-2xl font-semibold text-ink-900">{copy.title}</h2>
      <form action={saveParticipantCampaignWrapUpAction} className="mt-4 grid gap-3">
        <input type="hidden" name="campaignId" value={campaignId} />
        <textarea name="feedback" rows={4} defaultValue={feedback} placeholder={copy.feedback} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        <input name="rating" type="number" min="1" max="5" defaultValue={rating} placeholder={copy.rating} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
        <FormSubmitButton pendingLabel={`${copy.save}...`}>{copy.save}</FormSubmitButton>
      </form>
    </section>
  );
}

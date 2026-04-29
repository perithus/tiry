"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/toast-provider";
import { sendCampaignMessage, sendInquiryMessage } from "@/lib/actions/messages";

export function MessageComposer({
  inquiryId,
  campaignId,
  placeholder,
  submitLabel,
  successLabel
}: {
  inquiryId?: string;
  campaignId?: string;
  placeholder: string;
  submitLabel: string;
  successLabel: string;
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [pending, startTransition] = useTransition();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const feedbackId = `message-composer-feedback-${campaignId ?? inquiryId ?? "unknown"}`;

  return (
    <form
      className="mt-4 grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        startTransition(async () => {
          try {
            const formData = new FormData();
            formData.set("body", body);

            if (campaignId) {
              formData.set("campaignId", campaignId);
              await sendCampaignMessage(formData);
            } else if (inquiryId) {
              formData.set("inquiryId", inquiryId);
              await sendInquiryMessage(formData);
            } else {
              throw new Error("Missing conversation context.");
            }

            setBody("");
            setSuccess(successLabel);
            pushToast({ title: successLabel, tone: "success" });
            router.refresh();
          } catch (actionError) {
            const message = actionError instanceof Error ? actionError.message : "Unable to send message.";
            setError(message);
            pushToast({ title: message, tone: "error" });
          }
        });
      }}
    >
      <textarea
        aria-describedby={error || success ? feedbackId : undefined}
        aria-invalid={Boolean(error)}
        aria-label={placeholder}
        name="body"
        rows={4}
        placeholder={placeholder}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
      />
      {error ? (
        <p id={feedbackId} aria-live="polite" className="text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {success ? (
        <p id={feedbackId} aria-live="polite" className="text-sm text-teal-700">
          {success}
        </p>
      ) : null}
      <div className="flex justify-end">
        <button disabled={pending} className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-60">
          {pending ? `${submitLabel}...` : submitLabel}
        </button>
      </div>
    </form>
  );
}

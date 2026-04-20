"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { z as zod } from "zod";
import { inquirySchema } from "@/lib/validation/listing";
import { Button } from "@/components/shared/button";

type FormValues = Omit<z.infer<typeof inquirySchema>, "targetCountries"> & {
  targetCountries: string;
};

const clientInquirySchema = zod.object({
  listingId: zod.string().cuid(),
  campaignName: zod.string().min(3).max(120),
  message: zod.string().min(20).max(2000),
  budgetMinCents: zod.coerce.number().int().nonnegative().optional(),
  budgetMaxCents: zod.coerce.number().int().nonnegative().optional(),
  targetCountries: zod.string().min(2)
});

export function InquiryForm({ listingId }: { listingId: string }) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(clientInquirySchema),
    defaultValues: {
      listingId,
      targetCountries: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setState("loading");
    setError(null);

    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        targetCountries: values.targetCountries
      })
    });

    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(result.error ?? "Unable to send inquiry.");
      setState("error");
      return;
    }

    setState("success");
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-ink-100 bg-white p-6">
      <input type="hidden" {...register("listingId")} />
      <Field label="Campaign name" error={errors.campaignName?.message}>
        <input {...register("campaignName")} className="w-full rounded-2xl border-ink-200 bg-white" />
      </Field>
      <Field label="Campaign goals" error={errors.message?.message}>
        <textarea {...register("message")} rows={5} className="w-full rounded-2xl border-ink-200 bg-white" />
      </Field>
      <Field label="Target countries" error={errors.targetCountries?.message as string | undefined}>
        <input
          {...register("targetCountries" as never)}
          placeholder="Poland, Germany, Netherlands"
          className="w-full rounded-2xl border-ink-200 bg-white"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Budget min (cents)" error={errors.budgetMinCents?.message}>
          <input {...register("budgetMinCents")} type="number" className="w-full rounded-2xl border-ink-200 bg-white" />
        </Field>
        <Field label="Budget max (cents)" error={errors.budgetMaxCents?.message}>
          <input {...register("budgetMaxCents")} type="number" className="w-full rounded-2xl border-ink-200 bg-white" />
        </Field>
      </div>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {state === "success" ? <p className="text-sm text-teal-700">Inquiry sent. The carrier team can now review your campaign.</p> : null}
      <Button type="submit" className="w-full" disabled={state === "loading"}>
        {state === "loading" ? "Submitting..." : "Send inquiry"}
      </Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-ink-700">{label}</span>
      {children}
      {error ? <span className="text-xs text-rose-700">{error}</span> : null}
    </label>
  );
}

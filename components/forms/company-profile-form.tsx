"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { companyProfileSchema } from "@/lib/validation/company";
import { saveCompanyProfile } from "@/lib/actions/company";
import { Button } from "@/components/shared/button";

type FormValues = z.infer<typeof companyProfileSchema>;

export function CompanyProfileForm({ defaultValues }: { defaultValues: FormValues }) {
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful }
  } = useForm<FormValues>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      await saveCompanyProfile(values);
    });
  });

  return (
    <form onSubmit={onSubmit} className="glass-panel space-y-4 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Legal name" error={errors.legalName?.message}>
          <input {...register("legalName")} className="w-full rounded-2xl border-ink-200 bg-white" />
        </Field>
        <Field label="Display name" error={errors.displayName?.message}>
          <input {...register("displayName")} className="w-full rounded-2xl border-ink-200 bg-white" />
        </Field>
      </div>
      <Field label="Description" error={errors.description?.message}>
        <textarea {...register("description")} rows={5} className="w-full rounded-2xl border-ink-200 bg-white" />
      </Field>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Website" error={errors.websiteUrl?.message}>
          <input {...register("websiteUrl")} className="w-full rounded-2xl border-ink-200 bg-white" />
        </Field>
        <Field label="Headquarters city" error={errors.headquartersCity?.message}>
          <input {...register("headquartersCity")} className="w-full rounded-2xl border-ink-200 bg-white" />
        </Field>
        <Field label="Headquarters country" error={errors.headquartersCountry?.message}>
          <input {...register("headquartersCountry")} className="w-full rounded-2xl border-ink-200 bg-white" />
        </Field>
      </div>
      <Field label="Fleet size" error={errors.fleetSize?.message}>
        <input {...register("fleetSize")} type="number" className="w-full rounded-2xl border-ink-200 bg-white md:w-48" />
      </Field>
      {isSubmitSuccessful ? <p className="text-sm text-teal-700">Company profile saved.</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save company profile"}
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

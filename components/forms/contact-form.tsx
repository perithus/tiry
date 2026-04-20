"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { contactFormSchema } from "@/lib/validation/contact";
import { Button } from "@/components/shared/button";
import type { Locale } from "@/lib/i18n/shared";
import { getMessages } from "@/lib/i18n/messages";

const contactFormClientSchema = contactFormSchema.extend({
  privacyConsent: z.boolean().refine((value) => value, {
    message: "Privacy consent is required."
  })
});

type FormValues = z.infer<typeof contactFormClientSchema>;

export function ContactForm({
  locale,
  captchaEnabled
}: {
  locale: Locale;
  captchaEnabled: boolean;
}) {
  const t = getMessages(locale);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(contactFormClientSchema),
    defaultValues: {
      company: "",
      marketingConsent: false,
      privacyConsent: false,
      captchaToken: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setServerError(null);
    setSuccess(null);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setServerError(result.error ?? "Unable to send contact request.");
      setLoading(false);
      return;
    }

    reset();
    setSuccess(t.contact.success);
    setLoading(false);
  });

  return (
    <form onSubmit={onSubmit} className="glass-panel space-y-5 p-8">
      <div>
        <h2 className="font-display text-3xl font-semibold tracking-tight text-ink-900">{t.contact.formTitle}</h2>
        <p className="mt-3 text-sm leading-6 text-ink-600">{t.contact.formDescription}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t.form.name} error={errors.name?.message}>
          <input {...register("name")} className="w-full rounded-2xl border-ink-200 bg-white" />
        </Field>
        <Field label={t.form.email} error={errors.email?.message}>
          <input {...register("email")} type="email" className="w-full rounded-2xl border-ink-200 bg-white" />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t.form.company} error={errors.company?.message}>
          <input {...register("company")} className="w-full rounded-2xl border-ink-200 bg-white" />
        </Field>
        <Field label={t.form.subject} error={errors.subject?.message}>
          <input {...register("subject")} className="w-full rounded-2xl border-ink-200 bg-white" />
        </Field>
      </div>

      <Field label={t.form.message} error={errors.message?.message}>
        <textarea {...register("message")} rows={6} className="w-full rounded-2xl border-ink-200 bg-white" />
      </Field>

      <label className="flex items-start gap-3 rounded-2xl bg-ink-50 px-4 py-3 text-sm text-ink-700">
        <input {...register("privacyConsent")} type="checkbox" className="mt-1 rounded border-ink-300 text-ink-900" />
        <span>{t.form.privacyConsent}</span>
      </label>
      {errors.privacyConsent?.message ? <p className="text-xs text-rose-700">{errors.privacyConsent.message}</p> : null}

      <label className="flex items-start gap-3 rounded-2xl bg-ink-50 px-4 py-3 text-sm text-ink-700">
        <input {...register("marketingConsent")} type="checkbox" className="mt-1 rounded border-ink-300 text-ink-900" />
        <span>{t.form.marketingConsent}</span>
      </label>

      <div className="rounded-2xl border border-dashed border-ink-200 bg-white px-4 py-3 text-sm text-ink-600">
        {captchaEnabled ? "Captcha enabled." : t.form.captchaPending}
      </div>

      {serverError ? <p className="text-sm text-rose-700">{serverError}</p> : null}
      {success ? <p className="text-sm text-teal-700">{success}</p> : null}

      <Button type="submit" className="w-full md:w-auto" disabled={loading}>
        {loading ? t.form.sending : t.form.submitContact}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-ink-700">{label}</span>
      {children}
      {error ? <span className="text-xs text-rose-700">{error}</span> : null}
    </label>
  );
}

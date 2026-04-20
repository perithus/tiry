"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/lib/validation/auth";
import type { z } from "zod";
import { Button } from "@/components/shared/button";
import type { Locale } from "@/lib/i18n/shared";
import { getMessages } from "@/lib/i18n/messages";

type FormValues = z.infer<typeof signInSchema>;

export function SignInForm({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(signInSchema)
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(result.error ?? "Unable to sign in.");
      setLoading(false);
      return;
    }

    const result = (await response.json()) as { redirectTo: string };
    window.location.href = result.redirectTo;
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label={t.auth.emailLabel} error={errors.email?.message}>
        <input {...register("email")} type="email" className="w-full rounded-2xl border-ink-200 bg-white" />
      </Field>
      <Field label={t.auth.passwordLabel} error={errors.password?.message}>
        <input {...register("password")} type="password" className="w-full rounded-2xl border-ink-200 bg-white" />
      </Field>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t.auth.signInLoading : t.auth.signInTitle}
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

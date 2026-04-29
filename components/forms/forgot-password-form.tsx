"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/shared/button";
import { useToast } from "@/components/shared/toast-provider";
import { getMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/i18n/shared";
import { forgotPasswordSchema } from "@/lib/validation/auth";

type FormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  const { pushToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const successLabel =
    locale === "pl"
      ? "Jesli konto istnieje, wyslalismy link do resetu hasla."
      : "If an account exists, we sent a password reset link.";

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-locale": locale
      },
      body: JSON.stringify(values)
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      const message = payload.error ?? "Unable to send the reset link.";
      setError(message);
      pushToast({ title: message, tone: "error" });
      setLoading(false);
      return;
    }

    setSuccess(successLabel);
    pushToast({ title: successLabel, tone: "success" });
    setLoading(false);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label={t.auth.emailLabel} error={errors.email?.message}>
        <input {...register("email")} type="email" className="w-full rounded-2xl border-ink-200 bg-white" />
      </Field>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (locale === "pl" ? "Wysylanie..." : "Sending...") : (locale === "pl" ? "Wyslij link resetu" : "Send reset link")}
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

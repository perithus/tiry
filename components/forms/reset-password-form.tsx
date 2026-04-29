"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/shared/button";
import { useToast } from "@/components/shared/toast-provider";
import type { Locale } from "@/lib/i18n/shared";
import { resetPasswordSchema } from "@/lib/validation/auth";

type FormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({ locale, token }: { locale: Locale; token: string }) {
  const { pushToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const payload = (await response.json()) as { error?: string; redirectTo?: string };
    if (!response.ok) {
      const message = payload.error ?? "Unable to reset your password.";
      setError(message);
      pushToast({ title: message, tone: "error" });
      setLoading(false);
      return;
    }

    pushToast({ title: locale === "pl" ? "Haslo zostalo zmienione." : "Password updated successfully.", tone: "success" });
    window.location.href = payload.redirectTo ?? "/sign-in";
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" value={token} {...register("token")} />
      <Field label={locale === "pl" ? "Nowe haslo" : "New password"} error={errors.password?.message}>
        <input {...register("password")} type="password" className="w-full rounded-2xl border-ink-200 bg-white" />
      </Field>
      <Field label={locale === "pl" ? "Powtorz haslo" : "Confirm password"} error={errors.confirmPassword?.message}>
        <input {...register("confirmPassword")} type="password" className="w-full rounded-2xl border-ink-200 bg-white" />
      </Field>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (locale === "pl" ? "Zapisywanie..." : "Saving...") : (locale === "pl" ? "Ustaw nowe haslo" : "Set new password")}
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

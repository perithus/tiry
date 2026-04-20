"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/shared";

export function SignOutButton({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);

    await fetch("/api/auth/sign-out", {
      method: "POST"
    });

    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-700 shadow-sm hover:border-ink-300 hover:text-ink-900 disabled:opacity-70"
    >
      <LogOut className="h-4 w-4" />
      {loading ? (locale === "pl" ? "Wylogowywanie..." : "Signing out...") : locale === "pl" ? "Wyloguj się" : "Sign out"}
    </button>
  );
}

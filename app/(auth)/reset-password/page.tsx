import Link from "next/link";
import { Logo } from "@/components/branding/logo";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { getLocale } from "@/lib/i18n/server";

export default async function ResetPasswordPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const locale = await getLocale();
  const { token } = await searchParams;

  return (
    <div className="container-shell flex min-h-screen items-center justify-center py-16">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-soft lg:grid-cols-2">
        <div className="bg-hero-glow p-10 text-white">
          <Logo className="text-white [&>span:last-child]:text-white" />
          <h1 className="font-display mt-10 text-4xl font-semibold tracking-tight">
            {locale === "pl" ? "Ustaw nowe haslo." : "Set a new password."}
          </h1>
          <p className="mt-5 text-sm leading-7 text-white/80">
            {locale === "pl"
              ? "Link jest jednorazowy i po zmianie hasla wszystkie aktywne sesje zostana wylogowane."
              : "This link is single-use and all active sessions will be signed out after the password change."}
          </p>
        </div>
        <div className="p-10">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink-900">
            {locale === "pl" ? "Reset hasla" : "Password reset"}
          </h2>
          {!token ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {locale === "pl"
                ? "Brakuje tokenu resetu. Popros o nowy link."
                : "The reset token is missing. Request a new link."}
            </div>
          ) : (
            <div className="mt-8">
              <ResetPasswordForm locale={locale} token={token} />
            </div>
          )}
          <p className="mt-6 text-sm text-ink-600">
            <Link href="/sign-in" className="font-medium text-teal-700 hover:text-teal-800">
              {locale === "pl" ? "Wroc do logowania" : "Back to sign in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

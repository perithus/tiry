import Link from "next/link";
import { Logo } from "@/components/branding/logo";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { getLocale } from "@/lib/i18n/server";

export default async function ForgotPasswordPage() {
  const locale = await getLocale();

  return (
    <div className="container-shell flex min-h-screen items-center justify-center py-16">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-soft lg:grid-cols-2">
        <div className="bg-hero-glow p-10 text-white">
          <Logo className="text-white [&>span:last-child]:text-white" />
          <h1 className="font-display mt-10 text-4xl font-semibold tracking-tight">
            {locale === "pl" ? "Reset hasla do platformy." : "Reset your platform password."}
          </h1>
          <p className="mt-5 text-sm leading-7 text-white/80">
            {locale === "pl"
              ? "Wyslemy jednorazowy link resetu na adres e-mail przypisany do konta."
              : "We will send a one-time reset link to the email address connected to your account."}
          </p>
        </div>
        <div className="p-10">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink-900">
            {locale === "pl" ? "Nie pamietasz hasla" : "Forgot password"}
          </h2>
          <p className="mt-2 text-sm text-ink-600">
            {locale === "pl"
              ? "Podaj e-mail, a przygotujemy bezpieczny link do ustawienia nowego hasla."
              : "Enter your email and we will prepare a secure link to set a new password."}
          </p>
          <div className="mt-8">
            <ForgotPasswordForm locale={locale} />
          </div>
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

import Link from "next/link";
import { Logo } from "@/components/branding/logo";
import { SignInForm } from "@/components/forms/sign-in-form";
import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";

export default async function SignInPage() {
  const locale = await getLocale();
  const t = getMessages(locale);

  return (
    <div className="container-shell flex min-h-screen items-center justify-center py-16">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-soft lg:grid-cols-2">
        <div className="bg-hero-glow p-10 text-white">
          <Logo className="text-white [&>span:last-child]:text-white" />
          <h1 className="font-display mt-10 text-4xl font-semibold tracking-tight">{t.auth.signInHero}</h1>
          <p className="mt-5 text-sm leading-7 text-white/80">
            {t.auth.signInDescription}
          </p>
        </div>
        <div className="p-10">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink-900">{t.auth.signInTitle}</h2>
          <p className="mt-2 text-sm text-ink-600">{t.auth.signInLead}</p>
          <div className="mt-8">
            <SignInForm locale={locale} />
          </div>
          <p className="mt-6 text-sm text-ink-600">
            {t.auth.noAccount}{" "}
            <Link href="/sign-up" className="font-medium text-teal-700 hover:text-teal-800">
              {t.auth.createOne}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";

export default async function ForgotPasswordPage() {
  const locale = await getLocale();
  const t = getMessages(locale);

  return (
    <div className="container-shell flex min-h-screen items-center justify-center py-16">
      <div className="w-full max-w-xl glass-panel p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">{t.auth.forgotPasswordTitle}</h1>
        <p className="mt-3 text-sm leading-7 text-ink-600">{t.auth.forgotPasswordBody}</p>
      </div>
    </div>
  );
}

import { env } from "@/lib/config/env";

export type TransactionalEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendTransactionalEmail(message: TransactionalEmail) {
  if (env.MAIL_PROVIDER === "log") {
    console.info("[mail:log]", {
      from: env.EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      text: message.text
    });
    return { ok: true as const, provider: "log" as const };
  }

  if (!env.MAIL_PROVIDER_API_KEY) {
    throw new Error("MAIL_PROVIDER_API_KEY is required for the configured mail provider.");
  }

  const response = await fetch(`${env.MAIL_PROVIDER_BASE_URL.replace(/\/+$/, "")}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.MAIL_PROVIDER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mail provider request failed: ${response.status} ${body}`);
  }

  return { ok: true as const, provider: env.MAIL_PROVIDER };
}

export function buildPasswordResetEmail(input: {
  locale: "en" | "pl";
  resetUrl: string;
  userName?: string | null;
}) {
  const greeting = input.userName ? `${input.userName},` : input.locale === "pl" ? "Czesc," : "Hello,";
  const subject = input.locale === "pl" ? "Reset hasla do TIY" : "Reset your TIY password";
  const intro =
    input.locale === "pl"
      ? "Otrzymalismy prosbe o reset hasla. Kliknij ponizszy link, aby ustawic nowe haslo."
      : "We received a request to reset your password. Click the link below to set a new one.";
  const outro =
    input.locale === "pl"
      ? "Jesli to nie Ty, zignoruj te wiadomosc. Link wygasnie automatycznie."
      : "If this was not you, you can ignore this email. The link will expire automatically.";
  const cta = input.locale === "pl" ? "Ustaw nowe haslo" : "Set a new password";

  return {
    subject,
    text: `${greeting}\n\n${intro}\n\n${input.resetUrl}\n\n${outro}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <p>${greeting}</p>
        <p>${intro}</p>
        <p style="margin:24px 0">
          <a href="${input.resetUrl}" style="display:inline-block;padding:12px 18px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:14px;font-weight:600">${cta}</a>
        </p>
        <p style="word-break:break-all;color:#475569">${input.resetUrl}</p>
        <p>${outro}</p>
      </div>
    `
  };
}

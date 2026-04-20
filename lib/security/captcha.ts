import { z } from "zod";

const captchaEnvSchema = z.object({
  CAPTCHA_PROVIDER: z.enum(["disabled", "turnstile"]).default("disabled"),
  CAPTCHA_SECRET_KEY: z.string().optional(),
  CAPTCHA_SITE_KEY: z.string().optional()
});

const captchaEnv = captchaEnvSchema.parse({
  CAPTCHA_PROVIDER: process.env.CAPTCHA_PROVIDER ?? "disabled",
  CAPTCHA_SECRET_KEY: process.env.CAPTCHA_SECRET_KEY,
  CAPTCHA_SITE_KEY: process.env.CAPTCHA_SITE_KEY
});

export function getCaptchaConfig() {
  return captchaEnv;
}

export async function verifyCaptcha(token?: string) {
  if (captchaEnv.CAPTCHA_PROVIDER === "disabled") {
    return true;
  }

  if (!token || !captchaEnv.CAPTCHA_SECRET_KEY) {
    throw new Error("Captcha verification is not configured.");
  }

  throw new Error("Captcha provider integration is enabled but not implemented yet.");
}

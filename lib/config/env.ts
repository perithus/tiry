import { z } from "zod";

function resolveAppUrl() {
  const explicitUrl = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (explicitUrl) {
    return explicitUrl;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  APP_URL: z.string().url(),
  APP_NAME: z.string().default("Truck Inventory Yard"),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters long."),
  EMAIL_FROM: z.string().email().default("hello@example.com"),
  MAIL_PROVIDER: z.enum(["log", "resend"]).default("log"),
  MAIL_PROVIDER_API_KEY: z.string().optional(),
  MAIL_PROVIDER_BASE_URL: z.string().url().default("https://api.resend.com"),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().positive().default(30),
  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().default(5),
  UPLOAD_ALLOWED_TYPES: z.string().default("image/jpeg,image/png,image/webp,application/pdf"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(60),
  SECURITY_ALLOWED_IMAGE_HOSTS: z.string().default(""),
  CAPTCHA_PROVIDER: z.string().default("disabled"),
  CAPTCHA_SITE_KEY: z.string().optional(),
  CAPTCHA_SECRET_KEY: z.string().optional()
});

const rawEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  APP_URL: resolveAppUrl(),
  APP_NAME: process.env.APP_NAME,
  SESSION_SECRET: process.env.SESSION_SECRET,
  EMAIL_FROM: process.env.EMAIL_FROM,
  MAIL_PROVIDER: process.env.MAIL_PROVIDER,
  MAIL_PROVIDER_API_KEY: process.env.MAIL_PROVIDER_API_KEY,
  MAIL_PROVIDER_BASE_URL: process.env.MAIL_PROVIDER_BASE_URL,
  PASSWORD_RESET_TTL_MINUTES: process.env.PASSWORD_RESET_TTL_MINUTES,
  UPLOAD_MAX_FILE_SIZE_MB: process.env.UPLOAD_MAX_FILE_SIZE_MB,
  UPLOAD_ALLOWED_TYPES: process.env.UPLOAD_ALLOWED_TYPES,
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
  SECURITY_ALLOWED_IMAGE_HOSTS: process.env.SECURITY_ALLOWED_IMAGE_HOSTS,
  CAPTCHA_PROVIDER: process.env.CAPTCHA_PROVIDER,
  CAPTCHA_SITE_KEY: process.env.CAPTCHA_SITE_KEY,
  CAPTCHA_SECRET_KEY: process.env.CAPTCHA_SECRET_KEY
};

const parsedEnv = envSchema.safeParse(rawEnv);

if (!parsedEnv.success) {
  const formattedIssues = parsedEnv.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n");

  throw new Error(`Invalid environment configuration:\n${formattedIssues}`);
}

export const env = parsedEnv.data;

import { env } from "@/lib/config/env";

function normalizeOrigin(origin: string) {
  return origin.replace(/\/+$/, "");
}

export function getClientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (!forwarded) {
    return "unknown";
  }

  return forwarded.split(",")[0]?.trim() || "unknown";
}

export function assertTrustedOrigin(request: Request) {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return;
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  const expectedOrigin = normalizeOrigin(env.APP_URL);

  if (origin) {
    if (normalizeOrigin(origin) !== expectedOrigin) {
      throw new Error("Untrusted request origin.");
    }
    return;
  }

  if (host && normalizeOrigin(`https://${host}`) === expectedOrigin) {
    return;
  }

  throw new Error("Missing trusted origin.");
}

export function buildSecurityHeaders() {
  const appUrl = new URL(env.APP_URL);
  const isHttps = appUrl.protocol === "https:";
  const connectSources = ["'self'"];

  if (process.env.NODE_ENV !== "production") {
    connectSources.push("ws:", "wss:");
  }

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== "production" ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSources.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    isHttps ? "upgrade-insecure-requests" : ""
  ]
    .filter(Boolean)
    .join("; ");

  return {
    "Content-Security-Policy": csp,
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    ...(isHttps ? { "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload" } : {})
  };
}

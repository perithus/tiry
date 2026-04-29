import { NextResponse } from "next/server";
import { LOCALE_COOKIE_NAME, pickLocale } from "@/lib/i18n/shared";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const locale = pickLocale(searchParams.get("locale"));
  const redirectTarget = searchParams.get("redirectTo") || "/";
  const redirectTo = redirectTarget.startsWith("/") ? redirectTarget : "/";

  const response = NextResponse.redirect(new URL(redirectTo, origin));
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365
  });

  return response;
}

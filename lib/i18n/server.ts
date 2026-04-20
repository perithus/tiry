import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, pickLocale, type Locale } from "@/lib/i18n/shared";

export async function getLocale(): Promise<Locale> {
  const locale = (await cookies()).get(LOCALE_COOKIE_NAME)?.value;
  return pickLocale(locale);
}

export const LOCALE_COOKIE_NAME = "tiy_locale";

export type Locale = "en" | "pl";

export function pickLocale(value: string | null | undefined): Locale {
  return value === "pl" ? "pl" : "en";
}

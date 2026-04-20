import type { Locale } from "@/lib/i18n/shared";
import { getMessages } from "@/lib/i18n/messages";

export function FilterBar({
  countries,
  pricingModels,
  locale
}: {
  countries: string[];
  pricingModels: string[];
  locale: Locale;
}) {
  const t = getMessages(locale);

  return (
    <form className="glass-panel grid gap-4 p-5 lg:grid-cols-4">
      <input
        name="search"
        placeholder={t.filters.searchPlaceholder}
        className="rounded-2xl border-ink-200 bg-white"
      />
      <select name="country" className="rounded-2xl border-ink-200 bg-white">
        <option value="">{t.filters.allCountries}</option>
        {countries.map((country) => (
          <option key={country} value={country}>
            {country}
          </option>
        ))}
      </select>
      <select name="routeScope" className="rounded-2xl border-ink-200 bg-white">
        <option value="">{t.filters.allRouteScopes}</option>
        <option value="DOMESTIC">{t.filters.domestic}</option>
        <option value="INTERNATIONAL">{t.filters.international}</option>
        <option value="MIXED">{t.filters.mixed}</option>
      </select>
      <select name="pricingModel" className="rounded-2xl border-ink-200 bg-white">
        <option value="">{t.filters.allPricingModels}</option>
        {pricingModels.map((model) => (
          <option key={model} value={model}>
            {model.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </form>
  );
}

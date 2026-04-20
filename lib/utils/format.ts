export function formatCurrency(amountInCents?: number | null, currency = "EUR") {
  if (amountInCents == null) {
    return "Custom quote";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amountInCents / 100);
}

export function formatNumber(value?: number | null) {
  if (value == null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-GB").format(value);
}

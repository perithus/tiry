import { cn } from "@/lib/utils/cn";

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const tones = {
    neutral: "bg-ink-100 text-ink-700",
    success: "bg-teal-100 text-teal-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-rose-100 text-rose-800"
  };

  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium", tones[tone])}>{label}</span>;
}

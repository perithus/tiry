import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3 font-semibold tracking-tight text-ink-900", className)}>
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink-900 text-sm font-bold text-white">
        TIY
      </span>
      <span className="font-display text-sm uppercase tracking-[0.24em] text-ink-700">Truck Inventory Yard</span>
    </Link>
  );
}

import Link from "next/link";
import { Logo } from "@/components/branding/logo";
import type { NavItem } from "@/lib/data/navigation";
import { cn } from "@/lib/utils/cn";

export function DashboardSidebar({
  title,
  nav
}: {
  title: string;
  nav: NavItem[];
}) {
  return (
    <aside className="glass-panel h-fit p-5">
      <Logo className="mb-8" />
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-ink-500">{title}</p>
      <nav className="space-y-2">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-ink-700 hover:bg-ink-50 hover:text-ink-900")}
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

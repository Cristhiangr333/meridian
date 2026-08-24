"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trades", label: "Registro" },
  { href: "/calendar", label: "Calendario" },
  { href: "/psychology", label: "Psicología" },
  { href: "/setups", label: "Setups" },
  { href: "/statistics", label: "Estadísticas" },
  { href: "/goals", label: "Objetivos" },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 mb-5 -mt-1 flex-wrap md:hidden">
      {TABS.map((tab) => {
        const active = pathname?.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`font-mono text-[12px] px-3.5 py-1.5 rounded-full transition ${
              active
                ? "bg-signal-soft text-signal"
                : "text-ink-2 hover:text-signal"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

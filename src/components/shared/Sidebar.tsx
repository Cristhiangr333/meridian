"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  NotebookPen,
  CalendarDays,
  Brain,
  Layers,
  BarChart3,
  Target,
  Sparkles,
  ChevronsLeft,
  ChevronsRight,
  type LucideIcon,
} from "lucide-react";

const STORAGE_KEY = "meridian:sidebar-collapsed";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  comingSoon?: boolean;
}

const DAILY_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trades", label: "Registro", icon: NotebookPen },
  { href: "/calendar", label: "Calendario", icon: CalendarDays },
  { href: "/psychology", label: "Psicología", icon: Brain },
];

// Módulos de reflexión periódica, no de uso diario: se consultan/editan
// cada tanto (al crear un setup nuevo, al revisar el mes, al fijar una meta),
// no en cada sesión de trading — por eso viven en su propio grupo.
const ANALYSIS_ITEMS: NavItem[] = [
  { href: "/setups", label: "Setups", icon: Layers },
  { href: "/statistics", label: "Estadísticas", icon: BarChart3 },
  { href: "/goals", label: "Objetivos", icon: Target },
];

// Módulos definidos en la hoja de ruta pero aún no construidos.
const UPCOMING_ITEMS: NavItem[] = [
  { href: "/coach", label: "AI Coach", icon: Sparkles, comingSoon: true },
];

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  const baseClasses = `group relative flex items-center gap-3 rounded-xl px-3 py-2 font-mono text-[12.5px] transition ${
    collapsed ? "justify-center px-0 w-10 mx-auto" : ""
  }`;

  if (item.comingSoon) {
    return (
      <div
        title={collapsed ? `${item.label} · Próximamente` : undefined}
        className={`${baseClasses} text-ink-3/70 cursor-not-allowed`}
      >
        <Icon size={17} strokeWidth={1.75} />
        {!collapsed && (
          <span className="flex items-center gap-2">
            {item.label}
            <span className="font-mono text-[8.5px] tracking-wider uppercase text-ink-3/60 border border-hairline-strong rounded-full px-1.5 py-0.5">
              Pronto
            </span>
          </span>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={`${baseClasses} ${
        active
          ? "bg-violet-soft text-violet"
          : "text-ink-2 hover:bg-hairline/50 hover:text-ink-1"
      }`}
    >
      <Icon size={17} strokeWidth={1.75} />
      {!collapsed && item.label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    setHydrated(true);
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside
      className={`hidden md:flex flex-col shrink-0 border-r border-hairline bg-surface/40 backdrop-blur-xl sticky top-0 h-screen transition-all ${
        hydrated ? "duration-200" : "duration-0"
      } ${collapsed ? "w-[72px]" : "w-60"}`}
    >
      <div
        className={`flex items-center gap-2.5 px-4 h-[68px] border-b border-hairline flex-shrink-0 ${
          collapsed ? "justify-center px-0" : ""
        }`}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-violet flex items-center justify-center flex-shrink-0">
          <span className="font-mono font-semibold text-xs text-void">M</span>
        </div>
        {!collapsed && (
          <span className="font-display text-[15px] font-semibold text-ink-1">
            Meridian
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div className="space-y-1">
          {!collapsed && (
            <p className="font-mono text-[9.5px] tracking-widest uppercase text-ink-3 px-3 mb-1.5">
              Diario
            </p>
          )}
          {DAILY_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              active={!!pathname?.startsWith(item.href)}
            />
          ))}
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="font-mono text-[9.5px] tracking-widest uppercase text-ink-3 px-3 mb-1.5">
              Análisis
            </p>
          )}
          {ANALYSIS_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              collapsed={collapsed}
              active={!!pathname?.startsWith(item.href)}
            />
          ))}
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="font-mono text-[9.5px] tracking-widest uppercase text-ink-3 px-3 mb-1.5">
              Próximamente
            </p>
          )}
          {UPCOMING_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} collapsed={collapsed} active={false} />
          ))}
        </div>
      </nav>

      <button
        onClick={toggle}
        className={`flex items-center gap-2 px-3 py-3 border-t border-hairline text-ink-3 hover:text-violet transition font-mono text-[11px] flex-shrink-0 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
        {!collapsed && "Colapsar"}
      </button>
    </aside>
  );
}

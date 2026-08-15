import Link from "next/link";
import type { Trade } from "@/lib/types";

export function AICoachCard({
  trades,
  latestInsight,
}: {
  trades: Trade[];
  latestInsight?: string;
}) {
  const closed = trades.filter((t) => t.pnl !== null);

  let message =
    "Registra tu primera operación para que el AI Coach empiece a encontrar patrones en tu trading.";

  if (latestInsight) {
    message = latestInsight;
  } else if (closed.length >= 5) {
    message = `Llevas ${closed.length} operaciones registradas. Ve a la pestaña Psicología para generar tu primer análisis del AI Coach.`;
  } else if (closed.length > 0) {
    message = `Ya registraste ${closed.length} operación${
      closed.length > 1 ? "es" : ""
    }. Con 5 o más, puedes generar tu primer análisis del AI Coach.`;
  }

  return (
    <div className="flex items-start justify-between gap-3 bg-gold-soft border border-gold/30 rounded-2xl px-4 py-3.5">
      <div className="flex items-start gap-3">
        <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
        <p className="font-body text-sm text-ink-1 leading-relaxed">{message}</p>
      </div>
      <Link
        href="/psychology"
        className="font-mono text-[11px] text-gold whitespace-nowrap hover:underline flex-shrink-0 mt-0.5"
      >
        AI Coach →
      </Link>
    </div>
  );
}

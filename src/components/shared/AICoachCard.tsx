import type { Trade } from "@/lib/types";

export function AICoachCard({ trades }: { trades: Trade[] }) {
  const closed = trades.filter((t) => t.pnl !== null);

  let message =
    "Registra tu primera operación para que el AI Coach empiece a encontrar patrones en tu trading.";

  if (closed.length >= 5) {
    const wins = closed.filter((t) => (t.pnl ?? 0) > 0).length;
    const wr = Math.round((wins / closed.length) * 100);
    message = `Llevas ${closed.length} operaciones registradas con ${wr}% de acierto. El AI Coach completo (patrones por hora, por setup y por estado psicológico) se activa en el Paso 7.`;
  } else if (closed.length > 0) {
    message = `Ya registraste ${closed.length} operación${
      closed.length > 1 ? "es" : ""
    }. Con 5 o más, el AI Coach empieza a mostrarte tendencias reales.`;
  }

  return (
    <div className="flex items-start gap-3 bg-gold-soft border border-gold/30 rounded-2xl px-4 py-3.5">
      <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
      <p className="font-body text-sm text-ink-1 leading-relaxed">{message}</p>
    </div>
  );
}

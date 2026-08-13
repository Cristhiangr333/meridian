import type { Trade } from "@/lib/types";

export function TradeLedger({ trades }: { trades: Trade[] }) {
  const closed = trades.filter((t) => t.pnl !== null);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekTrades = closed.filter((t) => new Date(t.opened_at) >= oneWeekAgo);
  const weekTotal = weekTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);

  const recent = [...closed]
    .sort(
      (a, b) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime()
    )
    .slice(0, 12);

  return (
    <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-5 md:p-6">
      <div className="flex items-end justify-between mb-4 pb-4 border-b border-hairline">
        <div>
          <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1">
            Resultado de la semana
          </p>
          <p
            className={`font-mono text-2xl font-semibold ${
              weekTotal >= 0 ? "text-gain" : "text-loss"
            }`}
          >
            {weekTotal >= 0 ? "+" : ""}${weekTotal.toFixed(0)}
          </p>
        </div>
        <p className="font-mono text-[11.5px] text-ink-3">
          {weekTrades.length} operaciones
        </p>
      </div>

      {recent.length === 0 ? (
        <p className="font-mono text-xs text-ink-3">
          Aún no hay operaciones registradas.
        </p>
      ) : (
        <div>
          {recent.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between py-3 border-b border-hairline last:border-b-0"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[11px] font-semibold flex-shrink-0 ${
                    t.direction === "long"
                      ? "bg-gain-soft text-gain"
                      : "bg-loss-soft text-loss"
                  }`}
                >
                  {t.direction === "long" ? "▲" : "▼"}
                </div>
                <div>
                  <p className="font-display text-[13.5px] font-medium text-ink-1">
                    {t.asset}
                  </p>
                  <p className="font-mono text-[10.5px] text-ink-3">
                    {new Date(t.opened_at).toLocaleDateString("es")}
                    {t.rr_planned ? ` · ${t.rr_planned}R` : ""}
                  </p>
                </div>
              </div>
              <p
                className={`font-mono text-sm font-semibold ${
                  (t.pnl ?? 0) >= 0 ? "text-gain" : "text-loss"
                }`}
              >
                {(t.pnl ?? 0) >= 0 ? "+" : ""}${t.pnl}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

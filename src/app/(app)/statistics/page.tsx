"use client";

import { useAccount } from "@/lib/hooks/useAccount";
import { useTrades } from "@/lib/hooks/useTrades";
import {
  computePerformanceByWeekday,
  computePerformanceByAsset,
  computePerformanceBySession,
  computeStreaks,
  computeRMultipleDistribution,
} from "@/lib/metrics";
import { PerformanceBreakdown } from "@/components/shared/PerformanceBreakdown";
import { StreakCard } from "@/components/shared/StreakCard";
import { RMultipleHistogram } from "@/components/shared/RMultipleHistogram";

export default function StatisticsPage() {
  const { data: account } = useAccount();
  const { data: trades = [], isLoading } = useTrades(account?.id);

  if (isLoading) {
    return (
      <p className="font-mono text-xs text-ink-3">Cargando tus estadísticas...</p>
    );
  }

  if (trades.filter((t) => t.status === "closed").length === 0) {
    return (
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-1 mb-4">
          Estadísticas avanzadas
        </h2>
        <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-8 text-center">
          <p className="font-mono text-xs text-ink-3">
            Registra operaciones cerradas para desbloquear tus estadísticas.
          </p>
        </div>
      </div>
    );
  }

  const byWeekday = computePerformanceByWeekday(trades);
  const byAsset = computePerformanceByAsset(trades);
  const bySession = computePerformanceBySession(trades);
  const streaks = computeStreaks(trades);
  const rMultiples = computeRMultipleDistribution(trades);

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-ink-1">
          Estadísticas avanzadas
        </h2>
        <p className="font-mono text-xs text-ink-3 mt-1">
          Dónde de verdad está tu ventaja
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <StreakCard streaks={streaks} />
        <RMultipleHistogram data={rMultiples} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <PerformanceBreakdown title="Por día de la semana" data={byWeekday} />
        <PerformanceBreakdown title="Por sesión de mercado" data={bySession} />
      </div>

      <PerformanceBreakdown title="Por activo" data={byAsset} />
    </div>
  );
}

"use client";

import { useAccount } from "@/lib/hooks/useAccount";
import { useTrades } from "@/lib/hooks/useTrades";
import { useInsights } from "@/lib/hooks/useInsights";
import { usePsychologyLogs } from "@/lib/hooks/usePsychologyLogs";
import { MetricCard } from "@/components/shared/MetricCard";
import { EdgeCard } from "@/components/shared/EdgeCard";
import { EquityCurve } from "@/components/shared/EquityCurve";
import { Heatmap } from "@/components/shared/Heatmap";
import { AICoachCard } from "@/components/shared/AICoachCard";
import { PsychologyCorrelation } from "@/components/shared/PsychologyCorrelation";
import {
  computeWinRate,
  computeExpectancy,
  computeProfitFactor,
  computeMaxDrawdown,
  computeEquitySeries,
  computeDailyPnl,
  computePsychologyCorrelation,
} from "@/lib/metrics";

export default function DashboardPage() {
  const { data: account } = useAccount();
  const { data: trades = [], isLoading } = useTrades(account?.id);
  const { data: insights = [] } = useInsights(1);
  const { data: psychologyLogs = [] } = usePsychologyLogs();

  const winRate = computeWinRate(trades);
  const expectancy = computeExpectancy(trades);
  const profitFactor = computeProfitFactor(trades);
  const maxDD = computeMaxDrawdown(trades);
  const equitySeries = computeEquitySeries(trades, account?.starting_balance ?? 0);
  const dailyPnl = computeDailyPnl(trades);
  const psychologyCorrelation = computePsychologyCorrelation(trades, psychologyLogs);

  if (isLoading) {
    return <p className="font-mono text-xs text-ink-3">Cargando tu dashboard...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-display text-xl font-semibold text-ink-1">
          Resumen general
        </h2>
        <p className="font-mono text-xs text-ink-3">
          {trades.length} operaciones registradas
        </p>
      </div>

      <EdgeCard />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <MetricCard
          label="Expectancy"
          value={`${expectancy >= 0 ? "+" : ""}$${expectancy}`}
          tone={expectancy >= 0 ? "up" : "down"}
        />
        <MetricCard
          label="Profit factor"
          value={profitFactor === Infinity ? "∞" : `${profitFactor}`}
        />
        <MetricCard label="Win rate" value={`${winRate}%`} />
        <MetricCard label="Max drawdown" value={`$${maxDD}`} tone="down" />
      </div>

      <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-4 md:p-5 mb-3">
        <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-2">
          Curva de equity
        </p>
        <EquityCurve series={equitySeries} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-4 md:p-5">
          <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-3">
            Últimos 35 días
          </p>
          <Heatmap dailyPnl={dailyPnl} />
        </div>
        <PsychologyCorrelation data={psychologyCorrelation} />
      </div>

      <AICoachCard trades={trades} latestInsight={insights[0]?.content} />
    </div>
  );
}

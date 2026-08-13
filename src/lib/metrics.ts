import type { Trade } from "@/lib/types";

function closedTrades(trades: Trade[]): Trade[] {
  return trades.filter((t) => t.pnl !== null);
}

export function computeWinRate(trades: Trade[]): number {
  const closed = closedTrades(trades);
  if (closed.length === 0) return 0;
  const wins = closed.filter((t) => (t.pnl ?? 0) > 0).length;
  return Math.round((wins / closed.length) * 100);
}

export function computeExpectancy(trades: Trade[]): number {
  const closed = closedTrades(trades);
  if (closed.length === 0) return 0;
  const total = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
  return Math.round((total / closed.length) * 100) / 100;
}

export function computeProfitFactor(trades: Trade[]): number {
  const closed = closedTrades(trades);
  const grossWin = closed
    .filter((t) => (t.pnl ?? 0) > 0)
    .reduce((s, t) => s + (t.pnl ?? 0), 0);
  const grossLoss = Math.abs(
    closed.filter((t) => (t.pnl ?? 0) < 0).reduce((s, t) => s + (t.pnl ?? 0), 0)
  );
  if (grossLoss === 0) return grossWin > 0 ? Infinity : 0;
  return Math.round((grossWin / grossLoss) * 100) / 100;
}

export function computeMaxDrawdown(trades: Trade[]): number {
  const closed = [...closedTrades(trades)].sort(
    (a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime()
  );
  let equity = 0;
  let peak = 0;
  let maxDD = 0;
  for (const t of closed) {
    equity += t.pnl ?? 0;
    peak = Math.max(peak, equity);
    maxDD = Math.min(maxDD, equity - peak);
  }
  return Math.round(maxDD * 100) / 100;
}

export interface EquityPoint {
  date: string;
  value: number;
}

export function computeEquitySeries(
  trades: Trade[],
  startingBalance: number
): EquityPoint[] {
  const closed = [...closedTrades(trades)].sort(
    (a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime()
  );
  let running = startingBalance;
  return closed.map((t) => {
    running += t.pnl ?? 0;
    return { date: t.opened_at, value: running };
  });
}

export function computeDailyPnl(trades: Trade[]): Map<string, number> {
  const map = new Map<string, number>();
  closedTrades(trades).forEach((t) => {
    const day = t.opened_at.slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + (t.pnl ?? 0));
  });
  return map;
}

/** % de días con al menos una operación que terminaron en positivo. */
export function computeConsistency(trades: Trade[]): number {
  const daily = computeDailyPnl(trades);
  const days = Array.from(daily.values());
  if (days.length === 0) return 0;
  const positiveDays = days.filter((v) => v > 0).length;
  return Math.round((positiveDays / days.length) * 100);
}

/** Promedio de confianza declarada al entrar, escalado a 0-100. */
export function computeDiscipline(trades: Trade[]): number {
  const withConfidence = trades.filter((t) => t.confidence !== null);
  if (withConfidence.length === 0) return 50;
  const avg =
    withConfidence.reduce((s, t) => s + (t.confidence ?? 0), 0) /
    withConfidence.length;
  return Math.round(avg * 10);
}

/** Composite: win rate + profit factor + consistencia + disciplina, ponderado. */
export function computeEdgeScore(trades: Trade[]): number {
  if (closedTrades(trades).length === 0) return 0;
  const winRate = computeWinRate(trades);
  const pf = computeProfitFactor(trades);
  const pfNorm = Math.min(100, (pf === Infinity ? 3 : pf) * 33);
  const consistency = computeConsistency(trades);
  const discipline = computeDiscipline(trades);
  return Math.round(
    winRate * 0.3 + pfNorm * 0.3 + consistency * 0.2 + discipline * 0.2
  );
}

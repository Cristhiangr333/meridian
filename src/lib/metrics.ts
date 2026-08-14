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

export interface DayTrades {
  dateKey: string;
  dayNum: number;
  trades: Trade[];
  total: number | null;
}

/** Agrupa las operaciones de un mes por día calendario. */
export function computeMonthGrid(
  trades: Trade[],
  year: number,
  month: number
): DayTrades[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const byDay = new Map<string, Trade[]>();

  closedTrades(trades).forEach((t) => {
    const key = t.opened_at.slice(0, 10);
    const arr = byDay.get(key) ?? [];
    arr.push(t);
    byDay.set(key, arr);
  });

  const days: DayTrades[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      d
    ).padStart(2, "0")}`;
    const dayTrades = byDay.get(dateKey) ?? [];
    const total = dayTrades.length
      ? dayTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)
      : null;
    days.push({ dateKey, dayNum: d, trades: dayTrades, total });
  }
  return days;
}

export interface MonthSummary {
  total: number;
  winDays: number;
  bestDay: number | null;
  currentStreak: number;
}

/** Resumen del mes: resultado total, días ganadores, mejor día y racha. */
export function computeMonthSummary(days: DayTrades[]): MonthSummary {
  let total = 0;
  let winDays = 0;
  let bestDay: number | null = null;
  let streak = 0;
  let currentStreak = 0;

  days.forEach((d) => {
    if (d.total === null) return;
    total += d.total;
    if (d.total > 0) {
      winDays += 1;
      streak += 1;
      currentStreak = Math.max(currentStreak, streak);
    } else {
      streak = 0;
    }
    if (bestDay === null || d.total > bestDay) bestDay = d.total;
  });

  return { total, winDays, bestDay, currentStreak };
}

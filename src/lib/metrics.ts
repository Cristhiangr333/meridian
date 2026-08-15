import type { Trade, PsychologyLog } from "@/lib/types";

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

type PsychologyMetricKey = "sleep_hours" | "confidence" | "stress" | "focus" | "motivation";

export interface PsychologyCorrelationPoint {
  metric: PsychologyMetricKey;
  label: string;
  /** Coeficiente de correlación de Pearson entre la métrica y el PnL diario, de -1 a 1. */
  correlation: number;
  matchedDays: number;
  /** PnL promedio en los días con esta métrica en la mitad ALTA del rango observado. */
  avgPnlHigh: number;
  /** PnL promedio en los días con esta métrica en la mitad BAJA del rango observado. */
  avgPnlLow: number;
}

export interface PsychologyCorrelationResult {
  points: PsychologyCorrelationPoint[];
  strongest: PsychologyCorrelationPoint | null;
  /** Días con al menos un registro psicológico Y al menos una operación cerrada ese día. */
  sampleSize: number;
}

const PSYCHOLOGY_METRIC_LABELS: Record<PsychologyMetricKey, string> = {
  sleep_hours: "Horas de sueño",
  confidence: "Confianza",
  stress: "Estrés",
  focus: "Enfoque",
  motivation: "Motivación",
};

function pearsonCorrelation(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const meanX = xs.reduce((s, v) => s + v, 0) / n;
  const meanY = ys.reduce((s, v) => s + v, 0) / n;
  let numerator = 0;
  let denomX = 0;
  let denomY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    numerator += dx * dy;
    denomX += dx * dx;
    denomY += dy * dy;
  }
  const denom = Math.sqrt(denomX * denomY);
  if (denom === 0) return 0;
  return numerator / denom;
}

/**
 * Cruza el PnL diario real con el diario psicológico para descubrir qué
 * estados (sueño, confianza, estrés, enfoque, motivación) se correlacionan
 * con mejor o peor resultado. Es el corazón del principio "todo módulo se
 * integra con los demás": el Diario Psicológico deja de ser una isla de
 * datos y alimenta directamente al Dashboard Ejecutivo.
 *
 * Requiere un mínimo de 3 días con datos cruzados (trade + registro
 * psicológico el mismo día) para producir una lectura con algo de
 * significancia; por debajo de eso, devuelve `points: []`.
 */
export function computePsychologyCorrelation(
  trades: Trade[],
  psychologyLogs: PsychologyLog[]
): PsychologyCorrelationResult {
  const dailyPnl = computeDailyPnl(trades);
  const logsByDate = new Map(psychologyLogs.map((l) => [l.log_date, l]));

  const matchedDates = Array.from(dailyPnl.keys()).filter((date) =>
    logsByDate.has(date)
  );

  if (matchedDates.length < 3) {
    return { points: [], strongest: null, sampleSize: matchedDates.length };
  }

  const metricKeys: PsychologyMetricKey[] = [
    "sleep_hours",
    "confidence",
    "stress",
    "focus",
    "motivation",
  ];

  const points: PsychologyCorrelationPoint[] = [];

  metricKeys.forEach((key) => {
    const pairs = matchedDates
      .map((date) => ({
        value: logsByDate.get(date)?.[key],
        pnl: dailyPnl.get(date) ?? 0,
      }))
      .filter((p): p is { value: number; pnl: number } => typeof p.value === "number");

    if (pairs.length < 3) return;

    const sorted = [...pairs].sort((a, b) => a.value - b.value);
    const half = Math.max(1, Math.floor(sorted.length / 2));
    const lowHalf = sorted.slice(0, half);
    const highHalf = sorted.slice(sorted.length - half);
    const avg = (arr: { pnl: number }[]) =>
      Math.round((arr.reduce((s, p) => s + p.pnl, 0) / arr.length) * 100) / 100;

    points.push({
      metric: key,
      label: PSYCHOLOGY_METRIC_LABELS[key],
      correlation:
        Math.round(
          pearsonCorrelation(
            pairs.map((p) => p.value),
            pairs.map((p) => p.pnl)
          ) * 100
        ) / 100,
      matchedDays: pairs.length,
      avgPnlHigh: avg(highHalf),
      avgPnlLow: avg(lowHalf),
    });
  });

  const strongest =
    points.length === 0
      ? null
      : points.reduce((a, b) => (Math.abs(b.correlation) > Math.abs(a.correlation) ? b : a));

  return { points, strongest, sampleSize: matchedDates.length };
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

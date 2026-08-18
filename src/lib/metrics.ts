import type { Trade, PsychologyLog } from "@/lib/types";
import { toLocalDateKey } from "@/lib/utils";

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
  if (closed.length === 0) return [];

  // El primer punto es el balance inicial (sin movimiento todavía) para que
  // la curva arranque en un punto real y no ya adelantada por el primer
  // trade — así el gráfico refleja de verdad "de dónde a dónde" fue la cuenta.
  let running = startingBalance;
  const series: EquityPoint[] = [{ date: closed[0].opened_at, value: startingBalance }];
  closed.forEach((t) => {
    running += t.pnl ?? 0;
    series.push({ date: t.opened_at, value: running });
  });
  return series;
}

export function computeDailyPnl(trades: Trade[]): Map<string, number> {
  const map = new Map<string, number>();
  closedTrades(trades).forEach((t) => {
    const day = toLocalDateKey(t.opened_at);
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
    const key = toLocalDateKey(t.opened_at);
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

// ─────────────────────────────────────────────────────────────────────────
// Biblioteca de Setups
// ─────────────────────────────────────────────────────────────────────────

export interface SetupPerformance {
  setupId: string;
  name: string;
  description: string | null;
  totalTrades: number;
  winRate: number;
  expectancy: number;
  profitFactor: number;
  avgRR: number | null;
  netPnl: number;
}

/**
 * Rendimiento real por setup — la misma lógica que ya se usaba embebida
 * dentro de TradeForm (`setupStats`), ahora centralizada y con más
 * profundidad (expectancy, profit factor, RR promedio) para reutilizarse
 * en la Biblioteca de Setups y en cualquier otro lugar que la necesite.
 */
export function computeSetupPerformance(
  trades: Trade[],
  setups: { id: string; name: string; description: string | null }[]
): SetupPerformance[] {
  return setups.map((setup) => {
    const setupTrades = closedTrades(trades).filter((t) => t.setup_id === setup.id);
    const rrValues = setupTrades
      .map((t) => t.rr_realized ?? t.rr_planned)
      .filter((v): v is number => typeof v === "number");

    return {
      setupId: setup.id,
      name: setup.name,
      description: setup.description,
      totalTrades: setupTrades.length,
      winRate: computeWinRate(setupTrades),
      expectancy: computeExpectancy(setupTrades),
      profitFactor: computeProfitFactor(setupTrades),
      avgRR:
        rrValues.length === 0
          ? null
          : Math.round((rrValues.reduce((s, v) => s + v, 0) / rrValues.length) * 100) / 100,
      netPnl: Math.round(setupTrades.reduce((s, t) => s + (t.pnl ?? 0), 0) * 100) / 100,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Estadísticas Avanzadas
// ─────────────────────────────────────────────────────────────────────────

const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export interface BucketPerformance {
  label: string;
  totalTrades: number;
  winRate: number;
  netPnl: number;
  expectancy: number;
}

/** Rendimiento agrupado por día de la semana (en hora LOCAL del trader). */
export function computePerformanceByWeekday(trades: Trade[]): BucketPerformance[] {
  const buckets = new Map<number, Trade[]>();
  closedTrades(trades).forEach((t) => {
    const day = new Date(t.opened_at).getDay();
    buckets.set(day, [...(buckets.get(day) ?? []), t]);
  });

  return [1, 2, 3, 4, 5, 6, 0]
    .map((day) => {
      const dayTrades = buckets.get(day) ?? [];
      return {
        label: WEEKDAY_LABELS[day],
        totalTrades: dayTrades.length,
        winRate: computeWinRate(dayTrades),
        netPnl: Math.round(dayTrades.reduce((s, t) => s + (t.pnl ?? 0), 0) * 100) / 100,
        expectancy: computeExpectancy(dayTrades),
      };
    })
    .filter((b) => b.totalTrades > 0);
}

/** Rendimiento agrupado por activo operado. */
export function computePerformanceByAsset(trades: Trade[]): BucketPerformance[] {
  const buckets = new Map<string, Trade[]>();
  closedTrades(trades).forEach((t) => {
    buckets.set(t.asset, [...(buckets.get(t.asset) ?? []), t]);
  });

  return Array.from(buckets.entries())
    .map(([asset, assetTrades]) => ({
      label: asset,
      totalTrades: assetTrades.length,
      winRate: computeWinRate(assetTrades),
      netPnl: Math.round(assetTrades.reduce((s, t) => s + (t.pnl ?? 0), 0) * 100) / 100,
      expectancy: computeExpectancy(assetTrades),
    }))
    .sort((a, b) => b.netPnl - a.netPnl);
}

const SESSION_RANGES: { label: string; startUtc: number; endUtc: number }[] = [
  { label: "Sídney", startUtc: 21, endUtc: 6 },
  { label: "Tokio", startUtc: 0, endUtc: 9 },
  { label: "Londres", startUtc: 7, endUtc: 16 },
  { label: "Nueva York", startUtc: 12, endUtc: 21 },
];

function sessionForHourUtc(hourUtc: number): string {
  const matches = SESSION_RANGES.filter((s) =>
    s.startUtc < s.endUtc
      ? hourUtc >= s.startUtc && hourUtc < s.endUtc
      : hourUtc >= s.startUtc || hourUtc < s.endUtc
  );
  // Si hay solapamiento (dos sesiones activas a la vez, algo común en forex),
  // se prioriza la que tenga más volumen histórico de referencia.
  return matches[0]?.label ?? "Fuera de sesión";
}

/** Rendimiento agrupado por sesión de mercado (Sídney/Tokio/Londres/NY), en UTC real. */
export function computePerformanceBySession(trades: Trade[]): BucketPerformance[] {
  const buckets = new Map<string, Trade[]>();
  closedTrades(trades).forEach((t) => {
    const hourUtc = new Date(t.opened_at).getUTCHours();
    const session = sessionForHourUtc(hourUtc);
    buckets.set(session, [...(buckets.get(session) ?? []), t]);
  });

  return Array.from(buckets.entries())
    .map(([label, sessionTrades]) => ({
      label,
      totalTrades: sessionTrades.length,
      winRate: computeWinRate(sessionTrades),
      netPnl: Math.round(sessionTrades.reduce((s, t) => s + (t.pnl ?? 0), 0) * 100) / 100,
      expectancy: computeExpectancy(sessionTrades),
    }))
    .sort((a, b) => b.netPnl - a.netPnl);
}

export interface StreakStats {
  current: { type: "win" | "loss" | "none"; count: number };
  bestWinStreak: number;
  worstLossStreak: number;
}

/** Rachas ganadoras/perdedoras, ordenadas por fecha de apertura real. */
export function computeStreaks(trades: Trade[]): StreakStats {
  const sorted = [...closedTrades(trades)].sort(
    (a, b) => new Date(a.opened_at).getTime() - new Date(b.opened_at).getTime()
  );

  let bestWin = 0;
  let worstLoss = 0;
  let runningWin = 0;
  let runningLoss = 0;

  sorted.forEach((t) => {
    if ((t.pnl ?? 0) > 0) {
      runningWin += 1;
      runningLoss = 0;
    } else if ((t.pnl ?? 0) < 0) {
      runningLoss += 1;
      runningWin = 0;
    } else {
      runningWin = 0;
      runningLoss = 0;
    }
    bestWin = Math.max(bestWin, runningWin);
    worstLoss = Math.max(worstLoss, runningLoss);
  });

  let current: StreakStats["current"] = { type: "none", count: 0 };
  if (runningWin > 0) current = { type: "win", count: runningWin };
  else if (runningLoss > 0) current = { type: "loss", count: runningLoss };

  return { current, bestWinStreak: bestWin, worstLossStreak: worstLoss };
}

export interface RMultipleBucket {
  label: string;
  count: number;
}

/** Distribución de operaciones por múltiplo de R realizado, en baldes fijos. */
export function computeRMultipleDistribution(trades: Trade[]): RMultipleBucket[] {
  const ranges: { label: string; min: number; max: number }[] = [
    { label: "< -2R", min: -Infinity, max: -2 },
    { label: "-2R a -1R", min: -2, max: -1 },
    { label: "-1R a 0R", min: -1, max: 0 },
    { label: "0R a 1R", min: 0, max: 1 },
    { label: "1R a 2R", min: 1, max: 2 },
    { label: "2R a 3R", min: 2, max: 3 },
    { label: "> 3R", min: 3, max: Infinity },
  ];

  const values = closedTrades(trades)
    .map((t) => t.rr_realized)
    .filter((v): v is number => typeof v === "number");

  return ranges.map((r) => ({
    label: r.label,
    count: values.filter((v) => v > r.min && v <= r.max).length,
  }));
}

// ─────────────────────────────────────────────────────────────────────────
// Objetivos y Metas
// ─────────────────────────────────────────────────────────────────────────

export type GoalMetricKey =
  | "win_rate"
  | "expectancy"
  | "profit_factor"
  | "edge_score"
  | "discipline"
  | "consistency"
  | "net_pnl";

export const GOAL_METRIC_LABELS: Record<GoalMetricKey, string> = {
  win_rate: "Win rate (%)",
  expectancy: "Expectancy ($)",
  profit_factor: "Profit factor",
  edge_score: "Edge score",
  discipline: "Disciplina",
  consistency: "Consistencia (%)",
  net_pnl: "PnL neto ($)",
};

/**
 * Valor ACTUAL de una métrica de objetivo, calculado en vivo a partir de
 * las operaciones reales — nunca se guarda un valor cacheado en `goals`,
 * así nunca puede quedar desactualizado (principio: "el dato es un activo,
 * no un registro").
 */
export function computeGoalCurrentValue(metric: GoalMetricKey, trades: Trade[]): number {
  switch (metric) {
    case "win_rate":
      return computeWinRate(trades);
    case "expectancy":
      return computeExpectancy(trades);
    case "profit_factor": {
      const pf = computeProfitFactor(trades);
      return pf === Infinity ? 999 : pf;
    }
    case "edge_score":
      return computeEdgeScore(trades);
    case "discipline":
      return computeDiscipline(trades);
    case "consistency":
      return computeConsistency(trades);
    case "net_pnl":
      return Math.round(closedTrades(trades).reduce((s, t) => s + (t.pnl ?? 0), 0) * 100) / 100;
    default:
      return 0;
  }
}

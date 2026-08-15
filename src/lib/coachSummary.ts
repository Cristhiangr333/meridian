import type { Trade } from "@/lib/types";
import {
  computeWinRate,
  computeExpectancy,
  computeProfitFactor,
  computeMaxDrawdown,
} from "@/lib/metrics";

export interface PsychologyLog {
  id: string;
  log_date: string;
  sleep_hours: number | null;
  confidence: number | null;
  stress: number | null;
  focus: number | null;
  motivation: number | null;
  notes: string | null;
}

/** Arma el texto plano que se le envía a Claude como contexto del trader. */
export function buildCoachSummary(
  trades: Trade[],
  psychologyLogs: PsychologyLog[]
): string {
  const closed = trades.filter((t) => t.pnl !== null);
  if (closed.length === 0) {
    return "El usuario aún no ha registrado operaciones.";
  }

  const winRate = computeWinRate(trades);
  const expectancy = computeExpectancy(trades);
  const pf = computeProfitFactor(trades);
  const maxDD = computeMaxDrawdown(trades);

  const byDirection = new Map<string, { wins: number; total: number }>();
  closed.forEach((t) => {
    const cur = byDirection.get(t.direction) ?? { wins: 0, total: 0 };
    cur.total += 1;
    if ((t.pnl ?? 0) > 0) cur.wins += 1;
    byDirection.set(t.direction, cur);
  });

  const lines: string[] = [];
  lines.push(`Operaciones cerradas: ${closed.length}.`);
  lines.push(
    `Win rate: ${winRate}%. Expectancy: $${expectancy}. Profit factor: ${
      pf === Infinity ? "∞" : pf
    }. Max drawdown: $${maxDD}.`
  );

  byDirection.forEach((v, k) => {
    lines.push(
      `${k === "long" ? "Long" : "Short"}: ${v.total} operaciones, ${Math.round(
        (v.wins / v.total) * 100
      )}% de acierto.`
    );
  });

  if (psychologyLogs.length > 0) {
    const avg = (key: keyof PsychologyLog) => {
      const vals = psychologyLogs
        .map((l) => l[key])
        .filter((v): v is number => typeof v === "number");
      if (vals.length === 0) return null;
      return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
    };
    lines.push(
      `Estado psicológico reciente (${psychologyLogs.length} registros): sueño promedio ${
        avg("sleep_hours") ?? "N/D"
      }h, confianza ${avg("confidence") ?? "N/D"}/10, estrés ${
        avg("stress") ?? "N/D"
      }/10.`
    );
  } else {
    lines.push("Aún no hay registros en el diario psicológico.");
  }

  return lines.join("\n");
}

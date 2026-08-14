"use client";

import { useState, useMemo } from "react";
import type { Trade } from "@/lib/types";
import { computeMonthGrid, computeMonthSummary } from "@/lib/metrics";

const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function CalendarGrid({ trades }: { trades: Trade[] }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const days = useMemo(
    () => computeMonthGrid(trades, year, month),
    [trades, year, month]
  );
  const summary = useMemo(() => computeMonthSummary(days), [days]);

  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;

  function prevMonth() {
    setSelectedDay(null);
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    setSelectedDay(null);
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  const selected = selectedDay
    ? days.find((d) => d.dateKey === selectedDay)
    : null;
  const todayKey = now.toISOString().slice(0, 10);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          type="button"
          aria-label="Mes anterior"
          className="w-8 h-8 rounded-lg border border-hairline-strong flex items-center justify-center text-ink-2 hover:border-violet hover:text-violet transition"
        >
          ‹
        </button>
        <h3 className="font-display text-lg font-semibold text-ink-1">
          {MONTH_NAMES[month].charAt(0).toUpperCase() + MONTH_NAMES[month].slice(1)}{" "}
          {year}
        </h3>
        <button
          onClick={nextMonth}
          type="button"
          aria-label="Mes siguiente"
          className="w-8 h-8 rounded-lg border border-hairline-strong flex items-center justify-center text-ink-2 hover:border-violet hover:text-violet transition"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-4">
          <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
            Resultado del mes
          </p>
          <p
            className={`font-mono text-xl font-semibold ${
              summary.total >= 0 ? "text-gain" : "text-loss"
            }`}
          >
            {summary.total >= 0 ? "+" : ""}${summary.total.toFixed(0)}
          </p>
        </div>
        <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-4">
          <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
            Días ganadores
          </p>
          <p className="font-mono text-xl font-semibold text-ink-1">
            {summary.winDays}
          </p>
        </div>
        <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-4">
          <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
            Mejor día
          </p>
          <p className="font-mono text-xl font-semibold text-violet">
            {summary.bestDay !== null ? `+$${summary.bestDay.toFixed(0)}` : "—"}
          </p>
        </div>
        <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-4">
          <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
            Racha actual
          </p>
          <p className="font-mono text-xl font-semibold text-gold">
            {summary.currentStreak} {summary.currentStreak === 1 ? "día" : "días"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-1.5">
        {WEEKDAYS.map((w) => (
          <p key={w} className="font-mono text-[10px] text-ink-3 text-center">
            {w}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`b-${i}`} />
        ))}
        {days.map((d) => {
          const isToday = d.dateKey === todayKey;
          const isSelected = d.dateKey === selectedDay;
          let cls = "bg-surface border-hairline";
          if (d.total !== null && d.total > 0) cls = "bg-gain-soft border-gain/30";
          if (d.total !== null && d.total < 0) cls = "bg-loss-soft border-loss/30";

          return (
            <button
              key={d.dateKey}
              type="button"
              onClick={() => setSelectedDay(d.dateKey)}
              className={`h-16 md:h-20 rounded-lg border flex flex-col justify-between p-2 transition ${cls} ${
                isSelected ? "ring-2 ring-violet" : ""
              } ${isToday ? "border-violet border-[1.5px]" : ""}`}
            >
              <span className="font-mono text-[10px] text-ink-2 text-left">
                {d.dayNum}
              </span>
              {d.total !== null ? (
                <span
                  className={`font-mono text-[10px] font-medium text-right ${
                    d.total > 0 ? "text-gain" : "text-loss"
                  }`}
                >
                  {d.total > 0 ? "+" : ""}${Math.abs(d.total).toFixed(0)}
                </span>
              ) : (
                <span className="font-mono text-[9px] text-ink-3 text-right">—</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5 bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-4 md:p-5">
        {!selected || selected.trades.length === 0 ? (
          <p className="font-mono text-xs text-ink-3">
            {selected
              ? `Sin operaciones el ${selected.dayNum} de ${MONTH_NAMES[month]}.`
              : "Toca un día para ver el detalle de sus operaciones."}
          </p>
        ) : (
          <div>
            <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-3">
              Operaciones del {selected.dayNum} de {MONTH_NAMES[month]}
            </p>
            {selected.trades.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between py-2.5 border-t border-hairline first:border-t-0"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center font-mono text-[10px] font-semibold flex-shrink-0 ${
                      t.direction === "long"
                        ? "bg-gain-soft text-gain"
                        : "bg-loss-soft text-loss"
                    }`}
                  >
                    {t.direction === "long" ? "▲" : "▼"}
                  </div>
                  <p className="font-display text-[13px] text-ink-1">{t.asset}</p>
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
    </div>
  );
}

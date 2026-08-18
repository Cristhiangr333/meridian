"use client";

import { useState } from "react";
import { Trash2, CheckCircle2 } from "lucide-react";
import type { Goal } from "@/lib/types";
import { GOAL_METRIC_LABELS } from "@/lib/metrics";
import { toLocalDateKey } from "@/lib/utils";

export function GoalCard({
  goal,
  currentValue,
  onAchieve,
  onAbandon,
  onDelete,
}: {
  goal: Goal;
  currentValue: number;
  onAchieve: () => void;
  onAbandon: () => void;
  onDelete: () => void;
}) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const target = goal.target_value ?? 0;
  // Si la meta es exactamente 0 (ej. "volver a break-even" en un objetivo
  // de PnL neto), no hay un ratio currentValue/0 que tenga sentido — se
  // considera lograda apenas currentValue llega a 0 o más.
  const progressPct =
    target === 0
      ? currentValue >= 0
        ? 100
        : 0
      : Math.max(0, Math.min(100, (currentValue / target) * 100));
  const isDone = progressPct >= 100;

  const todayKey = toLocalDateKey(new Date());
  const isOverdue = !!goal.deadline && goal.deadline < todayKey && goal.status === "active";

  let daysLabel: string | null = null;
  if (goal.deadline && goal.status === "active") {
    const diffDays = Math.ceil(
      (new Date(goal.deadline + "T00:00:00").getTime() - new Date(todayKey + "T00:00:00").getTime()) /
        (1000 * 60 * 60 * 24)
    );
    daysLabel = diffDays >= 0 ? `${diffDays} días restantes` : `Venció hace ${Math.abs(diffDays)} días`;
  }

  return (
    <div
      className={`bg-surface-raised backdrop-blur-xl border rounded-2xl p-4 md:p-5 ${
        goal.status === "achieved"
          ? "border-gain/30"
          : isOverdue
          ? "border-loss/30"
          : "border-hairline"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-display text-[15px] font-semibold text-ink-1 leading-snug">
          {goal.title}
        </h3>
        <button
          onClick={() => (confirmingDelete ? onDelete() : setConfirmingDelete(true))}
          onBlur={() => setConfirmingDelete(false)}
          className={`transition p-1 flex-shrink-0 ${
            confirmingDelete ? "text-loss" : "text-ink-3 hover:text-loss"
          }`}
          title={confirmingDelete ? "Clic de nuevo para confirmar" : "Eliminar objetivo"}
        >
          <Trash2 size={14} strokeWidth={1.75} />
        </button>
      </div>

      <p className="font-mono text-[10.5px] text-ink-3 mb-3">
        {GOAL_METRIC_LABELS[goal.target_metric as keyof typeof GOAL_METRIC_LABELS] ??
          goal.target_metric}{" "}
        · meta {goal.target_value}
      </p>

      {goal.status === "active" && (
        <>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="font-mono text-lg font-semibold text-ink-1">
              {currentValue}
              <span className="text-ink-3 text-xs"> / {goal.target_value}</span>
            </span>
            <span
              className={`font-mono text-xs font-semibold ${
                isDone ? "text-gain" : "text-ink-2"
              }`}
            >
              {Math.round(progressPct)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-hairline overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all ${
                isDone ? "bg-gain" : isOverdue ? "bg-loss" : "bg-violet"
              }`}
              style={{ width: `${Math.max(progressPct, 2)}%` }}
            />
          </div>

          <div className="flex items-center justify-between">
            {daysLabel && (
              <p
                className={`font-mono text-[10.5px] ${
                  isOverdue ? "text-loss" : "text-ink-3"
                }`}
              >
                {daysLabel}
              </p>
            )}
            <div className="flex gap-2 ml-auto">
              {isDone && (
                <button
                  onClick={onAchieve}
                  className="flex items-center gap-1 font-mono text-[10.5px] text-gain hover:underline"
                >
                  <CheckCircle2 size={13} />
                  Marcar lograda
                </button>
              )}
              {isOverdue && (
                <button
                  onClick={onAbandon}
                  className="font-mono text-[10.5px] text-ink-3 hover:text-loss transition"
                >
                  Cerrar como no lograda
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {goal.status === "achieved" && (
        <p className="flex items-center gap-1.5 font-mono text-xs text-gain">
          <CheckCircle2 size={14} /> Lograda
        </p>
      )}
      {goal.status === "abandoned" && (
        <p className="font-mono text-xs text-ink-3">No lograda a tiempo — sigue intentando.</p>
      )}
    </div>
  );
}

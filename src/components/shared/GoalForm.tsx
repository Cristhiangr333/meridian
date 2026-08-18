"use client";

import { useState, type FormEvent } from "react";
import { GOAL_METRIC_LABELS, type GoalMetricKey } from "@/lib/metrics";
import { toLocalDateKey } from "@/lib/utils";
import type { GoalInput } from "@/lib/hooks/useGoalMutations";

const METRIC_KEYS = Object.keys(GOAL_METRIC_LABELS) as GoalMetricKey[];

export function GoalForm({
  submitting,
  onSubmit,
  onCancel,
}: {
  submitting: boolean;
  onSubmit: (input: GoalInput) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [metric, setMetric] = useState<GoalMetricKey>("win_rate");
  const [targetValue, setTargetValue] = useState("60");
  const [deadline, setDeadline] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = parseFloat(targetValue);
    if (!title.trim() || Number.isNaN(value)) return;
    onSubmit({
      title: title.trim(),
      target_metric: metric,
      target_value: value,
      deadline: deadline || null,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-raised backdrop-blur-xl border border-violet/30 rounded-2xl p-4 md:p-5 space-y-3"
    >
      <div>
        <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
          Título
        </label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Subir mi win rate este trimestre"
          className="w-full bg-surface border border-hairline-strong rounded-xl px-3.5 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
            Métrica
          </label>
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value as GoalMetricKey)}
            className="w-full bg-surface border border-hairline-strong rounded-xl px-3 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft"
          >
            {METRIC_KEYS.map((key) => (
              <option key={key} value={key}>
                {GOAL_METRIC_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
            Meta
          </label>
          <input
            type="number"
            step="0.01"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            className="w-full bg-surface border border-hairline-strong rounded-xl px-3.5 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft"
          />
        </div>
      </div>

      <div>
        <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
          Fecha límite (opcional)
        </label>
        <input
          type="date"
          value={deadline}
          min={toLocalDateKey(new Date())}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full bg-surface border border-hairline-strong rounded-xl px-3.5 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-xs text-ink-3 hover:text-ink-1 px-3 py-2 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="font-mono text-xs bg-violet text-white px-4 py-2 rounded-xl hover:bg-violet/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Guardando..." : "Crear objetivo"}
        </button>
      </div>
    </form>
  );
}

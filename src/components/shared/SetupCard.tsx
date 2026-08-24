"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { SetupPerformance } from "@/lib/metrics";
import { SetupForm } from "@/components/shared/SetupForm";

export function SetupCard({
  setup,
  onUpdate,
  onDelete,
  updating,
  deleting,
}: {
  setup: SetupPerformance;
  onUpdate: (name: string, description: string | null) => void;
  onDelete: () => void;
  updating: boolean;
  deleting: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (editing) {
    return (
      <SetupForm
        initialName={setup.name}
        initialDescription={setup.description ?? ""}
        submitting={updating}
        onCancel={() => setEditing(false)}
        onSubmit={(name, description) => {
          onUpdate(name, description);
          setEditing(false);
        }}
      />
    );
  }

  const hasData = setup.totalTrades > 0;
  const pfLabel = setup.profitFactor === Infinity ? "∞" : setup.profitFactor.toFixed(2);

  return (
    <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-4 md:p-5">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-display text-[15px] font-semibold text-ink-1 leading-snug">
          {setup.name}
        </h3>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="text-ink-3 hover:text-signal transition p-1"
            title="Editar setup"
          >
            <Pencil size={14} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => (confirmingDelete ? onDelete() : setConfirmingDelete(true))}
            onBlur={() => setConfirmingDelete(false)}
            disabled={deleting}
            className={`transition p-1 ${
              confirmingDelete ? "text-loss" : "text-ink-3 hover:text-loss"
            }`}
            title={confirmingDelete ? "Clic de nuevo para confirmar" : "Eliminar setup"}
          >
            <Trash2 size={14} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {setup.description && (
        <p className="font-body text-xs text-ink-2 leading-relaxed mb-4">
          {setup.description}
        </p>
      )}

      {!hasData ? (
        <p className="font-mono text-[11px] text-ink-3">
          Sin operaciones registradas todavía con este setup.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-hairline">
          <div>
            <p className="font-mono text-[9px] tracking-wider uppercase text-ink-3 mb-0.5">
              Operaciones
            </p>
            <p className="font-mono text-sm font-semibold text-ink-1">{setup.totalTrades}</p>
          </div>
          <div>
            <p className="font-mono text-[9px] tracking-wider uppercase text-ink-3 mb-0.5">
              Win rate
            </p>
            <p className="font-mono text-sm font-semibold text-ink-1">{setup.winRate}%</p>
          </div>
          <div>
            <p className="font-mono text-[9px] tracking-wider uppercase text-ink-3 mb-0.5">
              Profit factor
            </p>
            <p className="font-mono text-sm font-semibold text-ink-1">{pfLabel}</p>
          </div>
          <div>
            <p className="font-mono text-[9px] tracking-wider uppercase text-ink-3 mb-0.5">
              Expectancy
            </p>
            <p
              className={`font-mono text-sm font-semibold ${
                setup.expectancy >= 0 ? "text-gain" : "text-loss"
              }`}
            >
              {setup.expectancy >= 0 ? "+" : ""}
              {setup.expectancy}
            </p>
          </div>
          <div>
            <p className="font-mono text-[9px] tracking-wider uppercase text-ink-3 mb-0.5">
              RR promedio
            </p>
            <p className="font-mono text-sm font-semibold text-ink-1">
              {setup.avgRR ?? "—"}
            </p>
          </div>
          <div>
            <p className="font-mono text-[9px] tracking-wider uppercase text-ink-3 mb-0.5">
              PnL neto
            </p>
            <p
              className={`font-mono text-sm font-semibold ${
                setup.netPnl >= 0 ? "text-gain" : "text-loss"
              }`}
            >
              {setup.netPnl >= 0 ? "+" : ""}${setup.netPnl}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

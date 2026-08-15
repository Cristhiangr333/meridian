"use client";

import { useState } from "react";
import { useAccount } from "@/lib/hooks/useAccount";
import { useTrades } from "@/lib/hooks/useTrades";
import { usePsychologyLogs } from "@/lib/hooks/usePsychologyLogs";
import { useInsights } from "@/lib/hooks/useInsights";
import { useAICoach } from "@/lib/hooks/useAICoach";
import { buildCoachSummary } from "@/lib/coachSummary";

export function AICoachPanel() {
  const { data: account } = useAccount();
  const { data: trades = [] } = useTrades(account?.id);
  const { data: psychologyLogs = [] } = usePsychologyLogs();
  const { data: insights = [] } = useInsights(5);
  const aiCoach = useAICoach();
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setError(null);
    const summary = buildCoachSummary(trades, psychologyLogs);
    try {
      await aiCoach.mutateAsync(summary);
    } catch {
      setError(
        "No se pudo generar el análisis. Verifica que la Edge Function 'ai-coach' esté desplegada y tenga configurada la llave de Anthropic."
      );
    }
  }

  const closedCount = trades.filter((t) => t.pnl !== null).length;

  return (
    <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-5 md:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3">
          AI Coach
        </p>
        <button
          onClick={handleGenerate}
          disabled={aiCoach.isPending || closedCount === 0}
          className="bg-gradient-to-r from-violet to-[#8B3FA0] text-white font-mono text-xs font-semibold rounded-full px-4 py-2 disabled:opacity-50 transition"
        >
          {aiCoach.isPending ? "Analizando..." : "Generar análisis"}
        </button>
      </div>

      {closedCount === 0 && (
        <p className="font-mono text-xs text-ink-3">
          Registra al menos una operación para que el AI Coach tenga algo que
          analizar.
        </p>
      )}

      {error && (
        <div className="bg-loss-soft border border-loss/30 text-loss text-sm rounded-lg px-3 py-2 mb-3">
          {error}
        </div>
      )}

      {insights.length > 0 ? (
        <div className="space-y-3">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className="flex items-start gap-3 bg-gold-soft border border-gold/30 rounded-2xl px-4 py-3.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
              <div>
                <p className="font-body text-sm text-ink-1 leading-relaxed">
                  {ins.content}
                </p>
                <p className="font-mono text-[10px] text-ink-3 mt-1.5">
                  {new Date(ins.created_at).toLocaleString("es")}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        closedCount > 0 && (
          <p className="font-mono text-xs text-ink-3">
            Aún no has generado ningún análisis. Presiona &quot;Generar
            análisis&quot;.
          </p>
        )
      )}
    </div>
  );
}

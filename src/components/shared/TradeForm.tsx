"use client";

import { useState, useMemo, type FormEvent } from "react";
import { useSetups } from "@/lib/hooks/useSetups";
import { useTrades } from "@/lib/hooks/useTrades";
import { useCreateTrade } from "@/lib/hooks/useCreateTrade";
import type { TradeDirection } from "@/lib/types";

export function TradeForm({ accountId }: { accountId: string }) {
  const { data: setups = [] } = useSetups();
  const { data: trades = [] } = useTrades(accountId);
  const createTrade = useCreateTrade();

  const [asset, setAsset] = useState("EUR/USD");
  const [direction, setDirection] = useState<TradeDirection>("long");
  const [entry, setEntry] = useState("1.0850");
  const [stop, setStop] = useState("1.0810");
  const [target, setTarget] = useState("1.0950");
  const [pnl, setPnl] = useState("");
  const [confidence, setConfidence] = useState(7);
  const [setupId, setSetupId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);

  const rr = useMemo(() => {
    const e = parseFloat(entry);
    const s = parseFloat(stop);
    const t = parseFloat(target);
    if (isNaN(e) || isNaN(s) || isNaN(t)) return null;
    const risk = Math.abs(e - s);
    const reward = Math.abs(t - e);
    if (risk === 0) return null;
    return Math.round((reward / risk) * 100) / 100;
  }, [entry, stop, target]);

  const setupStats = useMemo(() => {
    const map = new Map<string, { wins: number; total: number }>();
    trades.forEach((t) => {
      if (!t.setup_id || t.pnl === null) return;
      const cur = map.get(t.setup_id) ?? { wins: 0, total: 0 };
      cur.total += 1;
      if (t.pnl > 0) cur.wins += 1;
      map.set(t.setup_id, cur);
    });
    return map;
  }, [trades]);

  const selectedSetup = setups.find((s) => s.id === setupId);
  const selectedStats = setupId ? setupStats.get(setupId) : undefined;
  const overallClosed = trades.filter((t) => t.pnl !== null);
  const overallWr = overallClosed.length
    ? Math.round(
        (overallClosed.filter((t) => (t.pnl ?? 0) > 0).length /
          overallClosed.length) *
          100
      )
    : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const pnlValue = parseFloat(pnl);
    if (isNaN(pnlValue)) return;

    await createTrade.mutateAsync({
      account_id: accountId,
      asset,
      direction,
      entry_price: parseFloat(entry),
      stop_price: stop ? parseFloat(stop) : null,
      target_price: target ? parseFloat(target) : null,
      rr_planned: rr,
      pnl: pnlValue,
      confidence,
      setup_id: setupId,
      notes: notes || null,
    });

    setSuccess(true);
    setPnl("");
    setNotes("");
    setTimeout(() => setSuccess(false), 2500);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-5 md:p-6"
    >
      <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-4">
        Nueva operación
      </p>

      {createTrade.isError && (
        <div className="bg-loss-soft border border-loss/30 text-loss text-sm rounded-lg px-3 py-2 mb-4">
          No se pudo guardar la operación. Intenta de nuevo.
        </div>
      )}
      {success && (
        <div className="bg-gain-soft border border-gain/30 text-gain text-sm rounded-lg px-3 py-2 mb-4">
          Operación guardada.
        </div>
      )}

      <div className="mb-4">
        <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
          Activo
        </label>
        <input
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
          className="w-full bg-surface border border-hairline-strong rounded-xl px-3.5 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft"
        />
      </div>

      <div className="mb-4">
        <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
          Dirección
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDirection("long")}
            className={`flex-1 py-2.5 rounded-xl border font-mono text-sm font-semibold transition ${
              direction === "long"
                ? "bg-gain-soft border-gain/40 text-gain"
                : "bg-surface border-hairline-strong text-ink-2"
            }`}
          >
            ▲ Long
          </button>
          <button
            type="button"
            onClick={() => setDirection("short")}
            className={`flex-1 py-2.5 rounded-xl border font-mono text-sm font-semibold transition ${
              direction === "short"
                ? "bg-loss-soft border-loss/40 text-loss"
                : "bg-surface border-hairline-strong text-ink-2"
            }`}
          >
            ▼ Short
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
            Entrada
          </label>
          <input
            type="number"
            step="0.0001"
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="w-full bg-surface border border-hairline-strong rounded-xl px-3 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft"
          />
        </div>
        <div>
          <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
            Stop loss
          </label>
          <input
            type="number"
            step="0.0001"
            value={stop}
            onChange={(e) => setStop(e.target.value)}
            className="w-full bg-surface border border-hairline-strong rounded-xl px-3 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft"
          />
        </div>
        <div>
          <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
            Take profit
          </label>
          <input
            type="number"
            step="0.0001"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-surface border border-hairline-strong rounded-xl px-3 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft"
          />
        </div>
      </div>

      <div
        className="rounded-2xl p-5 mb-4"
        style={{
          background:
            "linear-gradient(125deg, #241145, #4B1F82 45%, #8B3FA0 90%)",
        }}
      >
        <p className="font-mono text-[10.5px] tracking-wider uppercase text-white/60 mb-1">
          Ratio riesgo / beneficio
        </p>
        <p className="font-mono text-3xl font-semibold text-gold-card">
          {rr !== null ? `${rr}R` : "—"}
        </p>
      </div>

      <div className="mb-1.5">
        <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
          Setup
        </label>
        <div className="flex flex-wrap gap-2">
          {setups.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSetupId(s.id)}
              className={`px-3.5 py-2 rounded-full border font-mono text-xs transition ${
                setupId === s.id
                  ? "bg-violet-soft border-violet/40 text-violet"
                  : "bg-surface border-hairline-strong text-ink-2"
              }`}
            >
              {s.name}
            </button>
          ))}
          {setups.length === 0 && (
            <p className="font-mono text-xs text-ink-3">
              Aún no tienes setups guardados.
            </p>
          )}
        </div>
      </div>

      {selectedSetup && selectedStats && selectedStats.total >= 3 && (
        <div className="flex items-start gap-2.5 mt-3 mb-4 bg-gold-soft border border-gold/30 rounded-xl px-3.5 py-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />
          <p className="font-body text-[13px] text-ink-1 leading-snug">
            Este setup tiene{" "}
            <span className="font-semibold text-gold">
              {Math.round((selectedStats.wins / selectedStats.total) * 100)}%
            </span>{" "}
            de acierto en tu historial
            {overallWr !== null && (
              <>
                {" "}
                —{" "}
                {Math.round(
                  (selectedStats.wins / selectedStats.total) * 100
                ) >= overallWr
                  ? "por encima"
                  : "por debajo"}{" "}
                de tu promedio general de {overallWr}%
              </>
            )}
            .
          </p>
        </div>
      )}

      <div className="mb-4 mt-4">
        <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
          Resultado (P&amp;L)
        </label>
        <input
          type="number"
          step="0.01"
          required
          value={pnl}
          onChange={(e) => setPnl(e.target.value)}
          placeholder="Ej: 186 o -74"
          className="w-full bg-surface border border-hairline-strong rounded-xl px-3.5 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft"
        />
      </div>

      <div className="mb-4">
        <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
          Confianza al entrar — {confidence}/10
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={confidence}
          onChange={(e) => setConfidence(parseInt(e.target.value))}
          className="w-full accent-violet"
        />
      </div>

      <div className="mb-5">
        <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
          Notas
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="¿Qué viste en el gráfico? ¿Seguiste tu plan?"
          className="w-full bg-surface border border-hairline-strong rounded-xl px-3.5 py-2.5 font-body text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={createTrade.isPending}
        className="w-full bg-gradient-to-r from-violet to-[#8B3FA0] text-white font-display font-semibold text-sm rounded-xl py-3 shadow-[0_14px_30px_-12px_rgba(107,47,179,.5)] disabled:opacity-60 transition"
      >
        {createTrade.isPending ? "Guardando..." : "Guardar operación"}
      </button>
    </form>
  );
}

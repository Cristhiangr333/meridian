"use client";

import { useAccount } from "@/lib/hooks/useAccount";
import { useTrades } from "@/lib/hooks/useTrades";
import {
  computeEdgeScore,
  computeWinRate,
  computeExpectancy,
  computeConsistency,
  computeDiscipline,
} from "@/lib/metrics";

/**
 * La Línea Meridian — el instrumento de firma de la marca.
 *
 * Reemplaza la tarjeta metálica anterior (chip, número enmascarado,
 * gradiente violeta-oro). En su lugar: un arco graduado, como la escala
 * de un sextante, con el Edge Score plotteado como un punto luminoso.
 * No es decoración — es la misma lógica de "Dato → Evidencia → Contexto"
 * del resto del producto, aplicada a la métrica más importante del
 * trader: dónde está parado en este momento.
 */
export function EdgeCard() {
  const { data: account } = useAccount();
  const { data: trades = [] } = useTrades(account?.id);

  const hasData = trades.length > 0;
  const edgeScore = computeEdgeScore(trades);
  const winRate = computeWinRate(trades);
  const expectancy = computeExpectancy(trades);
  const consistency = computeConsistency(trades);
  const discipline = computeDiscipline(trades);

  // El arco va de x=60 (score 0) a x=840 (score 100), siguiendo la misma
  // curva cuadrática que se dibuja abajo. Interpolamos la posición del
  // punto a lo largo de esa curva según el score actual.
  const t = Math.max(0, Math.min(100, edgeScore)) / 100;
  const arcX = (p: number) => (1 - p) ** 2 * 60 + 2 * (1 - p) * p * 450 + p ** 2 * 840;
  const arcY = (p: number) => (1 - p) ** 2 * 170 + 2 * (1 - p) * p * 20 + p ** 2 * 170;
  const pointX = arcX(t);
  const pointY = arcY(t);

  return (
    <div className="relative overflow-hidden rounded-card border border-hairline bg-gradient-to-b from-surface-raised to-void p-6 md:p-8 pb-0 mb-5 w-full">
      <div className="flex items-start justify-between mb-2">
        <div className="font-mono text-[11px] tracking-[0.14em] uppercase text-ink-3">
          La Línea Meridian — Edge Score
        </div>
        <div className="text-right">
          <div
            className="font-display text-[40px] md:text-[44px] font-semibold leading-none text-signal"
            style={{ textShadow: "0 0 24px rgba(125,211,252,.45)" }}
          >
            {hasData ? edgeScore : "—"}
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="py-10 text-center">
          <p className="font-mono text-xs text-ink-3">
            Aún no hay operaciones registradas. La Línea Meridian se activa
            con tu primera operación cerrada.
          </p>
        </div>
      ) : (
        <svg viewBox="0 0 900 220" width="100%" height="auto" className="block">
          <path
            d="M 60 170 Q 450 20 840 170"
            stroke="rgba(255,255,255,.10)"
            strokeWidth="1.5"
            fill="none"
          />
          <g stroke="rgba(255,255,255,.16)" strokeWidth="1">
            <line x1="60" y1="170" x2="60" y2="178" />
            <line x1="450" y1="36" x2="450" y2="44" />
            <line x1="840" y1="170" x2="840" y2="178" />
          </g>
          <g fontFamily="JetBrains Mono" fontSize="10" fill="rgba(255,255,255,.28)" textAnchor="middle">
            <text x="60" y="196">0</text>
            <text x="450" y="24">50</text>
            <text x="840" y="196">100</text>
          </g>

          <line
            x1={pointX}
            y1={pointY}
            x2={pointX}
            y2="170"
            stroke="rgba(125,211,252,.25)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <circle
            cx={pointX}
            cy={pointY}
            r="12"
            fill="none"
            stroke="#7DD3FC"
            strokeWidth="1"
            opacity="0.4"
            className="animate-pulse"
          />
          <circle
            cx={pointX}
            cy={pointY}
            r="5"
            fill="#7DD3FC"
            style={{ filter: "drop-shadow(0 0 6px #7DD3FC)" }}
          />
        </svg>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline border-t border-hairline mt-1 -mx-6 md:-mx-8">
        <Readout label="Win Rate" value={hasData ? `${winRate}%` : "—"} />
        <Readout
          label="Expectancy"
          value={hasData ? `${expectancy >= 0 ? "+" : ""}$${expectancy.toLocaleString("es")}` : "—"}
          tone={hasData ? (expectancy >= 0 ? "gain" : "loss") : "neutral"}
        />
        <Readout label="Consistencia" value={hasData ? `${consistency}%` : "—"} />
        <Readout
          label="Disciplina"
          value={hasData ? `${discipline}%` : "—"}
          tone={hasData && discipline >= 60 ? "gain" : "neutral"}
        />
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "gain" | "loss" | "neutral";
}) {
  const toneClass =
    tone === "gain" ? "text-gain" : tone === "loss" ? "text-loss" : "text-ink-1";
  return (
    <div className="bg-surface-raised px-4 md:px-5 py-3.5">
      <div className="font-mono text-[10px] tracking-wider uppercase text-ink-3 mb-1.5">
        {label}
      </div>
      <div className={`font-display text-lg font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

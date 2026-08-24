import Link from "next/link";
import type { PsychologyCorrelationResult } from "@/lib/metrics";

function readingFor(correlation: number, label: string): string {
  const abs = Math.abs(correlation);
  if (abs < 0.2) {
    return `Todavía no hay una relación clara entre ${label.toLowerCase()} y tu resultado — sigue registrando para afinar la lectura.`;
  }
  const direction = correlation > 0 ? "mejor" : "peor";
  return `Cuando tu ${label.toLowerCase()} es más alta, tu resultado tiende a ser ${direction}.`;
}

export function PsychologyCorrelation({
  data,
}: {
  data: PsychologyCorrelationResult;
}) {
  if (data.sampleSize < 3) {
    return (
      <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-4 md:p-5 h-full flex flex-col justify-center">
        <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-2">
          Correlación psicológica
        </p>
        <p className="font-mono text-xs text-ink-3 leading-relaxed">
          Registra al menos 3 días con operaciones cerradas Y diario
          psicológico completado ese mismo día para descubrir qué estados te
          hacen operar mejor o peor.{" "}
          <Link href="/psychology" className="text-signal hover:underline">
            Ir al Diario Psicológico →
          </Link>
        </p>
      </div>
    );
  }

  const { points, strongest } = data;

  return (
    <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-4 md:p-5">
      <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-3">
        Correlación psicológica
      </p>

      {strongest && (
        <p className="font-body text-sm text-ink-1 leading-relaxed mb-4">
          {readingFor(strongest.correlation, strongest.label)}
        </p>
      )}

      <div className="space-y-2.5">
        {points.map((p) => {
          const betterHigh = p.avgPnlHigh >= p.avgPnlLow;
          return (
            <div
              key={p.metric}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className="font-mono text-ink-2 flex-shrink-0">
                {p.label}
              </span>
              <span className="font-mono text-ink-3 text-[10.5px] flex-1 text-right">
                días altos{" "}
                <span className={betterHigh ? "text-gain" : "text-loss"}>
                  {p.avgPnlHigh >= 0 ? "+" : ""}
                  {p.avgPnlHigh}
                </span>
                {" · "}
                días bajos{" "}
                <span className={!betterHigh ? "text-gain" : "text-loss"}>
                  {p.avgPnlLow >= 0 ? "+" : ""}
                  {p.avgPnlLow}
                </span>
              </span>
              <span
                className={`font-mono text-[10.5px] w-12 text-right flex-shrink-0 ${
                  Math.abs(p.correlation) < 0.2
                    ? "text-ink-3"
                    : p.correlation > 0
                    ? "text-gain"
                    : "text-loss"
                }`}
              >
                {p.correlation >= 0 ? "+" : ""}
                {p.correlation}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

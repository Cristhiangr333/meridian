import type { BucketPerformance } from "@/lib/metrics";

export function PerformanceBreakdown({
  title,
  data,
}: {
  title: string;
  data: BucketPerformance[];
}) {
  if (data.length === 0) {
    return (
      <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-4 md:p-5">
        <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-3">
          {title}
        </p>
        <p className="font-mono text-xs text-ink-3">Aún no hay datos suficientes.</p>
      </div>
    );
  }

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.netPnl)), 1);

  return (
    <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-4 md:p-5">
      <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-3">
        {title}
      </p>
      <div className="space-y-2.5">
        {data.map((d) => {
          const widthPct = (Math.abs(d.netPnl) / maxAbs) * 100;
          const isGain = d.netPnl >= 0;
          return (
            <div key={d.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-ink-2">{d.label}</span>
                <span className="font-mono text-[10.5px] text-ink-3">
                  {d.totalTrades} op · {d.winRate}% win
                </span>
                <span
                  className={`font-mono text-xs font-semibold ${
                    isGain ? "text-gain" : "text-loss"
                  }`}
                >
                  {isGain ? "+" : ""}${d.netPnl}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-hairline overflow-hidden">
                <div
                  className={`h-full rounded-full ${isGain ? "bg-gain" : "bg-loss"}`}
                  style={{ width: `${Math.max(widthPct, 3)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

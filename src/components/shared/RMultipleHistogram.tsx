import type { RMultipleBucket } from "@/lib/metrics";

export function RMultipleHistogram({ data }: { data: RMultipleBucket[] }) {
  const total = data.reduce((s, b) => s + b.count, 0);
  const max = Math.max(...data.map((b) => b.count), 1);

  return (
    <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3">
          Distribución de R
        </p>
        <p className="font-mono text-[10.5px] text-ink-3">{total} operaciones con RR</p>
      </div>

      {total === 0 ? (
        <p className="font-mono text-xs text-ink-3">
          Registra el precio de stop y target en tus operaciones para ver esta
          distribución.
        </p>
      ) : (
        <div className="flex items-end gap-2 h-[120px]">
          {data.map((b) => {
            const isNegative = b.label.trim().startsWith("<") || b.label.includes("-");
            const heightPct = (b.count / max) * 100;
            return (
              <div key={b.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="font-mono text-[10px] text-ink-2">{b.count}</span>
                <div
                  className={`w-full rounded-t-md ${isNegative ? "bg-loss/70" : "bg-gain/70"}`}
                  style={{ height: `${Math.max(heightPct, b.count > 0 ? 6 : 0)}%` }}
                />
                <span className="font-mono text-[8.5px] text-ink-3 text-center leading-tight">
                  {b.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

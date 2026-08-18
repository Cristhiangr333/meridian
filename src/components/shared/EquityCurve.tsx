import type { EquityPoint } from "@/lib/metrics";

export function EquityCurve({ series }: { series: EquityPoint[] }) {
  if (series.length < 2) {
    return (
      <div className="h-[180px] flex items-center justify-center">
        <p className="font-mono text-xs text-ink-3 text-center px-4">
          Registra al menos una operación para ver tu curva de equity.
        </p>
      </div>
    );
  }

  const first = series[0].value;
  const last = series[series.length - 1].value;
  const change = last - first;
  const changePct = first !== 0 ? (change / first) * 100 : 0;
  const isUp = change >= 0;

  const w = 1000;
  const h = 200;
  const pad = 10;
  const values = series.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = series.map((p, i) => {
    const x = (i / (series.length - 1)) * w;
    const y = h - pad - ((p.value - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });

  const line = "M" + points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const strokeColor = isUp ? "#0E9F6E" : "#D1315C";

  return (
    <div>
      <div className="flex items-baseline gap-2.5 mb-2">
        <span className={`font-mono text-lg font-semibold ${isUp ? "text-gain" : "text-loss"}`}>
          {isUp ? "+" : ""}${change.toFixed(0)}
        </span>
        <span className={`font-mono text-[11px] ${isUp ? "text-gain" : "text-loss"}`}>
          ({isUp ? "+" : ""}
          {changePct.toFixed(1)}%)
        </span>
        <span className="font-mono text-[10.5px] text-ink-3">
          desde ${first.toLocaleString("es")}
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-[180px]">
        <defs>
          <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.22} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#equityGrad)" />
        <path
          d={line}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

import { toLocalDateKey } from "@/lib/utils";

export function Heatmap({ dailyPnl }: { dailyPnl: Map<string, number> }) {
  const days: { key: string; value: number | null }[] = [];
  const today = new Date();

  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = toLocalDateKey(d);
    days.push({ key, value: dailyPnl.has(key) ? dailyPnl.get(key)! : null });
  }

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d) => {
        let cls = "bg-surface border-hairline";
        if (d.value !== null && d.value > 0) cls = "bg-gain-soft border-gain/30";
        if (d.value !== null && d.value < 0) cls = "bg-loss-soft border-loss/30";
        const dayNum = parseInt(d.key.slice(8, 10), 10);

        return (
          <div
            key={d.key}
            title={d.value !== null ? `${d.key}: $${d.value.toFixed(0)}` : d.key}
            className={`h-9 md:h-10 rounded-md border ${cls} flex items-center justify-center`}
          >
            <span className="font-mono text-[10px] text-ink-3">{dayNum}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Heatmap({ dailyPnl }: { dailyPnl: Map<string, number> }) {
  const days: { key: string; value: number | null }[] = [];
  const today = new Date();

  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, value: dailyPnl.has(key) ? dailyPnl.get(key)! : null });
  }

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d) => {
        let cls = "bg-surface border-hairline";
        if (d.value !== null && d.value > 0) cls = "bg-gain-soft border-gain/30";
        if (d.value !== null && d.value < 0) cls = "bg-loss-soft border-loss/30";

        return (
          <div
            key={d.key}
            title={d.value !== null ? `${d.key}: $${d.value.toFixed(0)}` : d.key}
            className={`aspect-square rounded-md border ${cls}`}
          />
        );
      })}
    </div>
  );
}

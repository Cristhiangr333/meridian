export function MetricCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "up" | "down";
}) {
  const color =
    tone === "up" ? "text-gain" : tone === "down" ? "text-loss" : "text-ink-1";

  return (
    <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-4 md:p-5 shadow-[0_10px_28px_-16px_rgba(28,18,41,.12)]">
      <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-2">
        {label}
      </p>
      <p className={`font-mono text-2xl font-semibold ${color}`}>{value}</p>
      {sub && <p className="font-mono text-[11px] text-ink-3 mt-1.5">{sub}</p>}
    </div>
  );
}

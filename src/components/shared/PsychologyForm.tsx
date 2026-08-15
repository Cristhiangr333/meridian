import type { PsychologyLog } from "@/lib/coachSummary";

export function PsychologyHistory({ logs }: { logs: PsychologyLog[] }) {
  return (
    <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-5 md:p-6">
      <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-4">
        Historial reciente
      </p>
      {logs.length === 0 ? (
        <p className="font-mono text-xs text-ink-3">Aún no hay registros.</p>
      ) : (
        <div>
          {logs.slice(0, 10).map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between py-2.5 border-b border-hairline last:border-b-0"
            >
              <p className="font-mono text-xs text-ink-2">
                {new Date(l.log_date + "T00:00:00").toLocaleDateString("es")}
              </p>
              <div className="flex gap-3 font-mono text-[11px] text-ink-3">
                <span>😴 {l.sleep_hours ?? "—"}h</span>
                <span>💪 {l.confidence ?? "—"}/10</span>
                <span>⚡ {l.stress ?? "—"}/10</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

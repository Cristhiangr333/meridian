import type { PsychologyLog } from "@/lib/types";

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
              className="flex items-center justify-between py-2.5 border-b border-hairline last:border-b-0 gap-3 flex-wrap"
            >
              <p className="font-mono text-xs text-ink-2 flex-shrink-0">
                {new Date(l.log_date + "T00:00:00").toLocaleDateString("es")}
              </p>
              <div className="flex gap-2.5 font-mono text-[10.5px] text-ink-3 flex-wrap justify-end">
                <span>😴 {l.sleep_hours ?? "—"}h</span>
                <span>💪 {l.confidence ?? "—"}</span>
                <span>⚡ {l.stress ?? "—"}</span>
                <span>🎯 {l.focus ?? "—"}</span>
                <span>🔥 {l.motivation ?? "—"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

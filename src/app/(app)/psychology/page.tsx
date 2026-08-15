"use client";

import { usePsychologyLogs } from "@/lib/hooks/usePsychologyLogs";
import { PsychologyForm } from "@/components/shared/PsychologyForm";
import { PsychologyHistory } from "@/components/shared/PsychologyHistory";
import { AICoachPanel } from "@/components/shared/AICoachPanel";

export default function PsychologyPage() {
  const { data: logs = [] } = usePsychologyLogs();

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-ink-1">
          Diario psicológico
        </h2>
        <p className="font-mono text-xs text-ink-3 mt-1">
          Tu estado mental, correlacionado con tu rendimiento
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 items-start mb-4">
        <PsychologyForm />
        <PsychologyHistory logs={logs} />
      </div>

      <AICoachPanel />
    </div>
  );
}

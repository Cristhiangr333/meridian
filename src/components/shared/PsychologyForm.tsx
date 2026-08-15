"use client";

import { useState, type FormEvent } from "react";
import { useLogPsychology } from "@/lib/hooks/useLogPsychology";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function PsychologyForm() {
  const logPsychology = useLogPsychology();
  const [date, setDate] = useState(todayISO());
  const [sleep, setSleep] = useState("7");
  const [confidence, setConfidence] = useState(7);
  const [stress, setStress] = useState(4);
  const [focus, setFocus] = useState(7);
  const [motivation, setMotivation] = useState(7);
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await logPsychology.mutateAsync({
      log_date: date,
      sleep_hours: sleep ? parseFloat(sleep) : null,
      confidence,
      stress,
      focus,
      motivation,
      notes: notes || null,
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  }

  const sliders: {
    label: string;
    value: number;
    setValue: (v: number) => void;
  }[] = [
    { label: "Confianza", value: confidence, setValue: setConfidence },
    { label: "Estrés", value: stress, setValue: setStress },
    { label: "Enfoque", value: focus, setValue: setFocus },
    { label: "Motivación", value: motivation, setValue: setMotivation },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-5 md:p-6"
    >
      <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-4">
        Registro de hoy
      </p>

      {success && (
        <div className="bg-gain-soft border border-gain/30 text-gain text-sm rounded-lg px-3 py-2 mb-4">
          Registro guardado.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-surface border border-hairline-strong rounded-xl px-3.5 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft"
          />
        </div>
        <div>
          <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
            Horas de sueño
          </label>
          <input
            type="number"
            step="0.5"
            value={sleep}
            onChange={(e) => setSleep(e.target.value)}
            className="w-full bg-surface border border-hairline-strong rounded-xl px-3.5 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft"
          />
        </div>
      </div>

      {sliders.map((s) => (
        <div key={s.label} className="mb-4">
          <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
            {s.label} — {s.value}/10
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={s.value}
            onChange={(e) => s.setValue(parseInt(e.target.value))}
            className="w-full accent-violet"
          />
        </div>
      ))}

      <div className="mb-5">
        <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
          Notas
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="¿Cómo te sientes hoy respecto al mercado?"
          className="w-full bg-surface border border-hairline-strong rounded-xl px-3.5 py-2.5 font-body text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={logPsychology.isPending}
        className="w-full bg-gradient-to-r from-violet to-[#8B3FA0] text-white font-display font-semibold text-sm rounded-xl py-3 shadow-[0_14px_30px_-12px_rgba(107,47,179,.5)] disabled:opacity-60 transition"
      >
        {logPsychology.isPending ? "Guardando..." : "Guardar registro"}
      </button>
    </form>
  );
}

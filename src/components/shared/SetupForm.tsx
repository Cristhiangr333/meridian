"use client";

import { useState, type FormEvent } from "react";

export function SetupForm({
  initialName = "",
  initialDescription = "",
  submitting,
  onSubmit,
  onCancel,
}: {
  initialName?: string;
  initialDescription?: string;
  submitting: boolean;
  onSubmit: (name: string, description: string | null) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), description.trim() || null);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-raised backdrop-blur-xl border border-violet/30 rounded-2xl p-4 md:p-5 space-y-3"
    >
      <div>
        <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
          Nombre del setup
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Ruptura de rango"
          className="w-full bg-surface border border-hairline-strong rounded-xl px-3.5 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft"
        />
      </div>
      <div>
        <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
          Descripción (opcional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="¿Qué condiciones tienen que cumplirse para tomar este setup?"
          className="w-full bg-surface border border-hairline-strong rounded-xl px-3.5 py-2.5 font-mono text-sm text-ink-1 resize-none focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-xs text-ink-3 hover:text-ink-1 px-3 py-2 transition"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="font-mono text-xs bg-violet text-white px-4 py-2 rounded-xl hover:bg-violet/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Guardando..." : "Guardar setup"}
        </button>
      </div>
    </form>
  );
}

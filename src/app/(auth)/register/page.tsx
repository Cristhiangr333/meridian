"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="text-center space-y-3">
        <h2 className="font-display text-xl font-semibold text-ink-1">
          Revisa tu correo
        </h2>
        <p className="text-sm text-ink-2">
          Te enviamos un enlace de confirmación a{" "}
          <span className="font-medium text-ink-1">{email}</span>. Ábrelo
          para activar tu cuenta.
        </p>
        <Link
          href="/login"
          className="inline-block text-violet font-medium text-sm mt-2"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-1">
          Crea tu cuenta
        </h2>
        <p className="font-mono text-xs text-ink-3 mt-1">
          Empieza a construir tu edge
        </p>
      </div>

      {error && (
        <div className="bg-loss-soft border border-loss/30 text-loss text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
          Nombre
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface border border-hairline-strong rounded-xl px-3.5 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft"
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
          Correo
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface border border-hairline-strong rounded-xl px-3.5 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft"
          placeholder="tu@correo.com"
        />
      </div>

      <div>
        <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
          Contraseña
        </label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-surface border border-hairline-strong rounded-xl px-3.5 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-violet focus:ring-2 focus:ring-violet-soft"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-violet to-[#8B3FA0] text-white font-display font-semibold text-sm rounded-xl py-3 shadow-[0_14px_30px_-12px_rgba(107,47,179,.5)] disabled:opacity-60 transition"
      >
        {loading ? "Creando..." : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-ink-2">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-violet font-medium">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}

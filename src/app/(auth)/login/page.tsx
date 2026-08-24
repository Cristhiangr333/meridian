"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Correo o contraseña incorrectos."
          : error.message
      );
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-1">
          Inicia sesión
        </h2>
        <p className="font-mono text-xs text-ink-3 mt-1">
          Accede a tu cuenta de trading
        </p>
      </div>

      {error && (
        <div className="bg-loss-soft border border-loss/30 text-loss text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label className="block font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-1.5">
          Correo
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface border border-hairline-strong rounded-xl px-3.5 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-signal focus:ring-2 focus:ring-signal-soft"
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-surface border border-hairline-strong rounded-xl px-3.5 py-2.5 font-mono text-sm text-ink-1 focus:outline-none focus:border-signal focus:ring-2 focus:ring-signal-soft"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-signal text-[#06141F] font-display font-semibold text-sm rounded-xl py-3 shadow-[0_14px_30px_-12px_rgba(125,211,252,.35)] disabled:opacity-60 transition"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center text-sm text-ink-2">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="text-signal font-medium">
          Regístrate
        </Link>
      </p>
    </form>
  );
}

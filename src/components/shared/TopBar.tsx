"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/lib/hooks/useProfile";
import { getNySessionStatus } from "@/lib/marketSession";

export function TopBar() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const [clock, setClock] = useState("--:--:--");
  const [session, setSession] = useState(() => getNySessionStatus());

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toTimeString().slice(0, 8));
      setSession(getNySessionStatus(now));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between pb-5 mb-5 border-b border-hairline flex-wrap gap-4">
      <div className="flex items-center gap-3 md:hidden">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-violet flex items-center justify-center flex-shrink-0">
          <span className="font-mono font-semibold text-xs text-void">M</span>
        </div>
        <div>
          <h1 className="font-display text-[17px] font-semibold text-ink-1 leading-none">
            Meridian
          </h1>
          <p className="font-mono text-[9.5px] tracking-widest text-ink-3 uppercase mt-0.5">
            {profile?.display_name ?? "Cargando..."}
          </p>
        </div>
      </div>

      <p className="hidden md:block font-mono text-[12px] text-ink-2">
        Hola, {profile?.display_name ?? "..."}
      </p>

      <div className="flex items-center gap-3 flex-wrap">
        <div
          className={`flex items-center gap-1.5 border font-mono text-[11px] px-3 py-1.5 rounded-full ${
            session.isOpen
              ? "bg-gain-soft border-gain/25 text-gain"
              : "bg-hairline/40 border-hairline-strong text-ink-3"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              session.isOpen ? "bg-gain animate-pulse" : "bg-ink-3"
            }`}
          />
          {session.label}
        </div>
        <div className="font-mono text-[13px] text-ink-2 min-w-[88px] text-right">
          {clock}
        </div>
        <button
          onClick={handleSignOut}
          className="font-mono text-[11.5px] text-ink-2 border border-hairline-strong px-3 py-1.5 rounded-full hover:border-violet hover:text-violet transition"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

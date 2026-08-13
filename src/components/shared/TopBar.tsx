"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/lib/hooks/useProfile";

export function TopBar() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const [clock, setClock] = useState("--:--:--");

  useEffect(() => {
    const tick = () => setClock(new Date().toTimeString().slice(0, 8));
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
      <div className="flex items-center gap-3">
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

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-gain-soft border border-gain/25 text-gain font-mono text-[11px] px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse" />
          Sesión NY abierta
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

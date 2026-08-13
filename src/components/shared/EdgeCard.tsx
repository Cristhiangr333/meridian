"use client";

import { useRef } from "react";
import { useAccount } from "@/lib/hooks/useAccount";
import { useTrades } from "@/lib/hooks/useTrades";
import { computeEdgeScore } from "@/lib/metrics";

export function EdgeCard() {
  const { data: account, isLoading } = useAccount();
  const { data: trades = [] } = useTrades(account?.id);
  const edgeScore = computeEdgeScore(trades);
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * -7;
    const ry = (px - 0.5) * 9;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    card.style.setProperty("--mx", `${px * 100}%`);
    card.style.setProperty("--my", `${py * 100}%`);
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  }

  const last4 = account ? account.id.replace(/-/g, "").slice(-4) : "----";
  const balance = account ? account.current_balance : 0;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden rounded-2xl p-6 md:p-7 mb-5 transition-transform duration-150 ease-out"
      style={{
        background:
          "radial-gradient(circle at 15% 0%, rgba(232,200,120,.3), transparent 55%), linear-gradient(125deg, #241145 0%, #4B1F82 35%, #8B3FA0 65%, #C77DFF 100%)",
        boxShadow:
          "0 30px 60px -22px rgba(107,47,179,.4), 0 10px 24px -14px rgba(28,18,41,.18), inset 0 1px 0 rgba(255,255,255,.16)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none z-[1] mix-blend-overlay"
        style={{
          background:
            "radial-gradient(circle 260px at var(--mx,50%) var(--my,20%), rgba(255,255,255,.28), transparent 60%)",
        }}
      />

      <div className="relative z-[2] flex items-center justify-between mb-6 md:mb-7">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-white text-base">M</span>
          <span className="font-mono text-[11px] tracking-[0.22em] text-white/85">
            MERIDIAN
          </span>
        </div>
        <span className="font-tier italic text-gold-card text-sm">
          {account?.tier_label ?? "Obsidian"}
        </span>
      </div>

      <div
        className="w-10 h-[31px] rounded-md mb-5 md:mb-6"
        style={{ background: "linear-gradient(135deg,#F3DFA0,#B8934E)" }}
      />

      <div className="relative z-[2] font-mono text-white/90 text-lg tracking-[0.14em] mb-6">
        •••• •••• •••• {last4}
      </div>

      <div className="relative z-[2] flex gap-8 flex-wrap">
        <div>
          <div className="font-mono text-[9.5px] tracking-wider text-white/50 uppercase mb-1">
            Titular
          </div>
          <div className="font-display text-sm text-white">
            {account?.is_funded ? "Cuenta fondeada" : account?.name ?? "Sin cuenta"}
          </div>
        </div>
        <div>
          <div className="font-mono text-[9.5px] tracking-wider text-white/50 uppercase mb-1">
            Edge score
          </div>
          <div className="font-mono text-lg font-semibold text-gold-card">
            {trades.length === 0 ? "—" : edgeScore}
          </div>
        </div>
        <div>
          <div className="font-mono text-[9.5px] tracking-wider text-white/50 uppercase mb-1">
            Balance
          </div>
          <div className="font-mono text-lg font-semibold text-gold-card">
            {isLoading ? "…" : `$${balance.toLocaleString("es")}`}
          </div>
        </div>
      </div>
    </div>
  );
}

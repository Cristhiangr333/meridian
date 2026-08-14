"use client";

import { useAccount } from "@/lib/hooks/useAccount";
import { useTrades } from "@/lib/hooks/useTrades";
import { CalendarGrid } from "@/components/shared/CalendarGrid";

export default function CalendarPage() {
  const { data: account } = useAccount();
  const { data: trades = [], isLoading } = useTrades(account?.id);

  if (isLoading) {
    return (
      <p className="font-mono text-xs text-ink-3">Cargando tu calendario...</p>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-ink-1">
          Calendario de trading
        </h2>
        <p className="font-mono text-xs text-ink-3 mt-1">Tu mes, día por día</p>
      </div>

      <CalendarGrid trades={trades} />
    </div>
  );
}

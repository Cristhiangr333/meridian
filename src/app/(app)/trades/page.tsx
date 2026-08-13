"use client";

import { useAccount } from "@/lib/hooks/useAccount";
import { useTrades } from "@/lib/hooks/useTrades";
import { TradeForm } from "@/components/shared/TradeForm";
import { TradeLedger } from "@/components/shared/TradeLedger";

export default function TradesPage() {
  const { data: account } = useAccount();
  const { data: trades = [] } = useTrades(account?.id);

  if (!account) {
    return (
      <p className="font-mono text-xs text-ink-3">Cargando tu cuenta...</p>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="font-display text-xl font-semibold text-ink-1">
          Registro de operaciones
        </h2>
        <p className="font-mono text-xs text-ink-3 mt-1">
          Captura inteligente · el sistema aprende de cada entrada
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 items-start">
        <TradeForm accountId={account.id} />
        <TradeLedger trades={trades} />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAccount } from "@/lib/hooks/useAccount";
import { useTrades } from "@/lib/hooks/useTrades";
import { useSetups } from "@/lib/hooks/useSetups";
import {
  useCreateSetup,
  useUpdateSetup,
  useDeleteSetup,
} from "@/lib/hooks/useSetupMutations";
import { computeSetupPerformance } from "@/lib/metrics";
import { SetupCard } from "@/components/shared/SetupCard";
import { SetupForm } from "@/components/shared/SetupForm";

export default function SetupsPage() {
  const { data: account } = useAccount();
  const { data: trades = [] } = useTrades(account?.id);
  const { data: setups = [], isLoading } = useSetups();

  const createSetup = useCreateSetup();
  const updateSetup = useUpdateSetup();
  const deleteSetup = useDeleteSetup();

  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return <p className="font-mono text-xs text-ink-3">Cargando tus setups...</p>;
  }

  const performance = computeSetupPerformance(trades, setups).sort(
    (a, b) => b.totalTrades - a.totalTrades
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-1">
            Biblioteca de Setups
          </h2>
          <p className="font-mono text-xs text-ink-3 mt-1">
            Tus estrategias, con su rendimiento real detrás
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 font-mono text-xs bg-signal text-[#06141F] px-3.5 py-2 rounded-xl hover:bg-signal/90 transition shadow-[0_0_20px_rgba(125,211,252,.25)]"
          >
            <Plus size={14} />
            Nuevo setup
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-4">
          <SetupForm
            submitting={createSetup.isPending}
            onCancel={() => setShowForm(false)}
            onSubmit={(name, description) =>
              createSetup.mutate(
                { name, description },
                { onSuccess: () => setShowForm(false) }
              )
            }
          />
        </div>
      )}

      {performance.length === 0 && !showForm ? (
        <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-8 text-center">
          <p className="font-mono text-xs text-ink-3">
            Todavía no tienes setups. Crea el primero para empezar a medir qué
            estrategias realmente te funcionan.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {performance.map((setup) => (
            <SetupCard
              key={setup.setupId}
              setup={setup}
              updating={updateSetup.isPending}
              deleting={deleteSetup.isPending}
              onUpdate={(name, description) =>
                updateSetup.mutate({ id: setup.setupId, name, description })
              }
              onDelete={() => deleteSetup.mutate(setup.setupId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

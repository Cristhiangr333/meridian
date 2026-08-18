"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAccount } from "@/lib/hooks/useAccount";
import { useTrades } from "@/lib/hooks/useTrades";
import { useGoals } from "@/lib/hooks/useGoals";
import {
  useCreateGoal,
  useUpdateGoalStatus,
  useDeleteGoal,
} from "@/lib/hooks/useGoalMutations";
import { computeGoalCurrentValue, type GoalMetricKey } from "@/lib/metrics";
import { GoalCard } from "@/components/shared/GoalCard";
import { GoalForm } from "@/components/shared/GoalForm";

export default function GoalsPage() {
  const { data: account } = useAccount();
  const { data: trades = [] } = useTrades(account?.id);
  const { data: goals = [], isLoading } = useGoals();

  const createGoal = useCreateGoal();
  const updateStatus = useUpdateGoalStatus();
  const deleteGoal = useDeleteGoal();

  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return <p className="font-mono text-xs text-ink-3">Cargando tus objetivos...</p>;
  }

  const active = goals.filter((g) => g.status === "active");
  const closed = goals.filter((g) => g.status !== "active");

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-1">
            Objetivos y metas
          </h2>
          <p className="font-mono text-xs text-ink-3 mt-1">
            Progreso calculado en vivo contra tus operaciones reales
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 font-mono text-xs bg-violet text-white px-3.5 py-2 rounded-xl hover:bg-violet/90 transition"
          >
            <Plus size={14} />
            Nuevo objetivo
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-4">
          <GoalForm
            submitting={createGoal.isPending}
            onCancel={() => setShowForm(false)}
            onSubmit={(input) =>
              createGoal.mutate(input, { onSuccess: () => setShowForm(false) })
            }
          />
        </div>
      )}

      {active.length === 0 && closed.length === 0 && !showForm ? (
        <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-8 text-center">
          <p className="font-mono text-xs text-ink-3">
            Sin objetivos todavía. Ponte una meta concreta — por ejemplo, subir
            tu win rate o tu edge score — y el progreso se calcula solo con
            cada operación que registres.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {active.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {active.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  currentValue={computeGoalCurrentValue(
                    goal.target_metric as GoalMetricKey,
                    trades
                  )}
                  onAchieve={() => updateStatus.mutate({ id: goal.id, status: "achieved" })}
                  onAbandon={() => updateStatus.mutate({ id: goal.id, status: "abandoned" })}
                  onDelete={() => deleteGoal.mutate(goal.id)}
                />
              ))}
            </div>
          )}

          {closed.length > 0 && (
            <div>
              <p className="font-mono text-[10.5px] tracking-widest uppercase text-ink-3 mb-2.5">
                Historial
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {closed.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    currentValue={computeGoalCurrentValue(
                      goal.target_metric as GoalMetricKey,
                      trades
                    )}
                    onAchieve={() => {}}
                    onAbandon={() => {}}
                    onDelete={() => deleteGoal.mutate(goal.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

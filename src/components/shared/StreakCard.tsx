import type { StreakStats } from "@/lib/metrics";

export function StreakCard({ streaks }: { streaks: StreakStats }) {
  const currentIsWin = streaks.current.type === "win";
  const currentIsLoss = streaks.current.type === "loss";

  return (
    <div className="bg-surface-raised backdrop-blur-xl border border-hairline rounded-2xl p-4 md:p-5">
      <p className="font-mono text-[10.5px] tracking-wider uppercase text-ink-3 mb-3">
        Rachas
      </p>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="font-mono text-[9px] tracking-wider uppercase text-ink-3 mb-1">
            Racha actual
          </p>
          <p
            className={`font-mono text-lg font-semibold ${
              currentIsWin ? "text-gain" : currentIsLoss ? "text-loss" : "text-ink-3"
            }`}
          >
            {streaks.current.count === 0 ? "—" : streaks.current.count}
            {currentIsWin && " 🔥"}
          </p>
          <p className="font-mono text-[9.5px] text-ink-3 mt-0.5">
            {currentIsWin ? "ganando" : currentIsLoss ? "perdiendo" : "sin datos"}
          </p>
        </div>
        <div>
          <p className="font-mono text-[9px] tracking-wider uppercase text-ink-3 mb-1">
            Mejor racha
          </p>
          <p className="font-mono text-lg font-semibold text-gain">
            {streaks.bestWinStreak}
          </p>
          <p className="font-mono text-[9.5px] text-ink-3 mt-0.5">ganadoras seguidas</p>
        </div>
        <div>
          <p className="font-mono text-[9px] tracking-wider uppercase text-ink-3 mb-1">
            Peor racha
          </p>
          <p className="font-mono text-lg font-semibold text-loss">
            {streaks.worstLossStreak}
          </p>
          <p className="font-mono text-[9.5px] text-ink-3 mt-0.5">perdedoras seguidas</p>
        </div>
      </div>
    </div>
  );
}

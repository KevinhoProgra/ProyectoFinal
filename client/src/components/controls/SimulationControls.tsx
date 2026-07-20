interface SimulationControlsProps {
  isRunning: boolean
  onToggle: () => void
  onStep: () => void
  onReset: () => void
}

export function SimulationControls({
  isRunning,
  onToggle,
  onStep,
  onReset,
}: SimulationControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
          isRunning
            ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40 hover:bg-amber-500/30'
            : 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-500/30'
        }`}
      >
        {isRunning ? '⏸ Pausar' : '▶ Iniciar'}
      </button>
      <button
        type="button"
        onClick={onStep}
        disabled={isRunning}
        className="rounded-lg bg-slate-700/50 px-3 py-1.5 text-xs font-semibold text-slate-300 ring-1 ring-slate-600/40 transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ⏭ Paso
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg bg-slate-700/50 px-3 py-1.5 text-xs font-semibold text-slate-300 ring-1 ring-slate-600/40 transition-all hover:bg-rose-500/20 hover:text-rose-300 hover:ring-rose-500/40"
      >
        ↺ Reset
      </button>
    </div>
  )
}

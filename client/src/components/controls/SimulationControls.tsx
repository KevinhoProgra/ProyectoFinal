import type { SchedulerAlgorithm } from '../../types'

interface SimulationControlsProps {
  algorithm: SchedulerAlgorithm
  quantum: number
  isRunning: boolean
  onToggle: () => void
  onStep: () => void
  onReset: () => void
  onAlgorithmChange: (algorithm: SchedulerAlgorithm) => void
  onQuantumChange: (quantum: number) => void
  onDownloadLastReport?: () => void
}

const algorithmOptions: SchedulerAlgorithm[] = [
  'Round Robin',
  'FCFS',
  'SJF',
  'Prioridades',
]

export function SimulationControls({
  algorithm,
  quantum,
  isRunning,
  onToggle,
  onStep,
  onReset,
  onAlgorithmChange,
  onQuantumChange,
  onDownloadLastReport,
}: SimulationControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 px-2.5 py-1.5 ring-1 ring-slate-700/50">
        <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
          Algoritmo
        </label>
        <select
          value={algorithm}
          onChange={(event) => onAlgorithmChange(event.target.value as SchedulerAlgorithm)}
          className="rounded-md bg-slate-900 px-2 py-1 text-xs text-slate-200 outline-none ring-1 ring-slate-700"
        >
          {algorithmOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 px-2.5 py-1.5 ring-1 ring-slate-700/50">
        <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
          Quantum
        </label>
        <input
          type="number"
          min={1}
          max={10}
          value={quantum}
          onChange={(event) => onQuantumChange(Number(event.target.value) || 1)}
          className="w-16 rounded-md bg-slate-900 px-2 py-1 text-xs text-slate-200 outline-none ring-1 ring-slate-700"
        />
      </div>

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
      {onDownloadLastReport && (
        <button
          type="button"
          onClick={onDownloadLastReport}
          className="rounded-lg bg-slate-700/50 px-3 py-1.5 text-xs font-semibold text-slate-300 ring-1 ring-slate-600/40 transition-all hover:bg-cyan-500/20 hover:text-cyan-300 hover:ring-cyan-500/40"
          title="Descargar el último reporte de sesión guardado"
        >
          ⬇ Reporte
        </button>
      )}
    </div>
  )
}

import type { SystemStats } from '../../types'
import { formatStateLabel, getStateStyle } from '../../utils/processStyles'
import { ResourceBar } from './ResourceBar'

interface SystemMonitorProps {
  stats: SystemStats
}

export function SystemMonitor({ stats }: SystemMonitorProps) {
  const stateStyle = getStateStyle(stats.runningState)

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="space-y-4">
        <ResourceBar
          label="CPU"
          value={stats.cpuPercent}
          color="cyan"
          animated={stats.runningState === 'ejecutando'}
        />
        <ResourceBar
          label="RAM"
          value={stats.ramUsedGB}
          max={stats.ramTotalGB}
          unit="GB"
          color="violet"
        />
        <ResourceBar
          label="Disco"
          value={stats.diskPercent}
          color="amber"
        />
        <ResourceBar
          label="Swap"
          value={stats.swapUsedGB}
          max={stats.swapTotalGB}
          unit="GB"
          color="emerald"
          animated={stats.swapUsedGB > 0}
        />
      </div>

      <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-violet-300">
            Memoria virtual
          </h3>
          <span className="text-[10px] text-slate-500">Intercambio automático</span>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-slate-400">
          Cuando la RAM se llena, MiniOS mueve procesos inactivos al disco
          (swap) para liberar espacio. Al necesitarlos, los devuelve a RAM.
        </p>
        <div
          className={`mb-3 rounded-md border px-3 py-2 text-xs ${
            stats.memoryEvent
              ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200'
              : 'border-slate-700/40 bg-slate-900/30 text-slate-500'
          }`}
        >
          {stats.memoryEvent ?? 'Sin intercambios en el último tick'}
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Swap in</p>
            <p className="font-mono text-lg font-bold text-cyan-300">{stats.swapIns}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Swap out</p>
            <p className="font-mono text-lg font-bold text-violet-300">{stats.swapOuts}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700/50 bg-slate-800/40 p-4">
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Proceso en CPU
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Proceso</span>
            <span className="font-semibold text-white">
              {stats.runningProcess}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Estado</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${stateStyle.bg} ${stateStyle.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${stateStyle.dot}`} />
              {formatStateLabel(stats.runningState)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Algoritmo</span>
            <span className="font-mono text-sm text-cyan-400">
              {stats.algorithm}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Quantum</span>
            <span className="font-mono text-sm font-bold text-white">
              {stats.quantum}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Page Faults
          </p>
          <p className="font-mono text-xl font-bold text-amber-400">
            {stats.pageFaults}
          </p>
        </div>
        <div className="rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">
            Marco RAM
          </p>
          <p className="font-mono text-xl font-bold text-violet-400">
            {Math.round((stats.ramUsedGB / stats.ramTotalGB) * 256)}
            <span className="text-sm text-slate-500">/256</span>
          </p>
        </div>
      </div>
    </div>
  )
}

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

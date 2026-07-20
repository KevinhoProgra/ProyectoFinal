import type { Process } from '../../types'
import {
  formatStateLabel,
  getPriorityStyle,
  getStateStyle,
} from '../../utils/processStyles'

interface ProcessTableProps {
  processes: Process[]
}

export function ProcessTable({ processes }: ProcessTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-700/60 text-left">
            {[
              'PID',
              'Nombre',
              'Estado',
              'CPU',
              'RAM',
              'Disco',
              'Prioridad',
              'Páginas',
            ].map((col) => (
              <th
                key={col}
                className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {processes.map((process, index) => {
            const stateStyle = getStateStyle(process.state)
            const priorityStyle = getPriorityStyle(process.priority)
            const isRunning = process.state === 'ejecutando'

            return (
              <tr
                key={process.pid}
                className={`border-b border-slate-800/80 transition-colors hover:bg-slate-800/30 ${
                  isRunning ? 'bg-emerald-500/5' : index % 2 === 0 ? 'bg-slate-900/20' : ''
                }`}
              >
                <td className="px-4 py-3 font-mono text-cyan-400">
                  {process.pid}
                </td>
                <td className="px-4 py-3 font-medium text-white">
                  {process.name}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${stateStyle.bg} ${stateStyle.text}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${stateStyle.dot}`}
                    />
                    {formatStateLabel(process.state)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        style={{
                          width: `${Math.min(process.cpuPercent, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="font-mono text-xs text-slate-400">
                      {process.cpuPercent}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-300">
                  {process.ramMB} MB
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">
                  {process.diskIO}
                </td>
                <td className={`px-4 py-3 text-xs font-medium ${priorityStyle.color}`}>
                  {priorityStyle.label}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-violet-400">
                  {process.pages}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {processes.length === 0 && (
        <div className="py-12 text-center text-sm text-slate-500">
          No hay procesos activos. Lanza una app desde el escritorio.
        </div>
      )}
    </div>
  )
}

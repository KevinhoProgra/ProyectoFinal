interface HeaderProps {
  isRunning: boolean
  tick: number
}

export function Header({ isRunning, tick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-700/60 bg-slate-900/80 px-6 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-lg shadow-lg shadow-cyan-500/20">
          ⚙
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">
            MiniOS Simulator
          </h1>
          <p className="text-xs text-slate-400">
            Simulador de sistema operativo — Paginación &amp; Round Robin
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-800/60 px-3 py-1.5">
          <span
            className={`h-2 w-2 rounded-full ${isRunning ? 'animate-blink bg-emerald-400' : 'bg-slate-500'}`}
          />
          <span className="text-xs font-medium text-slate-300">
            {isRunning ? 'Simulación activa' : 'Simulación pausada'}
          </span>
        </div>
        <div className="rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 font-mono text-xs text-cyan-400">
          Tick: {tick}
        </div>
      </div>
    </header>
  )
}

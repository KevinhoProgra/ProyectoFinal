import { useCallback, useState } from 'react'
import { SimulationControls } from './components/controls/SimulationControls'
import { DesktopPanel } from './components/Desktop/DesktopPanel'
import { Header } from './components/layout/Header'
import { Panel } from './components/layout/Panel'
import { SystemMonitor } from './components/Monitor/SystemMonitor'
import { ProcessTable } from './components/ProcessTable/ProcessTable'
import {
  desktopApps,
  initialProcesses,
  initialSystemStats,
} from './data/mockData'
import type { DesktopApp, Process, SystemStats } from './types'

function App() {
  const [processes, setProcesses] = useState<Process[]>(initialProcesses)
  const [stats, setStats] = useState<SystemStats>(initialSystemStats)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const handleLaunchApp = useCallback(
    (app: DesktopApp) => {
      setSelectedAppId(app.id)
      showToast(
        `"${app.name}" — pendiente de conectar al backend (kernel Node.js)`,
      )
    },
    [showToast],
  )

  const handleToggle = useCallback(() => {
    setIsRunning((prev) => !prev)
    showToast(
      isRunning
        ? 'Simulación pausada (mock local — backend próximamente)'
        : 'Simulación iniciada (mock local — backend próximamente)',
    )
  }, [isRunning, showToast])

  const handleStep = useCallback(() => {
    setStats((prev) => ({ ...prev, tick: prev.tick + 1 }))
    showToast(`Tick ${stats.tick + 1} — avance manual (mock local)`)
  }, [showToast, stats.tick])

  const handleReset = useCallback(() => {
    setProcesses(initialProcesses)
    setStats(initialSystemStats)
    setIsRunning(false)
    setSelectedAppId(null)
    showToast('Estado reiniciado a datos mock iniciales')
  }, [showToast])

  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-slate-950 via-[#0a0e17] to-slate-950">
      <Header isRunning={isRunning} tick={stats.tick} />

      <main className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title="Escritorio" className="min-h-[280px]">
            <DesktopPanel
              apps={desktopApps}
              selectedAppId={selectedAppId}
              onLaunchApp={handleLaunchApp}
            />
          </Panel>

          <Panel
            title="Monitor del Sistema"
            action={
              <SimulationControls
                isRunning={isRunning}
                onToggle={handleToggle}
                onStep={handleStep}
                onReset={handleReset}
              />
            }
          >
            <SystemMonitor stats={stats} />
          </Panel>
        </div>

        <Panel
          title="Tabla de Procesos"
          className="max-h-[280px] shrink-0"
          action={
            <span className="font-mono text-[10px] text-slate-500">
              {processes.length} proceso{processes.length !== 1 ? 's' : ''}
            </span>
          }
        >
          <ProcessTable processes={processes} />
        </Panel>
      </main>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="rounded-xl border border-cyan-500/30 bg-slate-900/95 px-5 py-3 text-sm text-slate-200 shadow-2xl shadow-cyan-500/10 backdrop-blur-md">
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}

export default App

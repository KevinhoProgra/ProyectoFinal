import { useCallback, useEffect, useState } from 'react'
import { SimulationControls } from './components/controls/SimulationControls'
import { DesktopPanel } from './components/Desktop/DesktopPanel'
import { Header } from './components/layout/Header'
import { Panel } from './components/layout/Panel'
import { SystemMonitor } from './components/Monitor/SystemMonitor'
import { ProcessTable } from './components/ProcessTable/ProcessTable'
import { desktopApps, initialSystemStats } from './data/mockData'
import type { DesktopApp, Process, SchedulerAlgorithm, SystemStats } from './types'

const SERVER_URL = 'http://127.0.0.1:3000'

function App() {
  const [processes, setProcesses] = useState<Process[]>([])
  const [stats, setStats] = useState<SystemStats>(initialSystemStats)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [algorithm, setAlgorithm] = useState<SchedulerAlgorithm>('Round Robin')
  const [quantum, setQuantum] = useState(3)

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2500)
  }, [])

  const syncState = useCallback(async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/state`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const payload = (await response.json()) as {
        state: {
          processes: Process[]
          stats: SystemStats
          algorithm: SchedulerAlgorithm
          quantum: number
          isRunning: boolean
        }
      }

      setProcesses(payload.state.processes)
      setStats(payload.state.stats)
      setAlgorithm(payload.state.algorithm)
      setQuantum(payload.state.quantum)
      setIsRunning(payload.state.isRunning)
    } catch (error) {
      console.error('No pude sincronizar con el kernel del servidor', error)
      showToast('Kernel del servidor no disponible')
    }
  }, [showToast])

  useEffect(() => {
    void syncState()

    const intervalId = window.setInterval(() => {
      void syncState()
    }, 900)

    return () => window.clearInterval(intervalId)
  }, [syncState])

  const handleLaunchApp = useCallback(
    async (app: DesktopApp) => {
      try {
        const response = await fetch(`${SERVER_URL}/api/apps/open`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ appId: app.id }),
        })

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string }
          throw new Error(payload.error ?? `HTTP ${response.status}`)
        }

        setSelectedAppId(app.id)
        await syncState()
        showToast(`"${app.name}" abierto en el kernel del sistema`)
      } catch (error) {
        console.error('No pude lanzar la app en el backend', error)
        showToast(
          error instanceof Error && error.message.includes('ya está abierta')
            ? error.message
            : 'No se pudo abrir la aplicación',
        )
      }
    },
    [showToast, syncState],
  )

  const handleToggle = useCallback(async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/simulation/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRunning: !isRunning }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      await syncState()
      showToast(
        isRunning
          ? 'Simulación pausada por el kernel'
          : 'Simulación iniciada por el kernel',
      )
    } catch (error) {
      console.error('No pude alternar la simulación', error)
      showToast('No se pudo cambiar el estado del kernel')
    }
  }, [isRunning, showToast, syncState])

  const handleStep = useCallback(async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/simulation/step`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      await syncState()
      showToast(`Tick ejecutado con ${algorithm}`)
    } catch (error) {
      console.error('No pude ejecutar el paso manual', error)
      showToast('No se pudo ejecutar el paso')
    }
  }, [algorithm, showToast, syncState])

  const handleReset = useCallback(async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/simulation/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      setSelectedAppId(null)
      await syncState()
      showToast('Kernel reiniciado a estado inicial')
    } catch (error) {
      console.error('No pude reiniciar la simulación', error)
      showToast('No se pudo reiniciar')
    }
  }, [showToast, syncState])

  const handleAlgorithmChange = useCallback(
    async (nextAlgorithm: SchedulerAlgorithm) => {
      setAlgorithm(nextAlgorithm)

      try {
        const response = await fetch(`${SERVER_URL}/api/simulation/config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ algorithm: nextAlgorithm, quantum }),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        await syncState()
        showToast(`Algoritmo cambiado a ${nextAlgorithm}`)
      } catch (error) {
        console.error('No pude cambiar el algoritmo', error)
        showToast('No se pudo aplicar el algoritmo')
      }
    },
    [quantum, showToast, syncState],
  )

  const handleQuantumChange = useCallback(
    async (nextQuantum: number) => {
      const normalizedQuantum = Math.max(1, Math.min(10, nextQuantum))
      setQuantum(normalizedQuantum)

      try {
        const response = await fetch(`${SERVER_URL}/api/simulation/config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ algorithm, quantum: normalizedQuantum }),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        await syncState()
        showToast(`Quantum ajustado a ${normalizedQuantum}`)
      } catch (error) {
        console.error('No pude ajustar el quantum', error)
        showToast('No se pudo ajustar el quantum')
      }
    },
    [algorithm, showToast, syncState],
  )

  const handleTerminateProcess = useCallback(
    async (pid: number) => {
      try {
        const response = await fetch(`${SERVER_URL}/api/processes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'terminate', pid }),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        await syncState()
        showToast(`Proceso PID ${pid} marcado como terminado`)
      } catch (error) {
        console.error('No pude cerrar el proceso', error)
        showToast('No se pudo cerrar el proceso')
      }
    },
    [showToast, syncState],
  )

  const handleCleanupProcess = useCallback(
    async (pid: number) => {
      try {
        const response = await fetch(`${SERVER_URL}/api/processes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'cleanup', pid }),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        await syncState()
        showToast(`Proceso PID ${pid} limpiado de la tabla del kernel`)
      } catch (error) {
        console.error('No pude limpiar el proceso', error)
        showToast('No se pudo limpiar el proceso')
      }
    },
    [showToast, syncState],
  )

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
                algorithm={algorithm}
                quantum={quantum}
                isRunning={isRunning}
                onToggle={handleToggle}
                onStep={handleStep}
                onReset={handleReset}
                onAlgorithmChange={handleAlgorithmChange}
                onQuantumChange={handleQuantumChange}
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
          <ProcessTable
            processes={processes}
            onTerminateProcess={handleTerminateProcess}
            onCleanupProcess={handleCleanupProcess}
          />
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

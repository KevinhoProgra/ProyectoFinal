import http from 'node:http'

const PORT = Number(process.env.PORT || 3000)
const SERVER_NAME = 'MiniOS Kernel'

const PRIORITY_ORDER = {
  alta: 0,
  media: 1,
  baja: 2,
}

const APP_RESOURCE_PROFILE = {
  word: {
    ramMB: 180,
    diskIO: '6 MB/s',
    priority: 'media',
    pages: 40,
    burst: 14,
  },
  chrome: {
    ramMB: 600,
    diskIO: '10 MB/s',
    priority: 'alta',
    pages: 150,
    burst: 18,
  },
  spotify: {
    ramMB: 120,
    diskIO: '2 MB/s',
    priority: 'baja',
    pages: 24,
    burst: 10,
  },
  explorer: {
    ramMB: 220,
    diskIO: '8 MB/s',
    priority: 'media',
    pages: 56,
    burst: 12,
  },
  calculator: {
    ramMB: 80,
    diskIO: '1 MB/s',
    priority: 'baja',
    pages: 18,
    burst: 8,
  },
  terminal: {
    ramMB: 96,
    diskIO: '4 MB/s',
    priority: 'alta',
    pages: 22,
    burst: 9,
  },
  vscode: {
    ramMB: 340,
    diskIO: '7 MB/s',
    priority: 'alta',
    pages: 88,
    burst: 16,
  },
  paint: {
    ramMB: 150,
    diskIO: '3 MB/s',
    priority: 'media',
    pages: 38,
    burst: 11,
  },
  settings: {
    ramMB: 120,
    diskIO: '2 MB/s',
    priority: 'baja',
    pages: 20,
    burst: 7,
  },
}

const APP_DEFINITIONS = [
  {
    id: 'word',
    name: 'Word',
    icon: '📄',
    color: 'from-blue-600 to-blue-800',
    description: 'Procesador de texto',
  },
  {
    id: 'chrome',
    name: 'Chrome',
    icon: '🌐',
    color: 'from-emerald-500 to-teal-700',
    description: 'Navegador web',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: '🎵',
    color: 'from-green-500 to-green-800',
    description: 'Reproductor de música',
  },
  {
    id: 'explorer',
    name: 'Explorador',
    icon: '📁',
    color: 'from-amber-500 to-orange-700',
    description: 'Administrador de archivos',
  },
  {
    id: 'calculator',
    name: 'Calculadora',
    icon: '🧮',
    color: 'from-violet-500 to-purple-800',
    description: 'Calculadora del sistema',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '💻',
    color: 'from-slate-600 to-slate-900',
    description: 'Consola del sistema',
  },
  {
    id: 'vscode',
    name: 'VSCode',
    icon: '🧩',
    color: 'from-cyan-500 to-blue-900',
    description: 'Editor de código',
  },
  {
    id: 'paint',
    name: 'Paint',
    icon: '🎨',
    color: 'from-pink-500 to-rose-900',
    description: 'Editor gráfico básico',
  },
  {
    id: 'settings',
    name: 'Ajustes',
    icon: '⚙️',
    color: 'from-indigo-500 to-violet-900',
    description: 'Configuración del sistema',
  },
]

const persistedState = {
  algorithm: 'Round Robin',
  quantum: 3,
  isRunning: false,
  tick: 0,
  nextPid: 1,
  processes: [],
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function getDiskRate(diskIO) {
  const parsed = Number.parseFloat(diskIO)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildStats() {
  const activeProcesses = persistedState.processes.filter(
    (process) => process.state !== 'terminado',
  )
  const runningProcess = activeProcesses.find((process) => process.state === 'ejecutando')
  const totalRamMB = activeProcesses.reduce((sum, process) => sum + process.ramMB, 0)
  const diskPercent = clamp(
    Math.round(
      activeProcesses.reduce((sum, process) => sum + getDiskRate(process.diskIO), 0) * 2.5,
    ),
    0,
    100,
  )
  const cpuPercent = clamp(
    Math.round(
      activeProcesses.reduce((sum, process) => sum + Math.max(0, process.cpuPercent), 0) /
        Math.max(activeProcesses.length, 1),
    ),
    0,
    100,
  )

  return {
    cpuPercent,
    ramUsedGB: Number((totalRamMB / 1024).toFixed(2)),
    ramTotalGB: 4,
    diskPercent,
    runningProcess: runningProcess?.name ?? 'Ninguno',
    runningState: runningProcess?.state ?? 'listo',
    algorithm: persistedState.algorithm,
    quantum: persistedState.quantum,
    tick: persistedState.tick,
    pageFaults: activeProcesses.reduce(
      (sum, process) => sum + Math.floor(process.pages / 20),
      0,
    ),
  }
}

function chooseNextProcess() {
  const readyProcesses = persistedState.processes.filter((process) =>
    process.state === 'nuevo' || process.state === 'listo',
  )

  if (readyProcesses.length === 0) {
    return null
  }

  const sorted = [...readyProcesses].sort((left, right) => {
    if (persistedState.algorithm === 'SJF') {
      return left.remainingBurst - right.remainingBurst || left.arrivalOrder - right.arrivalOrder
    }

    if (persistedState.algorithm === 'Prioridades') {
      return (
        PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority] ||
        left.arrivalOrder - right.arrivalOrder
      )
    }

    return left.arrivalOrder - right.arrivalOrder
  })

  return sorted[0]
}

function releaseFromBlock() {
  persistedState.processes = persistedState.processes.map((process) => {
    if (process.state !== 'bloqueado') {
      return process
    }

    if (process.blockedTicks <= 1) {
      return {
        ...process,
        state: 'listo',
        blockedTicks: 0,
        cpuPercent: 6,
      }
    }

    return {
      ...process,
      blockedTicks: process.blockedTicks - 1,
    }
  })
}

function runSchedulerTick() {
  const before = [...persistedState.processes]
  persistedState.tick += 1

  releaseFromBlock()

  const currentRunning = persistedState.processes.find(
    (process) => process.state === 'ejecutando',
  )

  if (currentRunning) {
    const currentPid = currentRunning.pid
    const runningNext = {
      ...currentRunning,
      remainingBurst: currentRunning.remainingBurst - 1,
      quantumUsed: currentRunning.quantumUsed + 1,
      cpuPercent: clamp(currentRunning.cpuPercent + 6, 10, 96),
      pages: Math.max(10, currentRunning.pages + Math.round(Math.random() * 3 - 1)),
    }

    if (runningNext.remainingBurst <= 0) {
      runningNext.remainingBurst = currentRunning.burst
      runningNext.state = 'listo'
      runningNext.quantumUsed = 0
      runningNext.cpuPercent = clamp(currentRunning.cpuPercent - 4, 8, 92)
      persistedState.processes = persistedState.processes.map((process) =>
        process.pid === currentPid ? runningNext : process,
      )
    } else {
      const readyProcesses = persistedState.processes.filter(
        (process) => process.state === 'nuevo' || process.state === 'listo',
      )

      const shouldPreempt =
        persistedState.algorithm === 'Round Robin'
          ? runningNext.quantumUsed >= persistedState.quantum
          : persistedState.algorithm === 'SJF'
            ? readyProcesses.some(
                (process) =>
                  process.remainingBurst < runningNext.remainingBurst &&
                  process.pid !== currentPid,
              )
            : persistedState.algorithm === 'Prioridades'
              ? readyProcesses.some(
                  (process) =>
                    PRIORITY_ORDER[process.priority] < PRIORITY_ORDER[runningNext.priority] &&
                    process.pid !== currentPid,
                )
              : false

      if (shouldPreempt) {
        runningNext.state = 'listo'
        runningNext.quantumUsed = 0
        persistedState.processes = persistedState.processes.map((process) =>
          process.pid === currentPid ? runningNext : process,
        )
      } else {
        persistedState.processes = persistedState.processes.map((process) =>
          process.pid === currentPid ? runningNext : process,
        )
      }
    }
  }

  const nextProcess = chooseNextProcess()
  if (nextProcess) {
    const processWillBlock = Math.random() > 0.88 && nextProcess.remainingBurst > 3
    persistedState.processes = persistedState.processes.map((process) => {
      if (process.pid === nextProcess.pid) {
        return {
          ...process,
          state: processWillBlock ? 'bloqueado' : 'ejecutando',
          cpuPercent: processWillBlock ? 0 : clamp(process.cpuPercent + 8, 12, 94),
          quantumUsed: 0,
          blockedTicks: processWillBlock ? 2 : 0,
        }
      }

      if (process.state === 'ejecutando') {
        return {
          ...process,
          state: 'listo',
          quantumUsed: 0,
        }
      }

      return process
    })
  }

  return {
    before,
    after: persistedState.processes,
    stats: buildStats(),
  }
}

function buildResponseBody() {
  return {
    server: SERVER_NAME,
    state: {
      processes: persistedState.processes,
      stats: buildStats(),
      algorithm: persistedState.algorithm,
      quantum: persistedState.quantum,
      isRunning: persistedState.isRunning,
      tick: persistedState.tick,
      nextPid: persistedState.nextPid,
    },
    apps: APP_DEFINITIONS,
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  response.end(JSON.stringify(payload))
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = ''

    request.on('data', (chunk) => {
      body += chunk
    })

    request.on('end', () => {
      if (!body) {
        resolve({})
        return
      }

      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })

    request.on('error', reject)
  })
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {})
    return
  }

  const url = new URL(request.url, `http://${request.headers.host}`)

  if (url.pathname === '/api/state' && request.method === 'GET') {
    sendJson(response, 200, buildResponseBody())
    return
  }

  if (url.pathname === '/api/apps' && request.method === 'GET') {
    sendJson(response, 200, { apps: APP_DEFINITIONS })
    return
  }

  if (url.pathname === '/api/simulation/toggle' && request.method === 'POST') {
    const body = await parseBody(request)
    persistedState.isRunning = body.isRunning ?? !persistedState.isRunning
    sendJson(response, 200, buildResponseBody())
    return
  }

  if (url.pathname === '/api/simulation/step' && request.method === 'POST') {
    runSchedulerTick()
    sendJson(response, 200, buildResponseBody())
    return
  }

  if (url.pathname === '/api/simulation/reset' && request.method === 'POST') {
    persistedState.algorithm = 'Round Robin'
    persistedState.quantum = 3
    persistedState.isRunning = false
    persistedState.tick = 0
    persistedState.nextPid = 1
    persistedState.processes = []
    sendJson(response, 200, buildResponseBody())
    return
  }

  if (url.pathname === '/api/simulation/config' && request.method === 'POST') {
    const body = await parseBody(request)
    if (body.algorithm) {
      persistedState.algorithm = body.algorithm
    }
    if (body.quantum) {
      persistedState.quantum = Math.max(1, Number(body.quantum))
    }
    sendJson(response, 200, buildResponseBody())
    return
  }

  if (url.pathname === '/api/processes' && request.method === 'POST') {
    const body = await parseBody(request)
    if (typeof body.pid !== 'number') {
      sendJson(response, 400, { error: 'PID requerido' })
      return
    }

    if (body.action === 'terminate') {
      persistedState.processes = persistedState.processes.map((process) =>
        process.pid === body.pid
          ? {
              ...process,
              state: 'terminado',
              cpuPercent: 0,
              quantumUsed: 0,
              blockedTicks: 0,
            }
          : process,
      )
      sendJson(response, 200, buildResponseBody())
      return
    }

    if (body.action === 'cleanup') {
      const targetProcess = persistedState.processes.find((process) => process.pid === body.pid)

      if (!targetProcess) {
        sendJson(response, 404, { error: 'Proceso no encontrado' })
        return
      }

      if (targetProcess.state !== 'terminado') {
        sendJson(response, 409, {
          error: 'El proceso debe estar en estado terminado antes de poder limpiarse.',
        })
        return
      }

      persistedState.processes = persistedState.processes.filter(
        (process) => process.pid !== body.pid,
      )
      sendJson(response, 200, buildResponseBody())
      return
    }

    sendJson(response, 400, { error: 'Acción de proceso no válida' })
    return
  }

  if (url.pathname === '/api/apps/open' && request.method === 'POST') {
    const body = await parseBody(request)
    const appId = body.appId
    const profile = APP_RESOURCE_PROFILE[appId]

    if (!profile) {
      sendJson(response, 404, { error: 'App no reconocida' })
      return
    }

    const processAlreadyOpen = persistedState.processes.some(
      (process) =>
        (process.appId === appId || process.name === APP_DEFINITIONS.find((app) => app.id === appId)?.name) &&
        process.state !== 'terminado',
    )

    if (processAlreadyOpen) {
      sendJson(response, 409, {
        error: `La aplicación ${appId} ya está abierta en el sistema.`,
      })
      return
    }

    const pid = persistedState.nextPid
    persistedState.nextPid += 1
    persistedState.processes.push({
      pid,
      appId,
      name: APP_DEFINITIONS.find((app) => app.id === appId)?.name ?? appId,
      state: 'listo',
      cpuPercent: 5,
      ramMB: profile.ramMB,
      diskIO: profile.diskIO,
      priority: profile.priority,
      pages: profile.pages,
      burst: profile.burst,
      remainingBurst: profile.burst,
      arrivalOrder: persistedState.processes.length + 1,
      quantumUsed: 0,
      blockedTicks: 0,
    })

    sendJson(response, 200, buildResponseBody())
    return
  }

  sendJson(response, 404, { error: 'Ruta no encontrada' })
})

setInterval(() => {
  if (persistedState.isRunning) {
    runSchedulerTick()
  }
}, 900)

server.listen(PORT, () => {
  console.log(`MiniOS Kernel running on http://127.0.0.1:${PORT}`)
})

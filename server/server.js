import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = Number(process.env.PORT || 3000)
const SERVER_NAME = 'MiniOS Kernel'
const RAM_TOTAL_MB = 1536
const SWAP_TOTAL_MB = 8192

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOGS_DIR = path.join(__dirname, 'logs')
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true })
}

let sessionStartedAt = Date.now()

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
  editor: {
    ramMB: 260,
    diskIO: '5 MB/s',
    priority: 'media',
    pages: 64,
    burst: 13,
  },
  mail: {
    ramMB: 210,
    diskIO: '4 MB/s',
    priority: 'media',
    pages: 52,
    burst: 10,
  },
  game: {
    ramMB: 720,
    diskIO: '12 MB/s',
    priority: 'alta',
    pages: 180,
    burst: 20,
  },
  photos: {
    ramMB: 280,
    diskIO: '6 MB/s',
    priority: 'baja',
    pages: 70,
    burst: 12,
  },
  database: {
    ramMB: 420,
    diskIO: '9 MB/s',
    priority: 'alta',
    pages: 105,
    burst: 17,
  },
}

const APP_DEFINITIONS = [
  { id: 'word', name: 'Word', icon: '📄', color: 'from-blue-600 to-blue-800', description: 'Procesador de texto' },
  { id: 'chrome', name: 'Chrome', icon: '🌐', color: 'from-emerald-500 to-teal-700', description: 'Navegador web' },
  { id: 'spotify', name: 'Spotify', icon: '🎵', color: 'from-green-500 to-green-800', description: 'Reproductor de música' },
  { id: 'explorer', name: 'Explorador', icon: '📁', color: 'from-amber-500 to-orange-700', description: 'Administrador de archivos' },
  { id: 'calculator', name: 'Calculadora', icon: '🧮', color: 'from-violet-500 to-purple-800', description: 'Calculadora del sistema' },
  { id: 'terminal', name: 'Terminal', icon: '💻', color: 'from-slate-600 to-slate-900', description: 'Consola del sistema' },
  { id: 'vscode', name: 'VSCode', icon: '🧩', color: 'from-cyan-500 to-blue-900', description: 'Editor de código' },
  { id: 'paint', name: 'Paint', icon: '🎨', color: 'from-pink-500 to-rose-900', description: 'Editor gráfico básico' },
  { id: 'settings', name: 'Ajustes', icon: '⚙️', color: 'from-indigo-500 to-violet-900', description: 'Configuración del sistema' },
  { id: 'editor', name: 'Editor', icon: '📝', color: 'from-orange-500 to-red-700', description: 'Editor de texto' },
  { id: 'mail', name: 'Correo', icon: '✉️', color: 'from-sky-500 to-blue-800', description: 'Cliente de correo' },
  { id: 'game', name: 'Juego', icon: '🎮', color: 'from-fuchsia-500 to-purple-800', description: 'Videojuego' },
  { id: 'photos', name: 'Fotos', icon: '🖼️', color: 'from-pink-500 to-orange-700', description: 'Galería de imágenes' },
  { id: 'database', name: 'Base de datos', icon: '🗄️', color: 'from-slate-500 to-cyan-800', description: 'Gestor de base de datos' },
]
const persistedState = {
  algorithm: 'Round Robin',
  quantum: 3,
  isRunning: false,
  tick: 0,
  nextPid: 1,
  swapIns: 0,
  swapOuts: 0,
  memoryEvent: null,
  processes: [],


  readyCounter: 0,
}

function nextReadyStamp() {
  persistedState.readyCounter += 1
  return persistedState.readyCounter
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function getDiskRate(diskIO) {
  const parsed = Number.parseFloat(diskIO)
  return Number.isFinite(parsed) ? parsed : 0
}

function getRamUsedMB() {
  return persistedState.processes
    .filter((process) => process.state !== 'terminado' && process.memoryLocation === 'ram')
    .reduce((sum, process) => sum + process.ramMB, 0)
}

function swapOutProcess() {
  const candidate = persistedState.processes
    .filter(
      (process) =>
        process.state === 'listo' &&
        process.memoryLocation === 'ram',
    )
    .sort(
      (left, right) =>
        PRIORITY_ORDER[right.priority] - PRIORITY_ORDER[left.priority] ||
        right.ramMB - left.ramMB ||
        right.arrivalOrder - left.arrivalOrder,
    )[0]

  if (!candidate) {
    return false
  }

  persistedState.processes = persistedState.processes.map((process) =>
    process.pid === candidate.pid
      ? { ...process, state: 'suspendido', memoryLocation: 'swap', cpuPercent: 0 }
      : process,
  )
  persistedState.swapOuts += 1
  persistedState.memoryEvent = `Swap out: ${candidate.name} salió de RAM y pasó a swap para liberar ${candidate.ramMB} MB.`
  return true
}

function placeInMemory(process) {
  if (process.memoryLocation === 'ram') {
    return
  }

  while (getRamUsedMB() + process.ramMB > RAM_TOTAL_MB && swapOutProcess()) {
    // Make room by suspending the lowest-priority ready process.
  }

  if (getRamUsedMB() + process.ramMB <= RAM_TOTAL_MB) {
    persistedState.processes = persistedState.processes.map((current) =>
      current.pid === process.pid
        ? { ...current, memoryLocation: 'ram', state: 'listo', cpuPercent: 5, readyStamp: nextReadyStamp() }
        : current,
    )
    persistedState.swapIns += 1
    persistedState.memoryEvent = `Swap in: ${process.name} volvió de swap a RAM.`
  }
}

function swapInReadyProcesses() {
  const candidates = persistedState.processes
    .filter((process) => process.state === 'suspendido')
    .sort((left, right) => left.arrivalOrder - right.arrivalOrder)

  candidates.forEach((process) => {
    placeInMemory(process)
  })
}

function buildStats() {
  const activeProcesses = persistedState.processes.filter(
    (process) => process.state !== 'terminado',
  )
  const runningProcess = activeProcesses.find((process) => process.state === 'ejecutando')
  const totalRamMB = activeProcesses
    .filter((process) => process.memoryLocation === 'ram')
    .reduce((sum, process) => sum + process.ramMB, 0)
  const totalSwapMB = activeProcesses
    .filter((process) => process.memoryLocation === 'swap')
    .reduce((sum, process) => sum + process.ramMB, 0)
  const diskPercent = clamp(
    Math.round(
      activeProcesses.reduce((sum, process) => sum + getDiskRate(process.diskIO), 0) * 2.5,
    ),
    0,
    100,
  )
  const cpuPercent = clamp(
    Math.round(runningProcess?.cpuPercent ?? 0),
    0,
    100,
  )

  return {
    cpuPercent,
    ramUsedGB: Number((totalRamMB / 1024).toFixed(2)),
    ramTotalGB: RAM_TOTAL_MB / 1024,
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
    swapUsedGB: Number((totalSwapMB / 1024).toFixed(2)),
    swapTotalGB: SWAP_TOTAL_MB / 1024,
    swapIns: persistedState.swapIns,
    swapOuts: persistedState.swapOuts,
    memoryEvent: persistedState.memoryEvent,
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
      return (
        left.remainingBurst - right.remainingBurst ||
        left.readyStamp - right.readyStamp
      )
    }

    if (persistedState.algorithm === 'Prioridades') {
      return (
        PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority] ||
        left.readyStamp - right.readyStamp
      )
    }

    // Round Robin: el orden es SIEMPRE el de la cola de listos
    // (readyStamp), nunca el orden fijo de llegada de la app.
    return left.readyStamp - right.readyStamp
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
        readyStamp: nextReadyStamp(),
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
  persistedState.memoryEvent = null

  releaseFromBlock()
  swapInReadyProcesses()

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
      runningNext.cyclesLeft = currentRunning.cyclesLeft - 1

      if (runningNext.cyclesLeft <= 0) {
        // El proceso ya completó todo el trabajo que tenía que hacer:
        // termina de verdad, no vuelve a la cola.
        runningNext.state = 'terminado'
        runningNext.cpuPercent = 0
        runningNext.quantumUsed = 0
        runningNext.remainingBurst = 0
      } else {
        runningNext.remainingBurst = currentRunning.burst
        runningNext.state = 'listo'
        runningNext.quantumUsed = 0
        runningNext.cpuPercent = clamp(currentRunning.cpuPercent - 4, 8, 92)
        runningNext.readyStamp = nextReadyStamp()
      }

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
        // Al ceder la CPU, el proceso se reincorpora al FINAL de la cola
        // de listos: se le asigna un readyStamp nuevo para que no vuelva
        // a ser elegido antes que los procesos que ya esperaban.
        runningNext.readyStamp = nextReadyStamp()
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
          readyStamp: nextReadyStamp(),
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

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds}s`
}
//convertir milisegundos a minutos y segundos


function saveSessionReport() {
  const now = Date.now()
  const durationMs = now - sessionStartedAt
  const timestamp = new Date(now).toISOString()
  const fileSafeTimestamp = timestamp.replace(/[:.]/g, '-')

  const processes = persistedState.processes
  const finished = processes.filter((process) => process.state === 'terminado')
  const stillActive = processes.filter((process) => process.state !== 'terminado')

  const lines = []
  lines.push('==================================================')
  lines.push(` REPORTE DE SESION - ${SERVER_NAME}`)
  lines.push('==================================================')
  lines.push(`Fecha/hora de cierre : ${timestamp}`)
  lines.push(`Duracion de la sesion : ${formatDuration(durationMs)} (${durationMs} ms)`)
  lines.push(`Ticks del scheduler   : ${persistedState.tick}`)
  lines.push(`Algoritmo utilizado   : ${persistedState.algorithm}`)
  if (persistedState.algorithm === 'Round Robin') {
    lines.push(`Quantum               : ${persistedState.quantum}`)
  }
  lines.push(`Estaba corriendo?     : ${persistedState.isRunning ? 'Si' : 'No'}`)
  lines.push('')
  lines.push(`Total de procesos creados en la sesion: ${processes.length}`)
  lines.push(`  - Terminados: ${finished.length}`)
  lines.push(`  - Sin terminar (listo/ejecutando/bloqueado/suspendido): ${stillActive.length}`)
  lines.push('')
  lines.push('--------------------------------------------------')
  lines.push(' DETALLE DE PROCESOS')
  lines.push('--------------------------------------------------')

  if (processes.length === 0) {
    lines.push('(No se ejecuto ningun proceso en esta sesion)')
  } else {
    processes.forEach((process) => {
      lines.push(`PID ${process.pid} - ${process.name} (${process.appId})`)
      lines.push(`  Estado final       : ${process.state}`)
      lines.push(`  Prioridad          : ${process.priority}`)
      lines.push(`  RAM asignada       : ${process.ramMB} MB`)
      lines.push(`  Disk I/O           : ${process.diskIO}`)
      lines.push(`  Rafaga (burst)     : ${process.burst}`)
      lines.push(`  Rafaga restante    : ${process.remainingBurst}`)
      lines.push(`  Ciclos restantes   : ${process.cyclesLeft}`)
      lines.push(`  Ubicacion memoria  : ${process.memoryLocation}`)
      lines.push(`  Orden de llegada   : ${process.arrivalOrder}`)
      lines.push('')
    })
  }

  lines.push('--------------------------------------------------')
  lines.push(' MEMORIA')
  lines.push('--------------------------------------------------')
  lines.push(`Swap-ins  : ${persistedState.swapIns}`)
  lines.push(`Swap-outs : ${persistedState.swapOuts}`)
  if (persistedState.memoryEvent) {
    lines.push(`Ultimo evento de memoria: ${persistedState.memoryEvent}`)
  }
  lines.push('==================================================')

  const fileName = `session_${fileSafeTimestamp}.txt`
  const filePath = path.join(LOGS_DIR, fileName)

  try {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8')
    console.log(`Reporte de sesion guardado en: ${filePath}`)
  } catch (error) {
    console.error('No se pudo guardar el reporte de sesion:', error)
  }

  return fileName
}

// Arma el contenido del reporte de sesión con el estado ANTES de limpiarlo
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
    const savedFileName = saveSessionReport()
    sessionStartedAt = Date.now()
    persistedState.algorithm = 'Round Robin'
    persistedState.quantum = 3
    persistedState.isRunning = false
    persistedState.tick = 0
    persistedState.nextPid = 1
    persistedState.swapIns = 0
    persistedState.swapOuts = 0
    persistedState.memoryEvent = null
    persistedState.processes = []
    persistedState.readyCounter = 0

    sendJson(response, 200, { ...buildResponseBody(), savedReport: savedFileName })
    return
  }

    if (url.pathname === '/api/reports' && request.method === 'GET') {
    const files = fs
      .readdirSync(LOGS_DIR)
      .filter((name) => name.endsWith('.txt'))
      .sort()
      .reverse()
    sendJson(response, 200, { reports: files })
    return
  }

    if (url.pathname.startsWith('/api/reports/') && request.method === 'GET') {
    const fileName = decodeURIComponent(url.pathname.replace('/api/reports/', ''))
    // Evita path traversal: solo permitimos nombres de archivo simples.
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      sendJson(response, 400, { error: 'Nombre de archivo invalido' })
      return
    }
    const filePath = path.join(LOGS_DIR, fileName)
    if (!fs.existsSync(filePath)) {
      sendJson(response, 404, { error: 'Reporte no encontrado' })
      return
    }
    const content = fs.readFileSync(filePath, 'utf-8')
    response.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Access-Control-Allow-Origin': '*',
    })
    response.end(content)
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
    const newProcess = {
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
      cyclesLeft: 2 + Math.floor(Math.random() * 3),
      arrivalOrder: persistedState.processes.length + 1,
      readyStamp: nextReadyStamp(),
      quantumUsed: 0,
      blockedTicks: 0,
      memoryLocation: 'ram',
    }
    if (getRamUsedMB() + newProcess.ramMB > RAM_TOTAL_MB) {
      newProcess.memoryLocation = 'swap'
      newProcess.state = 'suspendido'
      newProcess.cpuPercent = 0
      persistedState.memoryEvent = `Swap out: ${newProcess.name} se abrió directamente en swap porque no había RAM suficiente.`
    }
    persistedState.processes.push(newProcess)

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
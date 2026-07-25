export const QUANTUM = 3 
export const TOTAL_FRAMES = 256
export const FRAME_SIZE_MB = 16 
export const TOTAL_RAM_MB = TOTAL_FRAMES * FRAME_SIZE_MB
export const TICK_INTERVAL_MS = 800 

export const APP_DEFAULTS = {
Chrome: {
    pid: 1,
    name: 'Chrome',
    state: 'ejecutando',
    cpuPercent: 25,
    ramMB: 600,
    diskIO: '10 MB/s',
    priority: 'alta',
    pages: 150,
},

Word: {
    pid: 2,
    name: 'Word',
    state: 'listo',
    cpuPercent: 5,
    ramMB: 180,
    diskIO: '0',
    priority: 'media',
    pages: 45,
},

Spotify: {
    pid: 3,
    name: 'Spotify',
    state: 'bloqueado',
    cpuPercent: 0,
    ramMB: 120,
    diskIO: '2 MB/s',
    priority: 'baja',
    pages: 30,
},

explorer: {
    name: 'Explorador',
    priority: 'media',
    pages: 60,
    ramMB: 200,
    cpuBaseline: 8,
    diskLabel: '5 MB/s',
    diskMBps: 5,
    ioChance: 0.15,
},

calculator: {
    name: 'Calculadora',
    priority: 'baja',
    pages: 10,
    ramMB: 40,
    cpuBaseline: 2,
    diskLabel: '0',
    diskMBps: 0,
    ioChance: 0.02,
},

}

function buildProcess(pid, appId, overrides = {}) {
const def = APP_DEFAULTS[appId]
    return {
    pid,
    appId,
    name: def.name,
    state: 'listo',
    priority: def.priority,
    pages: def.pages,
    ramMB: def.ramMB,
    cpuPercent: 0,
    diskIO: '0',
    cpuBaseline: def.cpuBaseline,
    diskLabel: def.diskLabel,
    diskMBps: def.diskMBps,
    ioChance: def.ioChance,
    quantumRemaining: QUANTUM,
    ioTicksRemaining: 0,
    pageTable: new Array(def.pages).fill(null), ...overrides,
    }
}

export function createInitialState() {
const processes = new Map()
processes.set(1, buildProcess(1, 'chrome', { pid: 1, state: 'ejecutando' }))
processes.set(2, buildProcess(2, 'word', { pid: 2 }))
processes.set(3, buildProcess(3, 'spotify', { pid: 3 }))

return {
    tick: 0,
    running: false,
    nextPid: 4,
    processes,
    readyQueue: [2, 3], 
    runningPid: 1,
    blockedPids: new Set(),
    frames: new Array(TOTAL_FRAMES).fill(null), 
    freeFrames: Array.from({ length: TOTAL_FRAMES }, (_, i) => TOTAL_FRAMES - 1 - i),
    allocOrder: [], 
    pageFaults: 0,
    }
}
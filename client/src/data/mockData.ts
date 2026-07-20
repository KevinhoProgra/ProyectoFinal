import type { DesktopApp, Process, SystemStats } from '../types'

export const initialProcesses: Process[] = [
  {
    pid: 1,
    name: 'Chrome',
    state: 'ejecutando',
    cpuPercent: 25,
    ramMB: 600,
    diskIO: '10 MB/s',
    priority: 'alta',
    pages: 150,
  },
  {
    pid: 2,
    name: 'Word',
    state: 'listo',
    cpuPercent: 5,
    ramMB: 180,
    diskIO: '0',
    priority: 'media',
    pages: 45,
  },
  {
    pid: 3,
    name: 'Spotify',
    state: 'bloqueado',
    cpuPercent: 0,
    ramMB: 120,
    diskIO: '2 MB/s',
    priority: 'baja',
    pages: 30,
  },
]

export const initialSystemStats: SystemStats = {
  cpuPercent: 65,
  ramUsedGB: 2.4,
  ramTotalGB: 4,
  diskPercent: 30,
  runningProcess: 'Chrome',
  runningState: 'ejecutando',
  algorithm: 'Round Robin',
  quantum: 3,
  tick: 142,
  pageFaults: 7,
}

export const desktopApps: DesktopApp[] = [
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
]

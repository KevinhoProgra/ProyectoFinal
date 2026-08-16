import type { DesktopApp, Process, SystemStats } from '../types'
import wordIcon from '../assets/icons/word.png'
import chromeIcon from '../assets/icons/Chrome.png'
import settingsIcon from '../assets/icons/settings.png'
import spotifyIcon from '../assets/icons/spotify.png'
import explorerIcon from '../assets/icons/explorer.png'
import cmdIcon from '../assets/icons/cmd.png'
import vscodeIcon from '../assets/icons/vscode.png'
import paintIcon from '../assets/icons/paint.png'
import editorIcon from '../assets/icons/editor.png'
import mailIcon from '../assets/icons/email.png'
import photosIcon from '../assets/icons/fotos.png'
import databaseIcon from '../assets/icons/database.png'

export const initialProcesses: Process[] = [
  {
    pid: 1,
    name: 'Chrome',
    state: 'ejecutando',
    cpuPercent: 35,
    ramMB: 600,
    diskIO: '10 MB/s',
    priority: 'alta',
    pages: 150,
    burst: 8,
    remainingBurst: 8,
    arrivalOrder: 1,
    quantumUsed: 0,
    blockedTicks: 0,
    memoryLocation: 'ram',
  },
  {
    pid: 2,
    name: 'Word',
    state: 'listo',
    cpuPercent: 8,
    ramMB: 180,
    diskIO: '0',
    priority: 'media',
    pages: 45,
    burst: 6,
    remainingBurst: 6,
    arrivalOrder: 2,
    quantumUsed: 0,
    blockedTicks: 0,
    memoryLocation: 'ram',
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
    burst: 3,
    remainingBurst: 3,
    arrivalOrder: 3,
    quantumUsed: 0,
    blockedTicks: 1,
    memoryLocation: 'ram',
  },
]

export const initialSystemStats: SystemStats = {
  cpuPercent: 65,
  ramUsedGB: 2.4,
  ramTotalGB: 1.5,
  diskPercent: 30,
  runningProcess: 'Chrome',
  runningState: 'ejecutando',
  algorithm: 'Round Robin',
  quantum: 3,
  tick: 142,
  pageFaults: 7,
  swapUsedGB: 0,
  swapTotalGB: 8,
  swapIns: 0,
  swapOuts: 0,
  memoryEvent: null,
}

export const desktopApps: DesktopApp[] = [
  {
    id: 'word',
    name: 'Word',
    icon: wordIcon,
    color: 'from-blue-600 to-blue-800',
    description: 'Procesador de texto',
  },
  {
    id: 'chrome',
    name: 'Chrome',
    icon: chromeIcon,
    color: 'from-emerald-500 to-teal-700',
    description: 'Navegador web',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: spotifyIcon,
    color: 'from-green-500 to-green-800',
    description: 'Reproductor de música',
  },
  {
    id: 'explorer',
    name: 'Explorador',
    icon: explorerIcon,
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
    icon: cmdIcon,
    color: 'from-slate-600 to-slate-900',
    description: 'Consola del sistema',
  },
  {
    id: 'vscode',
    name: 'VSCode',
    icon: vscodeIcon,
    color: 'from-cyan-500 to-blue-900',
    description: 'Editor de código',
  },
  {
    id: 'paint',
    name: 'Paint',
    icon: paintIcon,
    color: 'from-pink-500 to-rose-900',
    description: 'Editor gráfico básico',
  },
  {
    id: 'settings',
    name: 'Ajustes',
    icon: settingsIcon,
    color: 'from-indigo-500 to-violet-900',
    description: 'Configuración del sistema',
  },
  {
    id: 'editor',
    name: 'Editor',
    icon: editorIcon,
    color: 'from-orange-500 to-red-700',
    description: 'Editor de texto',
  },
  {
    id: 'mail',
    name: 'Correo',
    icon: mailIcon,
    color: 'from-sky-500 to-blue-800',
    description: 'Cliente de correo',
  },
  {
    id: 'game',
    name: 'Juego',
    icon: '🎮',
    color: 'from-fuchsia-500 to-purple-800',
    description: 'Videojuego',
  },
  {
    id: 'photos',
    name: 'Fotos',
    icon: photosIcon,
    color: 'from-pink-500 to-orange-700',
    description: 'Galería de imágenes',
  },
  {
    id: 'database',
    name: 'Base de datos',
    icon: databaseIcon,
    color: 'from-slate-500 to-cyan-800',
    description: 'Gestor de base de datos',
  },
]

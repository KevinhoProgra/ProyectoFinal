export type ProcessState =
  | 'nuevo'
  | 'listo'
  | 'ejecutando'
  | 'bloqueado'
  | 'terminado'

export type Priority = 'alta' | 'media' | 'baja'

export interface Process {
  pid: number
  name: string
  state: ProcessState
  cpuPercent: number
  ramMB: number
  diskIO: string
  priority: Priority
  pages: number
}

export interface SystemStats {
  cpuPercent: number
  ramUsedGB: number
  ramTotalGB: number
  diskPercent: number
  runningProcess: string
  runningState: ProcessState
  algorithm: string
  quantum: number
  tick: number
  pageFaults: number
}

export interface DesktopApp {
  id: string
  name: string
  icon: string
  color: string
  description: string
}

export interface SimulationConfig {
  isRunning: boolean
  speed: number
}

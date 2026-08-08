export type ProcessState =
  | 'nuevo'
  | 'listo'
  | 'ejecutando'
  | 'bloqueado'
  | 'suspendido'
  | 'terminado'

export type Priority = 'alta' | 'media' | 'baja'
export type SchedulerAlgorithm =
  | 'Round Robin'
  | 'FCFS'
  | 'SJF'
  | 'Prioridades'

export interface Process {
  pid: number
  name: string
  appId?: string
  state: ProcessState
  cpuPercent: number
  ramMB: number
  diskIO: string
  priority: Priority
  pages: number
  burst: number
  remainingBurst: number
  arrivalOrder: number
  quantumUsed: number
  blockedTicks: number
  memoryLocation: 'ram' | 'swap'
}

export interface SystemStats {
  cpuPercent: number
  ramUsedGB: number
  ramTotalGB: number
  diskPercent: number
  runningProcess: string
  runningState: ProcessState
  algorithm: SchedulerAlgorithm
  quantum: number
  tick: number
  pageFaults: number
  swapUsedGB: number
  swapTotalGB: number
  swapIns: number
  swapOuts: number
  memoryEvent: string | null
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

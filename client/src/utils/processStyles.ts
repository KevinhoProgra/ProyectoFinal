import type { Priority, ProcessState } from '../types'

const stateStyles: Record<
  ProcessState,
  { label: string; bg: string; text: string; dot: string }
> = {
  nuevo: {
    label: 'Nuevo',
    bg: 'bg-slate-500/20',
    text: 'text-slate-300',
    dot: 'bg-slate-400',
  },
  listo: {
    label: 'Listo',
    bg: 'bg-sky-500/20',
    text: 'text-sky-300',
    dot: 'bg-sky-400',
  },
  ejecutando: {
    label: 'Ejecutando',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400 animate-blink',
  },
  bloqueado: {
    label: 'Bloqueado',
    bg: 'bg-amber-500/20',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
  },
  suspendido: {
    label: 'En swap',
    bg: 'bg-violet-500/20',
    text: 'text-violet-300',
    dot: 'bg-violet-400 animate-blink',
  },
  terminado: {
    label: 'Terminado',
    bg: 'bg-rose-500/20',
    text: 'text-rose-300',
    dot: 'bg-rose-400',
  },
}

const priorityStyles: Record<Priority, { label: string; color: string }> = {
  alta: { label: 'Alta', color: 'text-rose-400' },
  media: { label: 'Media', color: 'text-amber-400' },
  baja: { label: 'Baja', color: 'text-slate-400' },
}

export function getStateStyle(state: ProcessState) {
  return stateStyles[state]
}

export function getPriorityStyle(priority: Priority) {
  return priorityStyles[priority]
}

export function formatStateLabel(state: ProcessState): string {
  return stateStyles[state].label
}

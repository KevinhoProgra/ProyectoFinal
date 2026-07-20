import type { DesktopApp } from '../../types'

interface AppIconProps {
  app: DesktopApp
  onLaunch: (app: DesktopApp) => void
  isSelected?: boolean
}

export function AppIcon({ app, onLaunch, isSelected }: AppIconProps) {
  return (
    <button
      type="button"
      onClick={() => onLaunch(app)}
      className={`group flex w-24 flex-col items-center gap-2 rounded-xl p-3 transition-all duration-200 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${
        isSelected ? 'bg-white/10 ring-1 ring-cyan-400/40' : ''
      }`}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${app.color} text-2xl shadow-lg transition-transform duration-200 group-hover:scale-105 group-active:scale-95`}
      >
        {app.icon}
      </div>
      <span className="text-center text-xs font-medium text-slate-200 group-hover:text-white">
        {app.name}
      </span>
    </button>
  )
}

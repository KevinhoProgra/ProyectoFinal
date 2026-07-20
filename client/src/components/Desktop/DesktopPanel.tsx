import type { DesktopApp } from '../../types'
import { AppIcon } from './AppIcon'

interface DesktopPanelProps {
  apps: DesktopApp[]
  selectedAppId: string | null
  onLaunchApp: (app: DesktopApp) => void
}

export function DesktopPanel({
  apps,
  selectedAppId,
  onLaunchApp,
}: DesktopPanelProps) {
  return (
    <div className="relative flex h-full flex-col">
      <div
        className="pointer-events-none absolute inset-0 rounded-lg opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative mb-4 flex items-center gap-2 rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2">
        <span className="text-sm">🖥</span>
        <span className="text-xs text-slate-400">
          Escritorio MiniOS — Haz clic en una app para lanzar un proceso
        </span>
      </div>

      <div className="relative flex flex-1 flex-wrap content-start gap-2">
        {apps.map((app) => (
          <AppIcon
            key={app.id}
            app={app}
            onLaunch={onLaunchApp}
            isSelected={selectedAppId === app.id}
          />
        ))}
      </div>

      <div className="relative mt-auto flex items-center justify-between border-t border-slate-700/40 pt-3">
        <div className="flex gap-1">
          {['Inicio', 'Buscar', 'Widgets'].map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-md px-2.5 py-1 text-[10px] font-medium text-slate-500 transition-colors hover:bg-slate-700/50 hover:text-slate-300"
            >
              {item}
            </button>
          ))}
        </div>
        <span className="font-mono text-[10px] text-slate-600">
          MiniOS v1.0 — Frontend
        </span>
      </div>
    </div>
  )
}

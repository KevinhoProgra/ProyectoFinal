interface PanelProps {
  title: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function Panel({ title, children, className = '', action }: PanelProps) {
  return (
    <section
      className={`flex flex-col overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/60 shadow-xl backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-700/50 bg-slate-800/40 px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {title}
        </h2>
        {action}
      </div>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </section>
  )
}

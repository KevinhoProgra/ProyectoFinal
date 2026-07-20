interface ResourceBarProps {
  label: string
  value: number
  max?: number
  unit?: string
  color: 'cyan' | 'violet' | 'amber' | 'emerald'
  animated?: boolean
}

const colorMap = {
  cyan: 'from-cyan-500 to-blue-500',
  violet: 'from-violet-500 to-purple-500',
  amber: 'from-amber-500 to-orange-500',
  emerald: 'from-emerald-500 to-teal-500',
}

export function ResourceBar({
  label,
  value,
  max = 100,
  unit = '%',
  color,
  animated = false,
}: ResourceBarProps) {
  const percent = Math.min(100, Math.round((value / max) * 100))
  const displayValue =
    unit === '%' ? `${value}%` : `${value.toFixed(1)} / ${max} ${unit}`

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="w-12 font-medium text-slate-300">{label}</span>
        <span className="font-mono text-xs text-slate-400">{displayValue}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]} transition-all duration-500 ${animated ? 'animate-pulse-bar' : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

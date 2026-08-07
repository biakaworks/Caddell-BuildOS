import { cn } from "@/lib/utils"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import type { HealthStatus } from "@/lib/types"

// --- Sparkline -------------------------------------------------------------
export function Sparkline({
  data,
  className,
  width = 96,
  height = 28,
  strokeClass = "stroke-primary",
}: {
  data: number[]
  className?: string
  width?: number
  height?: number
  strokeClass?: string
}) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = width / (data.length - 1)
  const pts = data.map((v, i) => {
    const x = i * step
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const last = pts[pts.length - 1].split(",")
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={cn("overflow-visible", className)}
      aria-hidden="true"
    >
      <polyline
        points={pts.join(" ")}
        className={cn("fill-none", strokeClass)}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r={2} className={cn(strokeClass, "fill-current")} />
    </svg>
  )
}

// --- Status Pill (for health / job status) --------------------------------
export type Tone = "success" | "warning" | "danger" | "info" | "neutral"

const toneClass: Record<Tone, string> = {
  success: "border border-success/25 bg-success-muted text-success-strong",
  warning: "border border-warning/25 bg-warning-muted text-warning-strong",
  danger:  "border border-danger/25 bg-danger-muted text-danger-strong",
  info:    "border border-info/25 bg-info-muted text-info",
  neutral: "border border-border bg-secondary text-muted-foreground",
}

const dotClass: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger:  "bg-danger",
  info:    "bg-info",
  neutral: "bg-muted-foreground",
}

export function StatusPill({
  children,
  tone = "neutral",
  className,
  dot = true,
}: {
  children: React.ReactNode
  tone?: Tone
  className?: string
  dot?: boolean
}) {
  return (
    <span
      data-pill
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-medium whitespace-nowrap",
        toneClass[tone],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dotClass[tone])} />}
      {children}
    </span>
  )
}

export function healthTone(h: HealthStatus): Tone {
  if (h === "On Schedule") return "success"
  if (h === "At Risk") return "warning"
  return "danger"
}

export function statusToTone(status: string): Tone {
  const s = status.toLowerCase()
  if (s.includes("late") || s.includes("overdue") || s.includes("revise") || s.includes("failed")) return "danger"
  if (s.includes("risk") || s.includes("review") || s.includes("pending") || s.includes("in progress") || s.includes("open") || s.includes("new") || s.includes("pricing") || s.includes("takeoff") || s.includes("en route")) return "warning"
  if (s.includes("on schedule") || s.includes("approved") || s.includes("complete") || s.includes("awarded") || s.includes("won") || s.includes("shipped") || s.includes("resolved") || s.includes("stage")) return "success"
  if (s.includes("dispatch") || s.includes("received") || s.includes("submitted") || s.includes("qualified")) return "info"
  return "neutral"
}

// --- Phase Track -----------------------------------------------------------
import { PROJECT_PHASES } from "@/lib/types"
import type { ProjectPhase } from "@/lib/types"
import { Check } from "lucide-react"

export function PhaseTrack({ current }: { current: ProjectPhase }) {
  const idx = PROJECT_PHASES.indexOf(current)
  return (
    <nav aria-label="Project phase" className="flex items-center gap-0">
      {PROJECT_PHASES.map((phase, i) => {
        const done = i < idx
        const active = i === idx
        return (
          <div key={phase} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex size-7 items-center justify-center border text-xs",
                  done
                    ? "border-success bg-success text-success-foreground"
                    : active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="size-3" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-[10px] tracking-wide whitespace-nowrap lg:block",
                  active ? "text-foreground" : done ? "text-success" : "text-muted-foreground/60",
                )}
              >
                {phase}
              </span>
            </div>
            {i < PROJECT_PHASES.length - 1 && (
              <div
                className={cn(
                  "mx-0.5 h-px w-6 shrink-0 lg:w-8",
                  i < idx ? "bg-success" : "bg-border",
                )}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}

// --- Meter -----------------------------------------------------------------
export function Meter({
  value,
  tone = "info",
  className,
}: {
  value: number
  tone?: Tone
  className?: string
}) {
  const pct = Math.max(0, Math.min(100, value))
  const fill: Record<Tone, string> = {
    success: "bg-success",
    warning: "bg-warning",
    danger:  "bg-danger",
    info:    "bg-primary",
    neutral: "bg-muted-foreground",
  }
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1 w-full bg-muted", className)}
    >
      <div className={cn("h-full transition-all duration-500", fill[tone])} style={{ width: `${pct}%` }} />
    </div>
  )
}

// --- Section heading -------------------------------------------------------
export function SectionHeading({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        <h2 className="text-sm font-sans text-foreground" style={{ letterSpacing: "-0.02em" }}>
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

// --- Page container -------------------------------------------------------
export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-5 py-6 lg:px-8 lg:py-8", className)}>
      {children}
    </div>
  )
}

// --- Page header ----------------------------------------------------------
export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: React.ReactNode
  subtitle?: string
  children?: React.ReactNode
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1
          className="text-2xl text-foreground text-balance"
          style={{ letterSpacing: "-0.03em" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </header>
  )
}

// --- Empty Phase 2 state --------------------------------------------------
export function EmptyPhase2({
  section,
  description,
}: {
  section: string
  description: string
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="border border-primary/20 bg-card px-6 py-8 max-w-md">
        <p
          className="text-xs text-primary/60 tracking-widest uppercase mb-4"
          style={{ letterSpacing: "0.12em" }}
        >
          Coming in Phase 2
        </p>
        <h2 className="text-xl text-foreground mb-2" style={{ letterSpacing: "-0.02em" }}>
          {section}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// --- Stat Tile ------------------------------------------------------------
export function StatTile({
  label,
  value,
  tone = "neutral",
  sub,
}: {
  label: string
  value: string | number
  tone?: Tone
  sub?: string
}) {
  const accent: Record<Tone, string> = {
    success: "border-l-success",
    warning: "border-l-warning",
    danger:  "border-l-danger",
    info:    "border-l-primary",
    neutral: "border-l-border",
  }
  return (
    <div className={cn("border border-border border-l-2 bg-card px-4 py-4", accent[tone])}>
      <p className="text-xs text-muted-foreground mb-2" style={{ letterSpacing: "-0.01em" }}>
        {label}
      </p>
      <p className="text-2xl text-foreground tabular-nums" style={{ letterSpacing: "-0.03em" }}>
        {value}
      </p>
      {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  )
}

// --- Trend delta ----------------------------------------------------------
export function TrendDelta({
  value,
  goodWhenUp = true,
  className,
}: {
  value: number
  goodWhenUp?: boolean
  className?: string
}) {
  const flat = value === 0
  const up = value > 0
  const positive = flat ? false : up === goodWhenUp
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs tabular-nums",
        flat
          ? "text-muted-foreground"
          : positive
          ? "text-success"
          : "text-danger",
        className,
      )}
    >
      <Icon className="size-3" />
      {up ? "+" : ""}
      {value}%
    </span>
  )
}

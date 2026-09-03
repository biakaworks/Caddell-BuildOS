import { cn } from "@/lib/utils"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import type { Health } from "@/lib/mock-data"

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

// --- Trend delta -----------------------------------------------------------
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
        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
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
      {value}
      {Math.abs(value) < 10 && !Number.isInteger(value) ? "" : "%"}
    </span>
  )
}

// --- Health dot ------------------------------------------------------------
const healthMap: Record<Health, { dot: string; label: string }> = {
  "on-track": { dot: "bg-success", label: "On track" },
  "at-risk": { dot: "bg-warning", label: "At risk" },
  critical: { dot: "bg-danger", label: "Critical" },
}

export function HealthDot({ health, className }: { health: Health; className?: string }) {
  const h = healthMap[health]
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("size-2 rounded-full", h.dot)} />
      <span className="text-xs font-medium text-foreground">{h.label}</span>
    </span>
  )
}

// --- Status pill -----------------------------------------------------------
type Tone = "success" | "warning" | "danger" | "info" | "neutral"

const toneClass: Record<Tone, string> = {
  success: "bg-success-muted text-success-strong",
  warning: "bg-warning-muted text-warning-strong",
  danger: "bg-danger-muted text-danger-strong",
  info: "bg-info-muted text-info",
  neutral: "bg-secondary text-secondary-foreground",
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
  const dotClass: Record<Tone, string> = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
    neutral: "bg-muted-foreground",
  }
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap",
        toneClass[tone],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full", dotClass[tone])} />}
      {children}
    </span>
  )
}

export function statusToTone(status: string): Tone {
  const s = status.toLowerCase()
  if (s.includes("overdue") || s.includes("critical") || s.includes("revise")) return "danger"
  if (s.includes("review") || s.includes("pending") || s.includes("progress") || s.includes("open")) return "warning"
  if (s.includes("approved") || s.includes("answered") || s.includes("complete") || s.includes("won")) return "success"
  return "neutral"
}

// --- Meter (progress bar) --------------------------------------------------
const meterColor: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-primary",
}

export function Meter({
  value,
  tone = "info",
  className,
  trackClass,
}: {
  value: number
  tone?: Tone
  className?: string
  trackClass?: string
}) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", trackClass, className)}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", meterColor[tone])}
        style={{ width: `${pct}%` }}
      />
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
        <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

// --- Page container --------------------------------------------------------
export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8", className)}>
      {children}
    </div>
  )
}

// --- Page header -----------------------------------------------------------
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
    <header className="sticky top-16 z-20 -mx-4 flex flex-col gap-4 border-b border-border bg-background/85 px-4 pb-5 pt-5 backdrop-blur-md sm:-mx-6 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:-mx-8 lg:px-8">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance text-foreground">
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

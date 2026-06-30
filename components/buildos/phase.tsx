import { cn } from "@/lib/utils"

export type Phase = 1 | 2 | 3

const phaseStyles: Record<Exclude<Phase, 1>, { badge: string; ribbon: string; label: string }> = {
  2: {
    badge: "bg-info-muted text-info ring-1 ring-info/20",
    ribbon: "bg-info text-info-foreground",
    label: "Phase 2",
  },
  3: {
    badge: "bg-warning-muted text-warning-strong ring-1 ring-warning/25",
    ribbon: "bg-warning text-warning-foreground",
    label: "Phase 3",
  },
}

// --- Phase badge -----------------------------------------------------------
export function PhaseBadge({ phase, className }: { phase: Exclude<Phase, 1>; className?: string }) {
  const s = phaseStyles[phase]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-none",
        s.badge,
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </span>
  )
}

// --- Preview block: subtle "roadmap" treatment, still interactive ----------
export function PreviewBlock({
  phase,
  children,
  className,
  ribbon = true,
}: {
  phase: Exclude<Phase, 1>
  children: React.ReactNode
  className?: string
  /** Show the diagonal-free corner ribbon. */
  ribbon?: boolean
}) {
  const s = phaseStyles[phase]
  return (
    <div
      data-phase={phase}
      className={cn(
        "group/preview relative isolate overflow-hidden rounded-xl",
        // faint dashed frame signals "not yet built"
        "ring-1 ring-inset ring-border",
        className,
      )}
    >
      {ribbon && (
        <div className="pointer-events-none absolute right-0 top-0 z-10">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-bl-lg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-sm",
              s.ribbon,
            )}
          >
            {s.label} · Preview
          </span>
        </div>
      )}
      {/* Slightly muted so it reads as roadmap, restored on hover for exploration */}
      <div className="opacity-[0.92] saturate-[0.85] transition-[opacity,filter] duration-300 group-hover/preview:opacity-100 group-hover/preview:saturate-100 motion-reduce:transition-none">
        {children}
      </div>
    </div>
  )
}

// --- Inline "coming in Phase N" hint ---------------------------------------
export function PhaseHint({ phase, children }: { phase: Exclude<Phase, 1>; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <PhaseBadge phase={phase} />
      {children}
    </span>
  )
}

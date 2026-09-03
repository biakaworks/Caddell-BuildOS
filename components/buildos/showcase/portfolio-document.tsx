"use client"

import { useState, type ReactNode } from "react"
import { ImageOff } from "lucide-react"
import {
  COMPANY_STATS,
  aggregateShowcase,
  formatCurrency,
  formatNumber,
  type PerfMetric,
  type ShowcaseProject,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import {
  selectedMetrics,
  selectedProjects,
  type BlockRef,
  type PortfolioConfig,
} from "./config"
import { MetricMainChart } from "@/components/buildos/reporting/perf-charts"

/** The display register: editorial (Crimson Pro, the Caddell serif) for client decks, Roboto Condensed for internal. */
const headingFont = (editorial: boolean) => (editorial ? "font-display" : "font-heading")

/* ---------------------------------------------------------------------------
 * Shared pieces
 * ------------------------------------------------------------------------- */

function compactHours(hours: number): string {
  if (hours >= 1_000_000) return `${(hours / 1_000_000).toFixed(1)}M`
  if (hours >= 1_000) return `${Math.round(hours / 1_000)}K`
  return formatNumber(hours)
}

function budgetLabel(variancePct: number): string {
  if (variancePct === 0) return "On budget"
  if (variancePct < 0) return `${Math.abs(variancePct).toFixed(1)}% under`
  return `${variancePct.toFixed(1)}% over`
}

/** Caddell wordmark placeholder — not the real logo. `tone` adapts to bg. */
export function ShowcaseLogo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const light = tone === "light"
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-md font-display text-lg font-semibold",
          light ? "bg-white text-primary" : "bg-primary text-primary-foreground",
        )}
        aria-hidden
      >
        C
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block font-display text-base font-semibold tracking-tight",
            light ? "text-white" : "text-foreground",
          )}
        >
          CADDELL
        </span>
        <span
          className={cn(
            "block text-[10px] font-medium uppercase tracking-[0.22em]",
            light ? "text-white/70" : "text-muted-foreground",
          )}
        >
          Construction
        </span>
      </span>
    </div>
  )
}

function ImageSlot({
  src,
  alt,
  className,
  imgClassName,
}: {
  src: string
  alt: string
  className?: string
  imgClassName?: string
}) {
  const [failed, setFailed] = useState(false)
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {failed ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
          <ImageOff className="size-6" aria-hidden />
          <span className="px-4 text-center text-xs">{alt}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-cover", imgClassName)}
          loading="lazy"
        />
      )}
    </div>
  )
}

function Eyebrow({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <span
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.2em]",
        light ? "text-white/70" : "text-primary",
      )}
    >
      {children}
    </span>
  )
}

/* ---------------------------------------------------------------------------
 * Sections
 * ------------------------------------------------------------------------- */

function CoverSection({ config }: { config: PortfolioConfig }) {
  const stats = COMPANY_STATS.filter((_, i) => config.enabledStats[i])
  return (
    <section className="relative flex min-h-[640px] flex-col justify-between overflow-hidden bg-primary text-primary-foreground">
      <ImageSlot
        src="/showcase/cover.png"
        alt="Modern construction project at golden hour"
        className="absolute inset-0 h-full w-full"
        imgClassName="opacity-45"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--primary) 78%, transparent) 0%, color-mix(in oklab, var(--primary) 55%, transparent) 45%, color-mix(in oklab, var(--primary) 88%, transparent) 100%)",
        }}
        aria-hidden
      />
      <div className="relative flex items-start justify-between p-10 sm:p-14">
        <ShowcaseLogo tone="light" />
        <span className="hidden text-xs font-medium uppercase tracking-[0.2em] text-white/70 sm:block">
          Capabilities Statement
        </span>
      </div>

      <div className="relative px-10 pb-4 sm:px-14">
        <Eyebrow light>Capabilities Portfolio</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl">
          {config.title || "Capabilities Portfolio"}
        </h1>
        {config.preparedFor.trim() ? (
          <p className="mt-5 text-lg text-white/85">
            Prepared for <span className="font-semibold text-white">{config.preparedFor}</span>
          </p>
        ) : null}
        {config.intro.trim() ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 text-pretty">
            {config.intro}
          </p>
        ) : null}
      </div>

      <div className="relative mt-10 grid grid-cols-2 gap-px border-t border-white/15 bg-white/10 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-primary/40 px-6 py-6 backdrop-blur-sm sm:px-8">
            <div className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
              {s.value}
            </div>
            <div className="mt-1 text-xs leading-snug text-white/70 text-pretty">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ResultStat({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="border-l-2 border-primary/15 pl-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-3xl font-semibold leading-none tracking-tight text-foreground sm:text-4xl">
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  )
}

function ProjectShowcaseSection({
  project,
  index,
  total,
  editorial = true,
}: {
  project: ShowcaseProject
  index: number
  total: number
  editorial?: boolean
}) {
  return (
    <section className="flex flex-col bg-card px-10 py-12 text-card-foreground sm:px-14 sm:py-14">
      <div className="flex items-center justify-between">
        <Eyebrow>{project.market}</Eyebrow>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      <h2
        className={cn(
          "mt-3 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl",
          headingFont(editorial),
        )}
      >
        {project.name}
      </h2>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{project.delivery}</span>
        <span aria-hidden>·</span>
        <span>{project.clientType}</span>
        <span aria-hidden>·</span>
        <span>{project.location}</span>
        <span aria-hidden>·</span>
        <span>Completed {project.completed}</span>
      </div>

      <ImageSlot
        src={project.image}
        alt={project.imageAlt}
        className="mt-7 aspect-[16/7] w-full rounded-xl"
      />

      <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
        <ResultStat label="Contract value" value={formatCurrency(project.contractValue)} />
        <ResultStat label="On time" value={`${project.onTimePct}%`} sub="of milestones" />
        <ResultStat label="Budget" value={budgetLabel(project.budgetVariancePct)} />
        <ResultStat
          label="Safety (TRIR)"
          value={project.trir.toFixed(2)}
          sub={`${compactHours(project.safetyHours)} hrs worked`}
        />
      </div>

      <div className="mt-9 grid gap-x-12 gap-y-4 border-t border-border pt-7 sm:grid-cols-[1.4fr_1fr]">
        <p className="max-w-2xl text-[15px] leading-relaxed text-foreground/85 text-pretty">
          {project.narrative}
        </p>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Notable scope</dt>
            <dd className="text-right font-medium text-foreground">{project.scope}</dd>
          </div>
          {project.sqft > 0 ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Size</dt>
              <dd className="text-right font-medium text-foreground tabular-nums">
                {formatNumber(project.sqft)} sq ft
              </dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Delivery</dt>
            <dd className="text-right font-medium text-foreground">{project.delivery}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

function CapabilitiesSection({ config }: { config: PortfolioConfig }) {
  const agg = aggregateShowcase(selectedProjects(config))
  return (
    <section className="flex flex-col bg-card px-10 py-14 text-card-foreground sm:px-14">
      <Eyebrow>Capabilities Summary</Eyebrow>
      <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">
        Proof across the portfolio
      </h2>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground text-pretty">
        Aggregate results from the {agg.count} {agg.count === 1 ? "project" : "projects"} in this
        portfolio.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
        <ResultStat label="Total value delivered" value={formatCurrency(agg.totalValue)} />
        <ResultStat label="On-time rate" value={`${agg.onTimeRate}%`} sub="milestone average" />
        <ResultStat label="On-budget rate" value={`${agg.onBudgetRate}%`} sub="of projects" />
        <ResultStat
          label="Blended TRIR"
          value={agg.blendedTrir.toFixed(2)}
          sub={`${compactHours(agg.totalSafetyHours)} hrs`}
        />
      </div>

      <div className="mt-12 grid gap-8 border-t border-border pt-9 sm:grid-cols-3">
        <CapabilityList title="Markets served" items={agg.markets} />
        <CapabilityList title="Delivery methods" items={agg.deliveryMethods} />
        <CapabilityList
          title="Geographic reach"
          items={[...agg.regions, "38 countries · 5 continents"]}
        />
      </div>
    </section>
  )
}

function CapabilityList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-foreground">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            <span className="text-pretty">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SafetySection({ config }: { config: PortfolioConfig }) {
  const agg = aggregateShowcase(selectedProjects(config))
  return (
    <section className="flex flex-col justify-center bg-primary px-10 py-16 text-primary-foreground sm:px-14">
      <Eyebrow light>Safety Record</Eyebrow>
      <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-balance sm:text-5xl">
        Built safely, every shift
      </h2>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/80 text-pretty">
        Safety is the foundation of how we build. Across this portfolio, our teams worked millions
        of hours while holding incident rates well below industry benchmarks.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-white/15 bg-white/10 sm:grid-cols-3">
        <SafetyStat value={`${compactHours(agg.totalSafetyHours)}`} label="Safety work-hours" />
        <SafetyStat value={agg.blendedTrir.toFixed(2)} label="Blended TRIR" />
        <SafetyStat
          value={String(agg.zeroIncidentProjects)}
          label={`Zero-incident ${agg.zeroIncidentProjects === 1 ? "project" : "projects"}`}
        />
      </div>
    </section>
  )
}

function SafetyStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-primary px-8 py-10">
      <div className="font-display text-5xl font-semibold leading-none tracking-tight">{value}</div>
      <div className="mt-3 text-sm text-white/75">{label}</div>
    </div>
  )
}

function ClosingSection({ config }: { config: PortfolioConfig }) {
  return (
    <section className="grid min-h-[520px] grid-cols-1 overflow-hidden bg-card text-card-foreground sm:grid-cols-2">
      <div className="flex flex-col justify-between p-10 sm:p-14">
        <ShowcaseLogo tone="dark" />
        <div>
          <Eyebrow>Let&apos;s build it together</Eyebrow>
          <p className="mt-4 max-w-md font-display text-3xl font-semibold leading-[1.15] tracking-tight text-balance sm:text-4xl">
            The right partner makes complex projects feel certain.
          </p>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground text-pretty">
            {config.preparedFor.trim()
              ? `We would welcome the opportunity to bring this track record to ${config.preparedFor}.`
              : "We would welcome the opportunity to bring this track record to your next project."}
          </p>
        </div>
        <dl className="mt-10 space-y-1.5 text-sm">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-muted-foreground">Office</dt>
            <dd className="font-medium text-foreground">Montgomery, Alabama</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-muted-foreground">Business</dt>
            <dd className="font-medium text-foreground">Development &amp; Pursuits Team</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-muted-foreground">Web</dt>
            <dd className="font-medium text-foreground">buildwithcaddell.example</dd>
          </div>
        </dl>
      </div>
      <ImageSlot
        src="/showcase/closing.png"
        alt="Abstract architectural facade detail"
        className="min-h-[260px] w-full"
      />
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Internal leadership deck sections
 * ------------------------------------------------------------------------- */

function deltaToneClasses(intent: PerfMetric["deltaIntent"]): string {
  switch (intent) {
    case "good":
      return "bg-success-muted text-success-strong"
    case "warn":
      return "bg-warning-muted text-warning-strong"
    case "bad":
      return "bg-danger-muted text-danger-strong"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function InternalCoverSection({ config }: { config: PortfolioConfig }) {
  const metrics = selectedMetrics(config)
  return (
    <section className="flex min-h-[640px] flex-col justify-between bg-primary px-10 py-12 text-primary-foreground sm:px-14 sm:py-14">
      <div className="flex items-start justify-between">
        <ShowcaseLogo tone="light" />
        <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
          Internal · Leadership
        </span>
      </div>

      <div>
        <Eyebrow light>Performance Review</Eyebrow>
        <h1 className="mt-4 max-w-3xl font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl">
          {config.title || "Portfolio Performance Review"}
        </h1>
        {config.intro.trim() ? (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 text-pretty">
            {config.intro}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-white/15 pt-8 sm:grid-cols-4">
        {metrics.slice(0, 4).map((m) => (
          <div key={m.key}>
            <div className="font-heading text-3xl font-semibold leading-none tracking-tight">
              {m.value}
            </div>
            <div className="mt-2 text-xs text-white/70 text-pretty">{m.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function MetricSlideSection({
  metric,
  index,
  total,
  editorial = false,
}: {
  metric: PerfMetric
  index: number
  total: number
  editorial?: boolean
}) {
  return (
    <section className="flex flex-col bg-card px-10 py-12 text-card-foreground sm:px-14 sm:py-14">
      <div className="flex items-center justify-between">
        <Eyebrow>Performance Metric</Eyebrow>
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h2
          className={cn(
            "max-w-2xl text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl",
            headingFont(editorial),
          )}
        >
          {metric.label}
        </h2>
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "text-4xl font-semibold leading-none tracking-tight text-foreground sm:text-5xl",
              headingFont(editorial),
            )}
          >
            {metric.value}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              deltaToneClasses(metric.deltaIntent),
            )}
          >
            {metric.delta}
          </span>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-background/40 p-4">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Trailing 12 months
        </div>
        <MetricMainChart metric={metric} />
      </div>

      <p className="mt-8 max-w-3xl border-t border-border pt-7 text-[15px] leading-relaxed text-foreground/85 text-pretty">
        {metric.narrative}
      </p>
    </section>
  )
}

function InternalClosingSection() {
  return (
    <section className="flex min-h-[420px] flex-col justify-between bg-primary px-10 py-14 text-primary-foreground sm:px-14">
      <ShowcaseLogo tone="light" />
      <div>
        <Eyebrow light>Discussion</Eyebrow>
        <p className="mt-4 max-w-2xl font-heading text-3xl font-semibold leading-[1.15] tracking-tight text-balance sm:text-4xl">
          Questions, priorities, and where to lean in next quarter.
        </p>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/75 text-pretty">
          Prepared from live BuildOS operating data for internal leadership review. Not for external
          distribution.
        </p>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------------------
 * Slide builder + document
 * ------------------------------------------------------------------------- */

export type Slide = { key: string; label: string; node: ReactNode }

export function buildSlides(config: PortfolioConfig): Slide[] {
  const editorial = config.kind === "client"
  const projects = selectedProjects(config)
  const metrics = selectedMetrics(config)
  const slides: Slide[] = []

  // Cover — register-specific.
  if (config.sections.cover) {
    slides.push({
      key: "cover",
      label: "Cover",
      node: editorial ? (
        <CoverSection config={config} />
      ) : (
        <InternalCoverSection config={config} />
      ),
    })
  }

  // Body — selected blocks in their curated order (charts + showcases mixed).
  // Numbering is kept per-kind so the "01 / 0N" counters stay meaningful.
  config.blocks.forEach((ref: BlockRef) => {
    if (ref.kind === "project") {
      const project = projects.find((p) => p.id === ref.id)
      if (!project) return
      const i = projects.indexOf(project)
      slides.push({
        key: `project-${project.id}`,
        label: project.name,
        node: (
          <ProjectShowcaseSection
            project={project}
            index={i}
            total={projects.length}
            editorial={editorial}
          />
        ),
      })
    } else {
      const metric = metrics.find((m) => m.key === ref.key)
      if (!metric) return
      const i = metrics.indexOf(metric)
      slides.push({
        key: `metric-${metric.key}`,
        label: metric.label,
        node: (
          <MetricSlideSection
            metric={metric}
            index={i}
            total={metrics.length}
            editorial={editorial}
          />
        ),
      })
    }
  })

  // Client-only aggregate summary sections, derived from selected projects.
  if (editorial && config.sections.capabilities && projects.length > 0) {
    slides.push({
      key: "capabilities",
      label: "Capabilities",
      node: <CapabilitiesSection config={config} />,
    })
  }
  if (editorial && config.sections.safety && projects.length > 0) {
    slides.push({ key: "safety", label: "Safety", node: <SafetySection config={config} /> })
  }

  // Closing — register-specific.
  if (config.sections.closing) {
    slides.push({
      key: "closing",
      label: "Closing",
      node: editorial ? <ClosingSection config={config} /> : <InternalClosingSection />,
    })
  }

  return slides
}

/** Stacked, paginated document used for preview and print/PDF. */
export function PortfolioDocument({ config }: { config: PortfolioConfig }) {
  const slides = buildSlides(config)
  return (
    <div className="portfolio-doc mx-auto flex w-full max-w-[920px] flex-col gap-8 py-8">
      {slides.map((slide) => (
        <article
          key={slide.key}
          className="portfolio-page overflow-hidden rounded-2xl border border-border bg-card shadow-sm ring-1 ring-black/[0.02]"
        >
          {slide.node}
        </article>
      ))}
    </div>
  )
}

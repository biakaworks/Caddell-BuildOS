"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Presentation,
  Sparkles,
} from "lucide-react"
import { PageContainer, PageHeader } from "@/components/buildos/ui"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  defaultConfig,
  internalConfig,
  reorder as reorderIds,
  selectedProjects,
  toggleSelection,
  type PortfolioConfig,
} from "./config"
import { ALL_SHOWCASE_PROJECTS } from "./config"
import {
  PERFORMANCE_METRICS,
  sortShowcaseProjects,
  type PerfMetricKey,
} from "@/lib/mock-data"
import { ProjectPicker } from "./project-picker"
import { CuratePanel } from "./curate-panel"
import { MetricCuratePanel } from "./metric-curate-panel"
import { PortfolioDocument } from "./portfolio-document"
import { TheaterMode } from "./theater-mode"

type Step = "select" | "curate" | "preview"

const CLIENT_STEPS: { key: Step; label: string }[] = [
  { key: "select", label: "Select projects" },
  { key: "curate", label: "Curate & arrange" },
  { key: "preview", label: "Preview & present" },
]

const INTERNAL_STEPS: { key: Step; label: string }[] = [
  { key: "curate", label: "Curate & arrange" },
  { key: "preview", label: "Preview & present" },
]

/** Auto-suggest the strongest projects when arriving with no/partial selection. */
function suggestStrongest(count = 5): string[] {
  return sortShowcaseProjects(ALL_SHOWCASE_PROJECTS, "value")
    .slice(0, count)
    .map((p) => p.id)
}

export function ShowcaseBuilder() {
  const searchParams = useSearchParams()

  const isInternal = searchParams.get("deck") === "internal"

  // Seed from a deep-link: internal metric deck (?deck=internal&metrics=a,b),
  // a client project deck (?projects=a,b,c), or auto-suggest the strongest.
  const [config, setConfig] = useState<PortfolioConfig>(() => {
    if (isInternal) {
      const metricParam = searchParams.get("metrics")
      const keys = (metricParam ? metricParam.split(",") : [])
        .map((s) => s.trim())
        .filter((k): k is PerfMetricKey =>
          PERFORMANCE_METRICS.some((m) => m.key === k),
        )
      return internalConfig(
        keys.length ? keys : PERFORMANCE_METRICS.map((m) => m.key),
      )
    }
    const base = defaultConfig()
    const param = searchParams.get("projects")
    const seeded = param
      ? param
          .split(",")
          .map((s) => s.trim())
          .filter((id) => ALL_SHOWCASE_PROJECTS.some((p) => p.id === id))
      : []
    const preparedFor = searchParams.get("for") ?? ""
    return {
      ...base,
      preparedFor,
      selectedIds: seeded.length ? seeded : suggestStrongest(),
    }
  })

  // Internal decks skip project selection — start on curate.
  const [step, setStep] = useState<Step>(isInternal ? "curate" : "select")
  const [theater, setTheater] = useState(false)

  const STEPS = isInternal ? INTERNAL_STEPS : CLIENT_STEPS

  const update = (patch: Partial<PortfolioConfig>) =>
    setConfig((c) => ({ ...c, ...patch }))

  const setSelectedIds = (ids: string[]) => update({ selectedIds: ids })
  const toggle = (id: string) => update({ selectedIds: toggleSelection(config.selectedIds, id) })
  const reorderProjects = (from: number, to: number) =>
    update({ selectedIds: reorderIds(config.selectedIds, from, to) })
  const removeProject = (id: string) =>
    update({ selectedIds: config.selectedIds.filter((x) => x !== id) })

  const projects = useMemo(() => selectedProjects(config), [config])
  const itemCount = isInternal ? config.metricKeys.length : projects.length
  const itemNoun = isInternal ? "metric" : "project"
  const canAdvance = itemCount > 0

  const stepIndex = STEPS.findIndex((s) => s.key === step)
  const goNext = () => {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1].key)
  }
  const goBack = () => {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].key)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <>
      <PageContainer>
        <div className="print-hide">
          <PageHeader
            title={isInternal ? "Leadership Deck Builder" : "Portfolio Builder"}
            subtitle={
              isInternal
                ? "Assemble an internal performance deck from selected metrics — then present it live or export a PDF."
                : "Assemble a polished, client-ready portfolio from completed projects — then present it live or export a PDF."
            }
          />

          {/* Stepper */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {STEPS.map((s, i) => {
              const active = s.key === step
              const done = i < stepIndex
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => (i === 0 || canAdvance ? setStep(s.key) : undefined)}
                  disabled={i > 0 && !canAdvance}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "bg-accent text-accent-foreground hover:bg-accent/70"
                        : "bg-secondary text-muted-foreground hover:text-foreground disabled:opacity-50",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-xs",
                      active
                        ? "bg-primary-foreground/20"
                        : done
                          ? "bg-success/15 text-success-strong"
                          : "bg-card",
                    )}
                  >
                    {done ? <Check className="size-3" /> : i + 1}
                  </span>
                  {s.label}
                </button>
              )
            })}

            <div className="ms-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {itemCount} {itemNoun}
                {itemCount === 1 ? "" : "s"} selected
              </span>
            </div>
          </div>
        </div>

        {/* Step body */}
        <div className="print-hide mt-6">
          {step === "select" ? (
            <ProjectPicker selectedIds={config.selectedIds} onChange={setSelectedIds} />
          ) : null}

          {step === "curate" ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
              {isInternal ? (
                <MetricCuratePanel config={config} update={update} />
              ) : (
                <CuratePanel
                  config={config}
                  update={update}
                  reorderProjects={reorderProjects}
                  removeProject={removeProject}
                />
              )}
              <div className="min-w-0">
                <div className="sticky top-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <Sparkles className="size-3.5" />
                    Live preview
                  </div>
                  <div className="max-h-[calc(100vh-9rem)] overflow-auto rounded-2xl border border-border bg-muted/40 p-3">
                    <div className="origin-top scale-[0.82]">
                      <PortfolioDocument config={config} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {step === "preview" ? (
            <div className="rounded-2xl border border-border bg-muted/40 p-3 sm:p-6">
              <PortfolioDocument config={config} />
            </div>
          ) : null}
        </div>

        {/* Sticky action bar */}
        <div className="print-hide sticky bottom-0 z-10 mt-6 flex flex-wrap items-center gap-2 border-t border-border bg-background/85 py-3 backdrop-blur">
          <Button variant="ghost" onClick={goBack} disabled={stepIndex === 0}>
            <ArrowLeft /> Back
          </Button>

          {step !== "preview" ? (
            <Button className="ms-auto" onClick={goNext} disabled={!canAdvance}>
              {step === "select" ? "Curate & arrange" : "Preview & present"}
              <ArrowRight />
            </Button>
          ) : (
            <div className="ms-auto flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={handlePrint} disabled={!canAdvance}>
                <Download /> Export PDF
              </Button>
              <Button onClick={() => setTheater(true)} disabled={!canAdvance}>
                <Presentation /> Present
              </Button>
            </div>
          )}
        </div>
      </PageContainer>

      {/* Document is always mounted (hidden on screen) so it is printable from any step. */}
      {step !== "preview" ? (
        <div className="sr-only" aria-hidden>
          <div className="hidden print:block">
            <PortfolioDocument config={config} />
          </div>
        </div>
      ) : null}

      {theater ? <TheaterMode config={config} onClose={() => setTheater(false)} /> : null}
    </>
  )
}

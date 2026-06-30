"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, GripVertical, X } from "lucide-react"
import { getPerfMetric, type PerfMetricKey } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { reorder as reorderIds, type PortfolioConfig } from "./config"

const inputClass =
  "w-full rounded-lg bg-card px-3 py-2 text-sm text-foreground ring-1 ring-border outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {hint ? <span className="ml-2 text-xs text-muted-foreground">{hint}</span> : null}
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
        checked
          ? "border-primary/30 bg-primary/5 text-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      <span className="font-medium">{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted-foreground/30",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-white transition-all",
            checked ? "left-[18px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  )
}

export function MetricCuratePanel({
  config,
  update,
}: {
  config: PortfolioConfig
  update: (patch: Partial<PortfolioConfig>) => void
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const keys = config.metricKeys

  const reorderMetrics = (from: number, to: number) =>
    update({ metricKeys: reorderIds(keys, from, to) as PerfMetricKey[] })
  const removeMetric = (key: PerfMetricKey) =>
    update({ metricKeys: keys.filter((k) => k !== key) })

  return (
    <div className="flex flex-col gap-7">
      {/* Cover content */}
      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">Cover</h3>
        <Field label="Title">
          <input
            className={inputClass}
            value={config.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Portfolio Performance Review"
            maxLength={80}
          />
        </Field>
        <Field label="Intro line" hint="optional">
          <textarea
            className={cn(inputClass, "min-h-[72px] resize-y")}
            value={config.intro}
            onChange={(e) => update({ intro: e.target.value })}
            placeholder="A short framing statement for leadership."
            maxLength={260}
          />
        </Field>
      </section>

      {/* Metric order */}
      <section className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Metric order</h3>
          <p className="text-xs text-muted-foreground">Drag to reorder, or use the arrows.</p>
        </div>
        {keys.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
            No metrics selected yet.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {keys.map((key, i) => {
              const metric = getPerfMetric(key)
              if (!metric) return null
              return (
                <li
                  key={key}
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null && dragIndex !== i) reorderMetrics(dragIndex, i)
                    setDragIndex(null)
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border border-border bg-card p-2 text-sm transition-shadow",
                    dragIndex === i && "opacity-60 shadow-md",
                  )}
                >
                  <GripVertical
                    className="size-4 shrink-0 cursor-grab text-muted-foreground"
                    aria-hidden
                  />
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary tabular-nums">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {metric.label}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {metric.value}
                  </span>
                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => reorderMetrics(i, i - 1)}
                      disabled={i === 0}
                      aria-label={`Move ${metric.label} up`}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => reorderMetrics(i, i + 1)}
                      disabled={i === keys.length - 1}
                      aria-label={`Move ${metric.label} down`}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMetric(key)}
                      aria-label={`Remove ${metric.label}`}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* Sections */}
      <section className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Sections</h3>
          <p className="text-xs text-muted-foreground">Toggle the cover and closing slides.</p>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <Toggle
            checked={config.sections.cover}
            onChange={() =>
              update({ sections: { ...config.sections, cover: !config.sections.cover } })
            }
            label="Cover"
          />
          <Toggle
            checked={config.sections.closing}
            onChange={() =>
              update({ sections: { ...config.sections, closing: !config.sections.closing } })
            }
            label="Closing"
          />
        </div>
      </section>
    </div>
  )
}

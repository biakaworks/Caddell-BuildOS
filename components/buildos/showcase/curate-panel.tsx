"use client"

import { useState } from "react"
import { BarChart3, Building2, ChevronDown, ChevronUp, GripVertical, X } from "lucide-react"
import { COMPANY_STATS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import {
  CLIENT_ONLY_SECTIONS,
  SECTION_LABELS,
  SECTION_ORDER,
  blockId,
  blockTitle,
  type BlockRef,
  type PortfolioConfig,
  type SectionKey,
} from "./config"

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

const inputClass =
  "w-full rounded-lg bg-card px-3 py-2 text-sm text-foreground ring-1 ring-border outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"

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

export function CuratePanel({
  config,
  update,
  reorderBlock,
  removeBlock,
}: {
  config: PortfolioConfig
  update: (patch: Partial<PortfolioConfig>) => void
  reorderBlock: (from: number, to: number) => void
  removeBlock: (ref: BlockRef) => void
}) {
  const isClient = config.kind === "client"
  const blocks = config.blocks
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  function toggleSection(key: SectionKey) {
    update({ sections: { ...config.sections, [key]: !config.sections[key] } })
  }

  function toggleStat(i: number) {
    const next = [...config.enabledStats]
    next[i] = !next[i]
    update({ enabledStats: next })
  }

  // Internal decks don't show the client-only summary sections.
  const sectionKeys = SECTION_ORDER.filter(
    (k) => isClient || !CLIENT_ONLY_SECTIONS.includes(k),
  )

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
            placeholder={isClient ? "Capabilities Portfolio" : "Portfolio Performance Review"}
            maxLength={80}
          />
        </Field>
        <Field label="Intro line" hint="optional">
          <textarea
            className={cn(inputClass, "min-h-[72px] resize-y")}
            value={config.intro}
            onChange={(e) => update({ intro: e.target.value })}
            placeholder="A short, confident statement that frames the deck."
            maxLength={260}
          />
        </Field>
        {isClient ? (
          <Field label="Prepared for" hint="optional">
            <input
              className={inputClass}
              value={config.preparedFor}
              onChange={(e) => update({ preparedFor: e.target.value })}
              placeholder="e.g. Federal agency or client name"
              maxLength={60}
            />
          </Field>
        ) : null}
      </section>

      {/* Highlight stats — cover figures (client decks only) */}
      {isClient ? (
        <section className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Highlight stats</h3>
            <p className="text-xs text-muted-foreground">Company figures shown on the cover.</p>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {COMPANY_STATS.map((s, i) => (
              <Toggle
                key={s.label}
                checked={config.enabledStats[i]}
                onChange={() => toggleStat(i)}
                label={`${s.value} — ${s.label}`}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Block order — mixed charts + showcases */}
      <section className="flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Slide order</h3>
          <p className="text-xs text-muted-foreground">Drag to reorder, or use the arrows.</p>
        </div>
        {blocks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
            Nothing selected yet — go back to add charts or projects.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {blocks.map((b, i) => {
              const id = blockId(b)
              const title = blockTitle(b)
              const Icon = b.kind === "metric" ? BarChart3 : Building2
              return (
                <li
                  key={id}
                  draggable
                  onDragStart={() => setDragIndex(i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null && dragIndex !== i) reorderBlock(dragIndex, i)
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
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      b.kind === "metric" ? "text-chart-1" : "text-muted-foreground",
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {title}
                  </span>
                  <span className="sr-only">
                    {b.kind === "metric" ? "Chart" : "Project showcase"}
                  </span>
                  <div className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => reorderBlock(i, i - 1)}
                      disabled={i === 0}
                      aria-label={`Move ${title} up`}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => reorderBlock(i, i + 1)}
                      disabled={i === blocks.length - 1}
                      aria-label={`Move ${title} down`}
                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeBlock(b)}
                      aria-label={`Remove ${title}`}
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
          <p className="text-xs text-muted-foreground">Toggle the framing slides.</p>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {sectionKeys.map((key) => (
            <Toggle
              key={key}
              checked={config.sections[key]}
              onChange={() => toggleSection(key)}
              label={SECTION_LABELS[key]}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

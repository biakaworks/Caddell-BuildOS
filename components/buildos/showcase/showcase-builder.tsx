"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Download,
  LineChart,
  Presentation,
  Sparkles,
} from "lucide-react"
import { useApp } from "@/components/buildos/app-context"
import { PageContainer, PageHeader } from "@/components/buildos/ui"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  applyKind,
  defaultConfig,
  hasBlock,
  isClientSafe,
  parseBlockId,
  removeBlock as removeBlockOp,
  reorderBlocks,
  toggleBlock,
  type BlockRef,
  type DeckKind,
  type PortfolioConfig,
} from "./config"
import { BlockPicker } from "./block-picker"
import { CuratePanel } from "./curate-panel"
import { PortfolioDocument } from "./portfolio-document"
import { TheaterMode } from "./theater-mode"

type Step = "select" | "curate" | "preview"

const STEPS: { key: Step; label: string }[] = [
  { key: "select", label: "Select content" },
  { key: "curate", label: "Curate & arrange" },
  { key: "preview", label: "Preview & present" },
]

const DECK_TYPES: {
  kind: DeckKind
  label: string
  description: string
  icon: typeof Building2
}[] = [
  {
    kind: "client",
    label: "Client portfolio",
    description: "Editorial, client-ready capabilities deck. Client-safe content only.",
    icon: Building2,
  },
  {
    kind: "internal",
    label: "Internal leadership",
    description: "Performance review for leadership. All metrics available.",
    icon: LineChart,
  },
]

export function ShowcaseBuilder() {
  const searchParams = useSearchParams()
  const { stagedBlocks, clearStaged } = useApp()

  // Seed the deck kind + blocks from the deep-link and any staged blocks
  // carried over from the Reporting chart library.
  const [config, setConfig] = useState<PortfolioConfig>(() => {
    // Blocks from ?blocks=metric:winRate,project:abc — falls back to staged.
    const blockParam = searchParams.get("blocks")
    const ids = blockParam ? blockParam.split(",") : stagedBlocks
    const seeded = ids
      .map((id) => parseBlockId(id.trim()))
      .filter((b): b is BlockRef => Boolean(b))

    // Deck kind: honor ?deck=, otherwise infer from the seeded blocks so an
    // internal-only chart selection doesn't get silently dropped by the
    // client guardrail. Mixed/internal content opens as an internal deck.
    const deckParam = searchParams.get("deck")
    const kind: DeckKind =
      deckParam === "internal"
        ? "internal"
        : deckParam === "client"
          ? "client"
          : seeded.some((b) => !isClientSafe(b))
            ? "internal"
            : "client"

    const base = defaultConfig(kind)
    const preparedFor = searchParams.get("for") ?? ""
    const seededConfig: PortfolioConfig = { ...base, preparedFor, blocks: seeded }
    // Enforce the client guardrail when we land as a client deck.
    return kind === "client"
      ? { ...seededConfig, blocks: seeded.filter(isClientSafe) }
      : seededConfig
  })

  const [step, setStep] = useState<Step>("select")
  const [theater, setTheater] = useState(false)

  // The staging tray is a transport from Reporting → Builder. Once its blocks
  // have seeded the initial config, empty the tray so it doesn't re-apply.
  useEffect(() => {
    if (stagedBlocks.length) clearStaged()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const update = (patch: Partial<PortfolioConfig>) => setConfig((c) => ({ ...c, ...patch }))

  const toggle = (ref: BlockRef) => update({ blocks: toggleBlock(config.blocks, ref) })
  const addBlocks = (refs: BlockRef[]) =>
    setConfig((c) => {
      const next = [...c.blocks]
      for (const ref of refs) if (!hasBlock(next, ref)) next.push(ref)
      return { ...c, blocks: next }
    })
  const reorderBlock = (from: number, to: number) =>
    update({ blocks: reorderBlocks(config.blocks, from, to) })
  const removeBlock = (ref: BlockRef) => update({ blocks: removeBlockOp(config.blocks, ref) })

  function setKind(kind: DeckKind) {
    setConfig((c) => applyKind(c, kind))
  }

  const blockCount = config.blocks.length
  const canAdvance = blockCount > 0

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
            title="Portfolio Builder"
            subtitle="Assemble a deck from live charts and project showcases — then present it live or export a PDF."
          />

          {/* Deck type toggle */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {DECK_TYPES.map((t) => {
              const active = config.kind === t.kind
              const Icon = t.icon
              return (
                <button
                  key={t.kind}
                  type="button"
                  onClick={() => setKind(t.kind)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-muted-foreground/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      {t.label}
                      {active ? <Check className="size-4 text-primary" /> : null}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground text-pretty">
                      {t.description}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

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
                {blockCount} slide{blockCount === 1 ? "" : "s"} selected
              </span>
            </div>
          </div>
        </div>

        {/* Step body */}
        <div className="print-hide mt-6">
          {step === "select" ? (
            <BlockPicker
              kind={config.kind}
              blocks={config.blocks}
              onToggle={toggle}
              addBlocks={addBlocks}
            />
          ) : null}

          {step === "curate" ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
              <CuratePanel
                config={config}
                update={update}
                reorderBlock={reorderBlock}
                removeBlock={removeBlock}
              />
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

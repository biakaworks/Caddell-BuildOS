import {
  COMPANY_STATS,
  PERFORMANCE_METRICS,
  SHOWCASE_PROJECTS,
  getPerfMetric,
  getShowcaseProject,
  type PerfMetric,
  type PerfMetricKey,
  type ShowcaseProject,
} from "@/lib/mock-data"

/** Which kind of deck the builder is assembling. */
export type DeckKind = "client" | "internal"

/**
 * A single selectable block. Metric blocks reference the chart data/components
 * that live in Reporting (the single source of truth); project blocks
 * reference the showcase catalog. The builder never duplicates this data.
 */
export type BlockRef =
  | { kind: "metric"; key: PerfMetricKey }
  | { kind: "project"; id: string }

export type SectionKey = "cover" | "capabilities" | "safety" | "closing"

export const SECTION_ORDER: SectionKey[] = ["cover", "capabilities", "safety", "closing"]

export const SECTION_LABELS: Record<SectionKey, string> = {
  cover: "Cover",
  capabilities: "Capabilities summary",
  safety: "Safety record",
  closing: "Closing",
}

/** Sections that only make sense for a client capabilities portfolio. */
export const CLIENT_ONLY_SECTIONS: SectionKey[] = ["capabilities", "safety"]

export type PortfolioConfig = {
  /** "client" = capabilities portfolio; "internal" = leadership deck. */
  kind: DeckKind
  title: string
  intro: string
  preparedFor: string
  /** Ordered, mixed selection of chart + project blocks (drag order preserved). */
  blocks: BlockRef[]
  /** Which cover company stats are shown, aligned to COMPANY_STATS index. */
  enabledStats: boolean[]
  sections: Record<SectionKey, boolean>
}

/* ---------------------------------------------------------------------------
 * Block id encoding + identity
 * ------------------------------------------------------------------------- */

export function blockId(ref: BlockRef): string {
  return ref.kind === "metric" ? `metric:${ref.key}` : `project:${ref.id}`
}

export function parseBlockId(id: string): BlockRef | null {
  const sep = id.indexOf(":")
  if (sep === -1) return null
  const kind = id.slice(0, sep)
  const rest = id.slice(sep + 1)
  if (kind === "metric" && PERFORMANCE_METRICS.some((m) => m.key === rest)) {
    return { kind: "metric", key: rest as PerfMetricKey }
  }
  if (kind === "project" && SHOWCASE_PROJECTS.some((p) => p.id === rest)) {
    return { kind: "project", id: rest }
  }
  return null
}

export function sameBlock(a: BlockRef, b: BlockRef): boolean {
  return blockId(a) === blockId(b)
}

export function hasBlock(blocks: BlockRef[], ref: BlockRef): boolean {
  return blocks.some((b) => sameBlock(b, ref))
}

export function blockTitle(ref: BlockRef): string {
  if (ref.kind === "metric") return getPerfMetric(ref.key)?.label ?? ref.key
  return getShowcaseProject(ref.id)?.name ?? ref.id
}

/** Client-facing decks may only include client-safe blocks. */
export function isClientSafe(ref: BlockRef): boolean {
  if (ref.kind === "project") return true
  return getPerfMetric(ref.key)?.deck === "both"
}

/* ---------------------------------------------------------------------------
 * Selection operations (ordered, mixed)
 * ------------------------------------------------------------------------- */

export function toggleBlock(blocks: BlockRef[], ref: BlockRef): BlockRef[] {
  return hasBlock(blocks, ref)
    ? blocks.filter((b) => !sameBlock(b, ref))
    : [...blocks, ref]
}

export function removeBlock(blocks: BlockRef[], ref: BlockRef): BlockRef[] {
  return blocks.filter((b) => !sameBlock(b, ref))
}

export function reorderBlocks(blocks: BlockRef[], from: number, to: number): BlockRef[] {
  if (from === to || from < 0 || to < 0 || from >= blocks.length || to >= blocks.length) {
    return blocks
  }
  const next = [...blocks]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

/* ---------------------------------------------------------------------------
 * Resolvers
 * ------------------------------------------------------------------------- */

/** Ordered, selected projects (preserving drag order across mixed blocks). */
export function selectedProjects(config: PortfolioConfig): ShowcaseProject[] {
  return config.blocks
    .filter((b): b is Extract<BlockRef, { kind: "project" }> => b.kind === "project")
    .map((b) => getShowcaseProject(b.id))
    .filter((p): p is ShowcaseProject => Boolean(p))
}

/** Ordered, selected metrics. */
export function selectedMetrics(config: PortfolioConfig): PerfMetric[] {
  return config.blocks
    .filter((b): b is Extract<BlockRef, { kind: "metric" }> => b.kind === "metric")
    .map((b) => getPerfMetric(b.key))
    .filter((m): m is PerfMetric => Boolean(m))
}

/* ---------------------------------------------------------------------------
 * Defaults + register switching
 * ------------------------------------------------------------------------- */

function clientDefaults(): PortfolioConfig {
  return {
    kind: "client",
    title: "Capabilities Portfolio",
    intro:
      "A selection of completed projects that demonstrate our ability to deliver complex, mission-critical work — safely, on schedule, and on budget.",
    preparedFor: "",
    blocks: [],
    enabledStats: COMPANY_STATS.map(() => true),
    sections: { cover: true, capabilities: true, safety: true, closing: true },
  }
}

function internalDefaults(): PortfolioConfig {
  return {
    ...clientDefaults(),
    kind: "internal",
    title: "Portfolio Performance Review",
    intro:
      "A leadership view of portfolio performance across pipeline, delivery, and safety — drawn from live operating data.",
    sections: { cover: true, capabilities: false, safety: false, closing: true },
  }
}

export function defaultConfig(kind: DeckKind = "client"): PortfolioConfig {
  return kind === "internal" ? internalDefaults() : clientDefaults()
}

/**
 * Switch the deck register. Resets register-specific copy + sections and, for
 * client decks, drops any blocks that are not client-safe (guardrail). The
 * current selection and prepared-for line are preserved where valid.
 */
export function applyKind(config: PortfolioConfig, kind: DeckKind): PortfolioConfig {
  if (config.kind === kind) return config
  const defaults = defaultConfig(kind)
  const blocks = kind === "client" ? config.blocks.filter(isClientSafe) : config.blocks
  return {
    ...config,
    kind,
    title: defaults.title,
    intro: defaults.intro,
    blocks,
    sections: defaults.sections,
  }
}

export const ALL_SHOWCASE_PROJECTS = SHOWCASE_PROJECTS

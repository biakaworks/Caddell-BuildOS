import {
  COMPANY_STATS,
  SHOWCASE_PROJECTS,
  getShowcaseProject,
  type ShowcaseProject,
} from "@/lib/mock-data"

export type SectionKey = "cover" | "showcases" | "capabilities" | "safety" | "closing"

export const SECTION_ORDER: SectionKey[] = [
  "cover",
  "showcases",
  "capabilities",
  "safety",
  "closing",
]

export const SECTION_LABELS: Record<SectionKey, string> = {
  cover: "Cover",
  showcases: "Project showcases",
  capabilities: "Capabilities summary",
  safety: "Safety record",
  closing: "Closing",
}

export type PortfolioConfig = {
  title: string
  intro: string
  preparedFor: string
  /** Ordered list of selected project ids (drag order is preserved). */
  selectedIds: string[]
  /** Which cover company stats are shown, aligned to COMPANY_STATS index. */
  enabledStats: boolean[]
  sections: Record<SectionKey, boolean>
}

export function defaultConfig(): PortfolioConfig {
  return {
    title: "Capabilities Portfolio",
    intro:
      "A selection of completed projects that demonstrate our ability to deliver complex, mission-critical work — safely, on schedule, and on budget.",
    preparedFor: "",
    selectedIds: [],
    enabledStats: COMPANY_STATS.map(() => true),
    sections: {
      cover: true,
      showcases: true,
      capabilities: true,
      safety: true,
      closing: true,
    },
  }
}

/** Resolve the ordered, selected projects from a config. */
export function selectedProjects(config: PortfolioConfig): ShowcaseProject[] {
  return config.selectedIds
    .map((id) => getShowcaseProject(id))
    .filter((p): p is ShowcaseProject => Boolean(p))
}

/** Toggle a project id in/out of the ordered selection. */
export function toggleSelection(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
}

/** Move an item within the ordered selection (for drag reorder). */
export function reorder(ids: string[], from: number, to: number): string[] {
  if (from === to || from < 0 || to < 0 || from >= ids.length || to >= ids.length) return ids
  const next = [...ids]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export const ALL_SHOWCASE_PROJECTS = SHOWCASE_PROJECTS

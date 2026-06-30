"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  FileText,
  FileBox,
  Image as ImageIcon,
  ClipboardCheck,
  FileSpreadsheet,
  Search,
  Sparkles,
  ArrowUpRight,
} from "lucide-react"
import { KNOWLEDGE_DOCS, getProjectSlugByName, type KnowledgeDoc } from "@/lib/mock-data"
import { useApp } from "@/components/buildos/app-context"
import { PageContainer, PageHeader } from "@/components/buildos/ui"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TYPE_ICON: Record<KnowledgeDoc["type"], typeof FileText> = {
  Drawing: FileBox,
  Spec: FileText,
  Closeout: ClipboardCheck,
  Photo: ImageIcon,
  Report: FileSpreadsheet,
}

const SYSTEMS = ["All", "Facade", "Enclosure", "Electrical", "Mechanical", "Structure", "Logistics"]

export function KnowledgeView({ initialQuery }: { initialQuery?: string }) {
  const { unit, openAsk } = useApp()
  const [query, setQuery] = useState(initialQuery ?? "")
  const [system, setSystem] = useState("All")

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return KNOWLEDGE_DOCS.filter((d) => {
      if (unit !== "All" && d.unit !== unit) return false
      if (system !== "All" && d.system !== system) return false
      if (q && !`${d.title} ${d.project} ${d.market} ${d.snippet} ${d.system}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [unit, system, query])

  return (
    <PageContainer>
      <PageHeader
        title="Knowledge"
        subtitle="Searchable institutional memory — drawings, specs, closeouts, and lessons learned across every project."
      >
        <Button onClick={() => openAsk(query ? `Search the knowledge base for: ${query}` : "What have we learned about long-lead switchgear procurement?")}>
          <Sparkles className="size-4" />
          Ask BuildOS
        </Button>
      </PageHeader>

      {/* Search */}
      <div className="mt-6 rounded-2xl bg-card p-4 ring-1 ring-border">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, systems, lessons learned…"
            className="h-11 w-full rounded-xl bg-muted/60 pl-10 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {SYSTEMS.map((s) => (
            <button
              key={s}
              onClick={() => setSystem(s)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                system === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <p className="mt-5 text-sm text-muted-foreground">
        {results.length} {results.length === 1 ? "document" : "documents"}
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        {results.map((doc) => (
          <DocCard key={doc.id} doc={doc} onAsk={openAsk} />
        ))}
        {results.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No documents match. Try Ask BuildOS for a broader search.
          </div>
        ) : null}
      </div>
    </PageContainer>
  )
}

function DocCard({ doc, onAsk }: { doc: KnowledgeDoc; onAsk: (seed?: string) => void }) {
  const Icon = TYPE_ICON[doc.type]
  const slug = getProjectSlugByName(doc.project)

  const body = (
    <>
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground text-balance">{doc.title}</h3>
          <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {doc.type}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {doc.project} · {doc.date}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">{doc.snippet}</p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Tag>{doc.system}</Tag>
          <Tag>{doc.phase}</Tag>
          <Tag>{doc.delivery}</Tag>
          <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
            {slug ? "Open project" : "Open record"}
            <ArrowUpRight className="size-3.5" />
          </span>
        </div>
      </div>
    </>
  )

  const className =
    "flex w-full gap-4 rounded-2xl bg-card p-4 text-left ring-1 ring-border transition-all hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

  // "Open a source record": tied to a built project → navigate there; otherwise
  // open Ask BuildOS to summarize the underlying record.
  if (slug) {
    return (
      <Link href={`/projects/${slug}`} className={className}>
        {body}
      </Link>
    )
  }
  return (
    <button
      type="button"
      onClick={() => onAsk(`Open and summarize the source record "${doc.title}" from ${doc.project}.`)}
      className={className}
    >
      {body}
    </button>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{children}</span>
  )
}

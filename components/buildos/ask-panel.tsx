"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  Sparkles,
  ArrowUp,
  FileText,
  ShieldCheck,
  Lock,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  ArrowUpRight,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useApp } from "./app-context"
import { cn } from "@/lib/utils"

type Citation = { id: number; label: string; source: string; href: string }
type Draft = {
  title: string
  body: { text: string; cite?: number }[]
  citations: Citation[]
}

const SUGGESTIONS = [
  "Draft win themes for the Coastal Data Center pursuit",
  "Summarize open RFIs on Regional Logistics Center",
  "What did we learn from prior courthouse projects?",
  "Outline a Go/No-Go rationale for the Port Terminal",
]

function buildDraft(query: string): Draft {
  const q = query.toLowerCase()
  if (q.includes("rfi") || q.includes("logistics")) {
    return {
      title: "Open RFI summary — Regional Logistics Center",
      body: [
        { text: "There are 4 open RFIs. The critical item is " },
        { text: "RFI-204 (curtain wall embed conflict), now 9 days overdue", cite: 1 },
        { text: " and eroding float on the building-enclosed milestone. " },
        { text: "RFI-211 and RFI-209 remain within their response windows", cite: 2 },
        { text: ". Recommend escalating RFI-204 to the structural EOR and confirming the recovery plan." },
      ],
      citations: [
        { id: 1, label: "RFI-204 record", source: "Regional Logistics Center · RFIs", href: "/projects/regional-logistics-center?tab=rfis" },
        { id: 2, label: "RFI log", source: "Regional Logistics Center · RFIs", href: "/projects/regional-logistics-center?tab=rfis" },
      ],
    }
  }
  if (q.includes("courthouse") || q.includes("learn") || q.includes("prior")) {
    return {
      title: "Lessons from prior justice/civic projects",
      body: [
        { text: "On the " },
        { text: "Federal Courthouse Renovation (2020), occupied-facility phasing kept the court fully operational", cite: 1 },
        { text: " across five phases. Security zoning handoffs were the main coordination risk. " },
        { text: "GMP transparency was repeatedly cited as a win theme", cite: 2 },
        { text: " in CMaR pursuits with public clients." },
      ],
      citations: [
        { id: 1, label: "Occupied-facility phasing plan", source: "Federal Courthouse Renovation · Closeout", href: "/projects/federal-courthouse-renovation?tab=schedule" },
        { id: 2, label: "Pursuit debrief notes", source: "Knowledge · Civic", href: "/knowledge?q=courthouse" },
      ],
    }
  }
  if (q.includes("port") || q.includes("go") || q.includes("no-go")) {
    return {
      title: "Go/No-Go rationale — International Port Terminal",
      body: [
        { text: "This is a high-value ($320M) marine pursuit with elevated risk. " },
        { text: "We have no directly comparable marine terminal in our track record", cite: 1 },
        { text: ", which raises self-perform and partner-vetting concerns. " },
        { text: "Geotechnical and crane-rail scope warrant a specialist JV before committing", cite: 2 },
        { text: ". Recommend a conditional Go pending due-diligence gate." },
      ],
      citations: [
        { id: 1, label: "Pursuit track record", source: "Pursuits · International", href: "/pursuits" },
        { id: 2, label: "Marine works risk register", source: "Knowledge · Infrastructure", href: "/knowledge?q=marine" },
      ],
    }
  }
  return {
    title: "Win themes — Coastal Data Center Campus",
    body: [
      { text: "Three themes are well-supported by our history. First, " },
      { text: "speed-to-power: we energized Inland Hyperscale Phase II six weeks early", cite: 1 },
      { text: " using an owner-direct switchgear strategy. Second, self-perform concrete for schedule control. Third, " },
      { text: "a strong safety record — zero recordables across 540K craft hours on Regional Cloud Node", cite: 2 },
      { text: ". Lead with speed-to-power as the differentiator." },
    ],
    citations: [
      { id: 1, label: "Switchgear procurement log", source: "Inland Hyperscale Phase II · Closeout", href: "/knowledge?q=switchgear" },
      { id: 2, label: "Safety summary", source: "Regional Cloud Node · Closeout", href: "/knowledge?q=safety" },
    ],
  }
}

export function AskPanel() {
  const { askOpen, setAskOpen, askSeed } = useApp()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<"idle" | "thinking" | "done">("idle")
  const [draft, setDraft] = useState<Draft | null>(null)
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function copyDraft() {
    if (!draft) return
    const text = `${draft.title}\n\n${draft.body.map((s) => s.text).join("")}`
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      },
      () => {},
    )
  }

  useEffect(() => {
    if (askOpen && askSeed) {
      setQuery(askSeed)
    }
  }, [askOpen, askSeed])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  function run(q: string) {
    const text = q.trim()
    if (!text) return
    setQuery(text)
    setStatus("thinking")
    setDraft(null)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setDraft(buildDraft(text))
      setStatus("done")
    }, 950)
  }

  function reset() {
    setQuery("")
    setStatus("idle")
    setDraft(null)
  }

  return (
    <Sheet
      open={askOpen}
      onOpenChange={(o) => {
        setAskOpen(o)
        if (!o) reset()
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        showCloseButton
      >
        <SheetHeader className="gap-1 border-b border-border bg-secondary/40 p-5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <SheetTitle className="text-base">Ask BuildOS</SheetTitle>
          </div>
          <SheetDescription className="flex items-center gap-1.5">
            <Lock className="size-3" />
            Grounded only in Caddell&apos;s own project data
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {status === "idle" && (
            <div className="space-y-5">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  I draft pursuit content and summarize RFIs and documents using
                  Caddell&apos;s history. Every answer is a starting point with
                  citations — review before use.
                </p>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
                  SUGGESTED
                </p>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => run(s)}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
                    >
                      <Sparkles className="size-3.5 shrink-0 text-primary" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {status !== "idle" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
                  {query}
                </p>
              </div>

              {status === "thinking" && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="size-4 animate-pulse text-primary" />
                    Searching Caddell records…
                  </div>
                  <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-full animate-pulse rounded bg-muted" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                </div>
              )}

              {status === "done" && draft && (
                <div className="space-y-3">
                  <Badge variant="outline" className="border-warning/40 bg-warning-muted text-[oklch(0.44_0.1_60)]">
                    <ShieldCheck className="size-3" />
                    Draft — for human review
                  </Badge>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="font-heading text-sm font-semibold text-foreground">
                      {draft.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">
                      {draft.body.map((seg, i) => (
                        <span key={i}>
                          {seg.text}
                          {seg.cite && (
                            <sup className="ml-0.5 inline-flex items-center rounded bg-primary/10 px-1 text-[10px] font-semibold text-primary">
                              {seg.cite}
                            </sup>
                          )}
                        </span>
                      ))}
                    </p>
                    <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
                      <Button variant="ghost" size="xs" onClick={copyDraft} className="text-muted-foreground">
                        {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button variant="ghost" size="icon-xs" aria-label="Helpful" className="text-muted-foreground">
                        <ThumbsUp />
                      </Button>
                      <Button variant="ghost" size="icon-xs" aria-label="Not helpful" className="text-muted-foreground">
                        <ThumbsDown />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
                      SOURCES
                    </p>
                    <div className="space-y-2">
                      {draft.citations.map((c) => (
                        <Link
                          key={c.id}
                          href={c.href}
                          onClick={() => setAskOpen(false)}
                          className="group flex items-start gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded bg-primary/10 text-[10px] font-semibold text-primary">
                            {c.id}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                              <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                              {c.label}
                            </div>
                            <div className="truncate text-xs text-muted-foreground">{c.source}</div>
                          </div>
                          <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground">
                    Ask something else
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <form
          className="border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault()
            run(query)
          }}
        >
          <div className="flex items-end gap-2 rounded-xl border border-border bg-card p-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about pursuits, RFIs, or history…"
              aria-label="Ask BuildOS"
              className="h-8 flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                  e.preventDefault()
                  run(query)
                }
              }}
            />
            <Button type="submit" size="icon-sm" disabled={!query.trim()} aria-label="Send">
              <ArrowUp />
            </Button>
          </div>
          <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">
            BuildOS can make mistakes. Verify drafts against source records.
          </p>
        </form>
      </SheetContent>
    </Sheet>
  )
}

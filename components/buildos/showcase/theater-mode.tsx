"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { buildSlides } from "./portfolio-document"
import type { PortfolioConfig } from "./config"

export function TheaterMode({
  config,
  onClose,
}: {
  config: PortfolioConfig
  onClose: () => void
}) {
  const slides = buildSlides(config)
  const [index, setIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)

  const count = slides.length
  const clamped = Math.min(index, Math.max(0, count - 1))

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, count - 1)), [count])
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), [])

  // Lock scroll, capture focus, and restore it on exit.
  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    containerRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      restoreFocusRef.current?.focus?.()
    }
  }, [])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault()
          onClose()
          break
        case "ArrowRight":
        case " ":
        case "Spacebar":
        case "Enter":
        case "PageDown":
          e.preventDefault()
          next()
          break
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault()
          prev()
          break
        case "Home":
          e.preventDefault()
          setIndex(0)
          break
        case "End":
          e.preventDefault()
          setIndex(count - 1)
          break
      }
    },
    [next, prev, onClose, count],
  )

  if (count === 0) return null
  const current = slides[clamped]

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio presentation"
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-[80] flex flex-col bg-neutral-950 outline-none"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 text-white/80">
        <span className="text-xs font-medium uppercase tracking-[0.2em]">
          {config.title || "Capabilities Portfolio"}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs tabular-nums text-white/60">
            {clamped + 1} / {count}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-white/80 ring-1 ring-white/20 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
            Exit
            <kbd className="ml-1 hidden rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium sm:inline">
              Esc
            </kbd>
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-16">
        <button
          type="button"
          onClick={prev}
          disabled={clamped === 0}
          aria-label="Previous slide"
          className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 disabled:pointer-events-none disabled:opacity-30 sm:flex"
        >
          <ChevronLeft className="size-6" />
        </button>

        <div className="flex h-full w-full max-w-[1120px] items-center justify-center">
          <div
            key={current.key}
            className="max-h-full w-full overflow-y-auto rounded-2xl bg-card shadow-2xl motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300"
          >
            {current.node}
          </div>
        </div>

        <button
          type="button"
          onClick={next}
          disabled={clamped === count - 1}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 disabled:pointer-events-none disabled:opacity-30 sm:flex"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>

      {/* Slide indicators */}
      <div className="flex items-center justify-center gap-2 px-4 py-4">
        {slides.map((s, i) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to ${s.label}`}
            aria-current={i === clamped ? "true" : undefined}
            className={cn(
              "h-1.5 rounded-full transition-all motion-reduce:transition-none",
              i === clamped ? "w-8 bg-white" : "w-3 bg-white/30 hover:bg-white/50",
            )}
          />
        ))}
      </div>

      {/* Mobile prev/next */}
      <div className="flex items-center justify-between gap-3 px-4 pb-4 sm:hidden">
        <button
          type="button"
          onClick={prev}
          disabled={clamped === 0}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/10 py-2.5 text-sm font-medium text-white disabled:opacity-30"
        >
          <ChevronLeft className="size-4" /> Prev
        </button>
        <button
          type="button"
          onClick={next}
          disabled={clamped === count - 1}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/10 py-2.5 text-sm font-medium text-white disabled:opacity-30"
        >
          Next <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

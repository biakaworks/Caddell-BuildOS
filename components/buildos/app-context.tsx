"use client"

import { createContext, use, useMemo, useState } from "react"
import type { BusinessUnit } from "@/lib/mock-data"

type UnitFilter = BusinessUnit | "All"

type AppContextValue = {
  unit: UnitFilter
  setUnit: (u: UnitFilter) => void
  askOpen: boolean
  setAskOpen: (v: boolean) => void
  askSeed: string
  openAsk: (seed?: string) => void
  ownerView: boolean
  setOwnerView: (v: boolean) => void
  /**
   * Block ids staged from the Reporting chart library, waiting to be pulled
   * into the Portfolio Builder. Persisted across route navigation because the
   * provider lives in the root shell.
   */
  stagedBlocks: string[]
  isStaged: (id: string) => boolean
  toggleStaged: (id: string) => void
  unstageBlock: (id: string) => void
  clearStaged: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnit] = useState<UnitFilter>("All")
  const [askOpen, setAskOpen] = useState(false)
  const [askSeed, setAskSeed] = useState("")
  const [ownerView, setOwnerView] = useState(false)
  const [stagedBlocks, setStagedBlocks] = useState<string[]>([])

  const value = useMemo<AppContextValue>(
    () => ({
      unit,
      setUnit,
      askOpen,
      setAskOpen,
      askSeed,
      openAsk: (seed = "") => {
        setAskSeed(seed)
        setAskOpen(true)
      },
      ownerView,
      setOwnerView,
      stagedBlocks,
      isStaged: (id) => stagedBlocks.includes(id),
      toggleStaged: (id) =>
        setStagedBlocks((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        ),
      unstageBlock: (id) => setStagedBlocks((prev) => prev.filter((x) => x !== id)),
      clearStaged: () => setStagedBlocks([]),
    }),
    [unit, askOpen, askSeed, ownerView, stagedBlocks],
  )

  return <AppContext value={value}>{children}</AppContext>
}

export function useApp() {
  const ctx = use(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

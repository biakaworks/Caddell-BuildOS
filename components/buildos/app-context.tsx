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
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnit] = useState<UnitFilter>("All")
  const [askOpen, setAskOpen] = useState(false)
  const [askSeed, setAskSeed] = useState("")

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
    }),
    [unit, askOpen, askSeed],
  )

  return <AppContext value={value}>{children}</AppContext>
}

export function useApp() {
  const ctx = use(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

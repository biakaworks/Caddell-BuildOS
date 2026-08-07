"use client"

import { createContext, use, useMemo, useState } from "react"

type ViewMode = "internal" | "client"

type AppContextValue = {
  viewMode: ViewMode
  setViewMode: (m: ViewMode) => void
  isClientView: boolean
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("internal")

  const value = useMemo<AppContextValue>(
    () => ({
      viewMode,
      setViewMode,
      isClientView: viewMode === "client",
    }),
    [viewMode],
  )

  return <AppContext value={value}>{children}</AppContext>
}

export function useApp() {
  const ctx = use(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

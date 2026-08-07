"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { AppProvider } from "./app-context"
import { SidebarNav } from "./sidebar"
import { Topbar } from "./topbar"
import { PrototypeBadge } from "./prototype-badge"

function ShellInner({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex min-h-screen w-full bg-background">
        <aside
          className="print-hide sticky top-0 hidden h-screen w-60 shrink-0 border-r border-sidebar-border lg:block"
          aria-label="Sidebar"
        >
          <SidebarNav />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="print-hide">
            <Topbar />
          </div>
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <PrototypeBadge />
    </>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <TooltipProvider delayDuration={200}>
        <ShellInner>{children}</ShellInner>
      </TooltipProvider>
    </AppProvider>
  )
}

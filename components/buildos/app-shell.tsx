"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { AppProvider } from "./app-context"
import { SidebarNav } from "./sidebar"
import { Topbar } from "./topbar"
import { AskPanel } from "./ask-panel"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <TooltipProvider delay={200}>
        <div className="flex min-h-screen w-full bg-background">
          <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border lg:block">
            <SidebarNav />
          </aside>
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="flex-1">{children}</main>
          </div>
        </div>
        <AskPanel />
      </TooltipProvider>
    </AppProvider>
  )
}

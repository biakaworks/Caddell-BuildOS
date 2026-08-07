"use client"

import { usePathname } from "next/navigation"
import { Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { SidebarNav } from "./sidebar"
import { useApp } from "./app-context"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Map route prefixes to human-readable section names
const SECTION_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/projects": "Projects",
  "/fabrication": "Fabrication",
  "/schedule": "Install Schedule",
  "/dispatch": "Emergency Dispatch",
  "/pipeline": "Pipeline",
  "/bids": "Bids",
  "/contacts": "Contacts",
  "/documents": "Documents",
  "/integrations": "Integrations",
  "/settings": "Settings",
}

function useSectionLabel() {
  const pathname = usePathname()
  if (pathname === "/") return "Dashboard"
  const match = Object.keys(SECTION_LABELS)
    .filter((k) => k !== "/" && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0]
  return match ? SECTION_LABELS[match] : ""
}

export function Topbar() {
  const { viewMode, setViewMode, isClientView } = useApp()
  const section = useSectionLabel()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
      {/* Mobile hamburger */}
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 border-r-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav />
        </SheetContent>
      </Sheet>

      {/* Section label */}
      {section && (
        <span className="hidden text-sm text-muted-foreground lg:block">
          {section}
        </span>
      )}

      {/* Global search — Phase 2 */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative hidden max-w-sm flex-1 md:flex items-center">
            <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground/40" />
            <input
              type="search"
              placeholder="Search — Phase 2"
              disabled
              aria-label="Global search (Phase 2)"
              className="h-9 w-full border border-border bg-card pl-9 pr-4 text-sm text-muted-foreground/40 placeholder:text-muted-foreground/40 cursor-not-allowed"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>Search — Phase 2</TooltipContent>
      </Tooltip>

      {/* Right strip */}
      <div className="ml-auto flex items-center gap-4">
        {/* QuickBooks / ClickUp / Excel integration strip */}
        <div className="hidden items-center gap-2 text-xs lg:flex">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-1.5 rounded-full bg-success" />
            <span>Connected: <span className="text-foreground/80">QuickBooks</span></span>
          </span>
          <span className="text-muted-foreground/30">·</span>
          <span className="text-muted-foreground">
            Replaces:{" "}
            <span className="line-through text-muted-foreground/50">ClickUp</span>
            {", "}
            <span className="line-through text-muted-foreground/50">Excel</span>
          </span>
        </div>

        {/* Internal / Client View toggle */}
        <div className="flex items-center border border-border text-xs">
          <button
            onClick={() => setViewMode("internal")}
            aria-pressed={!isClientView}
            className={cn(
              "px-3 py-1.5 transition-colors",
              !isClientView
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Internal View
          </button>
          <button
            onClick={() => setViewMode("client")}
            aria-pressed={isClientView}
            className={cn(
              "px-3 py-1.5 transition-colors",
              isClientView
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Client View
          </button>
        </div>
      </div>
    </header>
  )
}

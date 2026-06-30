"use client"

import { Search, Sparkles, ChevronDown, Check, Menu, Bell, Eye, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PhaseBadge } from "./phase"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useApp } from "./app-context"
import { SidebarNav } from "./sidebar"
import { BUSINESS_UNITS } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const UNIT_OPTIONS = ["All", ...BUSINESS_UNITS] as const

export function Topbar() {
  const { unit, setUnit, openAsk, ownerView, setOwnerView } = useApp()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
      {/* Mobile nav */}
      <Sheet>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" />
          }
        >
          <Menu />
        </SheetTrigger>
        <SheetContent side="left" className="w-72 max-w-[80vw] border-r-0 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav />
        </SheetContent>
      </Sheet>

      {/* Global search */}
      <div className="relative hidden max-w-md flex-1 items-center md:flex">
        <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search pursuits, projects, RFIs, knowledge…"
          aria-label="Global search"
          className="h-9 w-full rounded-lg border border-border bg-secondary/60 pl-9 pr-16 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-3 focus:ring-ring/20"
        />
        <kbd className="pointer-events-none absolute right-2.5 hidden rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline-block">
          ⌘K
        </kbd>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Search"
      >
        <Search />
      </Button>

      <div className="ml-auto flex items-center gap-2">
        {/* Ask BuildOS */}
        <Button
          onClick={() => openAsk()}
          className="gap-1.5 bg-primary shadow-sm"
          size="sm"
        >
          <Sparkles className="size-4" />
          <span className="hidden sm:inline">Ask BuildOS</span>
        </Button>

        {/* Business unit switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="gap-1.5" />
            }
          >
            <span className="text-muted-foreground">Unit:</span>
            <span className="font-medium">{unit}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Business Unit</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {UNIT_OPTIONS.map((u) => (
              <DropdownMenuItem
                key={u}
                onClick={() => setUnit(u)}
                className="justify-between"
              >
                {u === "All" ? "All Units" : u}
                <Check className={cn("size-4", unit === u ? "opacity-100" : "opacity-0")} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View as Owner — Phase 3 external portal */}
        <Button
          variant={ownerView ? "default" : "outline"}
          size="sm"
          onClick={() => setOwnerView(!ownerView)}
          aria-pressed={ownerView}
          className={cn("hidden items-center gap-1.5 md:flex", ownerView && "bg-accent text-accent-foreground hover:bg-accent/90")}
        >
          {ownerView ? <Building className="size-4" /> : <Eye className="size-4" />}
          <span className="hidden lg:inline">{ownerView ? "Owner View" : "View as Owner"}</span>
          <PhaseBadge phase={3} className="ml-0.5" />
        </Button>

        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative hidden sm:flex">
          <Bell />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-danger" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
                aria-label="Account menu"
              />
            }
          >
            <Avatar className="size-9">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                JC
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-medium text-foreground">Jordan Cole</div>
              <div className="text-xs font-normal text-muted-foreground">VP, Operations</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

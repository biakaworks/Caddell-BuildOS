"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Search,
  Sparkles,
  ChevronDown,
  Check,
  Menu,
  Bell,
  Eye,
  Building,
  User,
  Settings,
  ShieldCheck,
  LogOut,
  UserCog,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { useAuth } from "./account/auth-context"
import { SidebarNav } from "./sidebar"
import { BUSINESS_UNITS, ATTENTION_ITEMS } from "@/lib/mock-data"
import { ROLES, ROLE_META, initials } from "@/lib/account-data"
import { cn } from "@/lib/utils"

const UNIT_OPTIONS = ["All", ...BUSINESS_UNITS] as const

export function Topbar() {
  const { unit, setUnit, openAsk, ownerView, setOwnerView } = useApp()
  const { currentUser, signOut, setRole } = useAuth()
  const isAdmin = currentUser.role === "Admin"
  const router = useRouter()

  function handleSignOut() {
    signOut()
    router.push("/")
  }
  const [search, setSearch] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = search.trim()
    router.push(q ? `/knowledge?q=${encodeURIComponent(q)}` : "/knowledge")
  }

  // ⌘K / Ctrl+K focuses the global search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

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

      {/* Maroon Caddell wordmark for the light top bar (mobile — the dark
          sidebar mark is hidden behind the hamburger at this breakpoint) */}
      <Link href="/" className="flex items-center gap-2 lg:hidden" aria-label="Caddell BuildOS home">
        <img src="/caddell-logo.svg" alt="Caddell Construction" className="h-6 w-auto shrink-0" />
        <span className="font-heading text-base font-semibold tracking-tight text-foreground">
          BuildOS
        </span>
      </Link>

      {/* Global search */}
      <form onSubmit={submitSearch} className="relative hidden max-w-md flex-1 items-center md:flex">
        <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
        <input
          ref={searchRef}
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pursuits, projects, RFIs, knowledge…"
          aria-label="Global search"
          className="h-9 w-full rounded-lg border border-border bg-secondary/60 pl-9 pr-16 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-3 focus:ring-ring/20"
        />
        <kbd className="pointer-events-none absolute right-2.5 hidden rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline-block">
          ⌘K
        </kbd>
      </form>

      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Search"
        onClick={() => router.push("/knowledge")}
      >
        <Search />
      </Button>

      <div className="ml-auto flex items-center gap-2">
        {/* Ask BuildOS */}
        <Button
          onClick={() => openAsk()}
          variant="cta"
          className="gap-1.5 shadow-sm"
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

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Notifications" className="relative hidden sm:flex" />
            }
          >
            <Bell />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-danger" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Needs attention</DropdownMenuLabel>
            <DropdownMenuSeparator aria-hidden />
            {ATTENTION_ITEMS.slice(0, 5).map((item) => (
              <DropdownMenuItem
                key={item.id}
                render={<Link href={item.href} />}
                className="flex-col items-start gap-0.5"
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{item.title}</span>
                  <span
                    className={cn(
                      "shrink-0 text-[11px] font-medium",
                      item.severity === "critical" ? "text-danger-strong" : "text-warning-strong",
                    )}
                  >
                    {item.severity === "critical" ? "Critical" : "At risk"}
                  </span>
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {item.project} · {item.age}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/" />} className="justify-center text-sm font-medium text-primary">
              View all on dashboard
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Demo role switcher — lets a reviewer see the UI change per role */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="hidden gap-1.5 sm:flex" />
            }
          >
            <UserCog className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Role:</span>
            <span className="font-medium">{currentUser.role}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Demo role — preview access levels</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ROLES.map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => setRole(r)}
                className="flex-col items-start gap-0.5"
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="font-medium text-foreground">{r}</span>
                  <Check className={cn("size-4", currentUser.role === r ? "opacity-100" : "opacity-0")} />
                </span>
                <span className="text-xs text-muted-foreground">{ROLE_META[r].blurb}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
              {currentUser.avatarUrl && (
                <AvatarImage src={currentUser.avatarUrl} alt="" />
              )}
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>
              <div className="font-medium text-foreground">{currentUser.name}</div>
              <div className="text-xs font-normal text-muted-foreground">{currentUser.title}</div>
              <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                <ShieldCheck className="size-3" /> {currentUser.role}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/profile" />}>
              <User className="size-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/settings" />}>
              <Settings className="size-4" /> Account settings
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem render={<Link href="/admin" />}>
                <ShieldCheck className="size-4" /> Admin console
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

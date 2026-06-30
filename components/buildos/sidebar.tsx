"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Target,
  Calculator,
  Building2,
  BookOpen,
  BarChart3,
  HardHat,
  CircleDot,
  Handshake,
  Plug,
  Map,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PhaseBadge, type Phase } from "./phase"

type NavItem = { label: string; href: string; icon: typeof LayoutDashboard; phase?: Phase }

const PRIMARY: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Pursuits", href: "/pursuits", icon: Target },
  { label: "Estimating", href: "/estimating", icon: Calculator },
  { label: "Projects", href: "/projects", icon: Building2 },
  { label: "Knowledge", href: "/knowledge", icon: BookOpen },
  { label: "Reporting", href: "/reporting", icon: BarChart3 },
]

const SECONDARY: NavItem[] = [
  { label: "Trade Partners", href: "/trade-partners", icon: Handshake },
  { label: "Integrations", href: "/integrations", icon: Plug, phase: 2 },
  { label: "Roadmap", href: "/roadmap", icon: Map },
]

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(href + "/")
}

function NavLink({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) {
  const pathname = usePathname()
  const active = isActive(pathname, item.href)
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className={cn("size-[18px] shrink-0", active && "text-sidebar-primary")} />
      <span className="flex-1">{item.label}</span>
      {item.phase && item.phase !== 1 && <PhaseBadge phase={item.phase} />}
    </Link>
  )
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <HardHat className="size-5" />
        </div>
        <div className="leading-tight">
          <div className="font-heading text-sm font-semibold tracking-tight text-sidebar-accent-foreground">
            BuildOS
          </div>
          <div className="text-[11px] text-sidebar-foreground/70">Caddell Construction</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Primary">
        <ul className="space-y-1">
          {PRIMARY.map((item) => (
            <li key={item.href}>
              <NavLink item={item} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>

        <div className="my-3 flex items-center gap-2 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
            Collaborate &amp; Connect
          </span>
          <span className="h-px flex-1 bg-sidebar-border" />
        </div>

        <ul className="space-y-1">
          {SECONDARY.map((item) => (
            <li key={item.href}>
              <NavLink item={item} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3.5">
        <div className="mb-3 rounded-lg bg-sidebar-accent/40 p-2.5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/55">
            Release phases
          </p>
          <ul className="space-y-1.5 text-[11px] text-sidebar-foreground/75">
            <li className="flex items-center gap-2">
              <span className="size-2 shrink-0 rounded-full bg-success" />
              <span className="font-medium text-sidebar-accent-foreground">Phase 1</span>
              <span className="text-sidebar-foreground/55">— built now</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="size-2 shrink-0 rounded-full bg-info" />
              <span className="font-medium text-sidebar-accent-foreground">Phase 2</span>
              <span className="text-sidebar-foreground/55">— expansion</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="size-2 shrink-0 rounded-full bg-warning" />
              <span className="font-medium text-sidebar-accent-foreground">Phase 3</span>
              <span className="text-sidebar-foreground/55">— intelligence</span>
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-sidebar-foreground/60">
          <CircleDot className="size-3 text-success" />
          Prototype · demo data only
        </div>
      </div>
    </div>
  )
}

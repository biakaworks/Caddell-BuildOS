"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderOpen,
  Factory,
  CalendarRange,
  Zap,
  PieChart,
  ClipboardList,
  Users,
  FileText,
  Plug,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = { label: string; href: string; icon: typeof LayoutDashboard; phase2?: boolean }

const PULSE: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
]

const WORK: NavItem[] = [
  { label: "Projects", href: "/projects", icon: FolderOpen },
  { label: "Fabrication", href: "/fabrication", icon: Factory },
  { label: "Install Schedule", href: "/schedule", icon: CalendarRange },
  { label: "Emergency Dispatch", href: "/dispatch", icon: Zap },
]

const SALES: NavItem[] = [
  { label: "Pipeline", href: "/pipeline", icon: PieChart },
  { label: "Bids", href: "/bids", icon: ClipboardList },
  { label: "Contacts", href: "/contacts", icon: Users },
]

const RECORDS: NavItem[] = [
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Integrations", href: "/integrations", icon: Plug },
  { label: "Settings", href: "/settings", icon: Settings },
]

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(href + "/")
}

function NavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const active = isActive(pathname, item.href)
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-9 items-center gap-3 px-3 text-sm transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
      )}
    >
      <Icon className={cn("size-4 shrink-0", active && "text-sidebar-primary")} />
      <span className="flex-1 truncate">{item.label}</span>
    </Link>
  )
}

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <div className="mb-1">
      <p className="text-overline mb-1 px-3 text-sidebar-foreground/35 tracking-wider">
        {label}
      </p>
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <NavLink item={item} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function SidebarNav() {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Wordmark */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <span className="text-base font-sans text-sidebar-accent-foreground" style={{ letterSpacing: "-0.03em" }}>
          CG<span className="text-sidebar-primary">&</span>M
        </span>
        <span className="h-5 w-px shrink-0 bg-sidebar-border" aria-hidden="true" />
        <span className="text-sm text-sidebar-foreground/60 tracking-wide" style={{ letterSpacing: "0.06em" }}>
          GLAZING OPS
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-4" aria-label="Primary navigation">
        <NavGroup label="Pulse" items={PULSE} />
        <NavGroup label="Work" items={WORK} />
        <NavGroup label="Sales" items={SALES} />
        <NavGroup label="Records" items={RECORDS} />
      </nav>

      {/* Bottom strip */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="text-[11px] text-sidebar-foreground/40 tracking-wide uppercase">
          PROTOTYPE · Midwestern × CG&M
        </div>
      </div>
    </div>
  )
}

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
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Pursuits", href: "/pursuits", icon: Target },
  { label: "Estimating", href: "/estimating", icon: Calculator },
  { label: "Projects", href: "/projects", icon: Building2 },
  { label: "Knowledge", href: "/knowledge", icon: BookOpen },
  { label: "Reporting", href: "/reporting", icon: BarChart3 },
]

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(href + "/")
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
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

      <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Primary">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
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
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] text-sidebar-foreground/60">
          <CircleDot className="size-3 text-success" />
          All systems operational
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-sidebar-foreground/45">
          Prototype · demo data only
        </p>
      </div>
    </div>
  )
}

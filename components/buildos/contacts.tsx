"use client"

import { useState } from "react"
import { Mail, Phone } from "lucide-react"
import { CONTACTS, PROJECTS } from "@/lib/data/fixtures"
import type { ContactRole } from "@/lib/types"
import { PageContainer, PageHeader, StatTile } from "./ui"
import { cn } from "@/lib/utils"
import Link from "next/link"

const ROLES: ContactRole[] = ["GC PM", "Architect", "Facilities Director", "Owner"]

const ROLE_COLOR: Record<ContactRole, string> = {
  "GC PM":               "bg-info-muted text-info",
  "Architect":           "bg-warning-muted text-warning-strong",
  "Facilities Director": "bg-success-muted text-success-strong",
  "Owner":               "bg-primary/10 text-primary",
}

function projectName(id: string) {
  return PROJECTS.find((p) => p.id === id)?.name ?? id
}

export function ContactsList() {
  const [roleFilter, setRoleFilter] = useState<ContactRole | "All">("All")
  const [search, setSearch] = useState("")

  const filtered = CONTACTS.filter((c) => {
    if (roleFilter !== "All" && c.role !== roleFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <PageContainer>
      <PageHeader
        title="Contacts"
        subtitle="GC project managers, architects, and facility directors across the portfolio"
      />

      {/* KPI */}
      <div className="mt-5 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
        {ROLES.map((r) => (
          <StatTile
            key={r}
            label={r}
            value={CONTACTS.filter((c) => c.role === r).length}
            tone="neutral"
          />
        ))}
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap gap-3 items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, company, email..."
          className="border border-border bg-card px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring w-72"
        />
        <div className="flex flex-wrap gap-1.5">
          {(["All", ...ROLES] as (ContactRole | "All")[]).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                "px-3 py-1 text-xs border transition-colors",
                roleFilter === r
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Contact cards */}
      <div className="mt-4 grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((contact) => (
          <div key={contact.id} className="bg-card p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm text-foreground" style={{ letterSpacing: "-0.01em" }}>
                  {contact.name}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{contact.company}</p>
              </div>
              <span
                data-pill
                className={cn("rounded-full px-2.5 py-0.5 text-[10px] shrink-0", ROLE_COLOR[contact.role])}
              >
                {contact.role}
              </span>
            </div>

            <div className="space-y-1">
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Phone className="size-3 shrink-0" />
                {contact.phone}
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground truncate"
              >
                <Mail className="size-3 shrink-0" />
                {contact.email}
              </a>
            </div>

            {contact.projects.length > 0 && (
              <div className="border-t border-border pt-2.5">
                <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-1.5">Projects</p>
                <div className="flex flex-wrap gap-1">
                  {contact.projects.map((pid) => (
                    <Link
                      key={pid}
                      href={`/projects/${pid}`}
                      className="text-[10px] border border-border px-2 py-0.5 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                    >
                      {projectName(pid)}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          No contacts match your search.
        </div>
      )}
    </PageContainer>
  )
}

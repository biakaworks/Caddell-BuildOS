"use client"

import { useMemo, useState } from "react"
import {
  Search,
  ChevronDown,
  Check,
  MoreHorizontal,
  UserPlus,
  Eye,
  Pencil,
  Ban,
  RotateCcw,
  Send,
  Users,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StatusPill } from "@/components/buildos/ui"
import { useAuth } from "../auth-context"
import {
  ROLES,
  ROLE_META,
  STATUS_META,
  BRANCHES,
  initials,
  type AccountUser,
  type Role,
  type UserStatus,
} from "@/lib/account-data"
import { BUSINESS_UNITS, type BusinessUnit } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { UserPanel } from "./user-panel"
import { InvitePanel } from "./invite-panel"

type RoleFilter = Role | "All"
type StatusFilter = UserStatus | "All"
type UnitFilter = BusinessUnit | "All"

export function UserManagement() {
  const { users, setUserStatus } = useAuth()
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [unitFilter, setUnitFilter] = useState<UnitFilter>("All")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [note, setNote] = useState("")

  // Panels
  const [panel, setPanel] = useState<{ mode: "view" | "edit"; userId: string } | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter !== "All" && u.role !== roleFilter) return false
      if (statusFilter !== "All" && u.status !== statusFilter) return false
      if (unitFilter !== "All" && !u.businessUnits.includes(unitFilter)) return false
      if (q && !`${u.name} ${u.email} ${u.title}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [users, query, roleFilter, statusFilter, unitFilter])

  const allVisibleSelected = filtered.length > 0 && filtered.every((u) => selected.has(u.id))
  const selectedInView = filtered.filter((u) => selected.has(u.id))

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        filtered.forEach((u) => next.delete(u.id))
      } else {
        filtered.forEach((u) => next.add(u.id))
      }
      return next
    })
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function bulk(status: UserStatus) {
    selectedInView.forEach((u) => setUserStatus(u.id, status))
    setNote(
      `${selectedInView.length} ${selectedInView.length === 1 ? "user" : "users"} ${
        status === "suspended" ? "suspended" : "reactivated"
      }.`,
    )
    setSelected(new Set())
  }

  function rowAction(user: AccountUser, action: "view" | "edit" | "toggle" | "resend") {
    if (action === "view" || action === "edit") {
      setPanel({ mode: action, userId: user.id })
      return
    }
    if (action === "toggle") {
      const next = user.status === "suspended" ? "active" : "suspended"
      setUserStatus(user.id, next)
      setNote(`${user.name} ${next === "suspended" ? "suspended" : "reactivated"}.`)
      return
    }
    if (action === "resend") {
      setNote(`Invitation resent to ${user.email}.`)
    }
  }

  const activeFilters =
    roleFilter !== "All" || statusFilter !== "All" || unitFilter !== "All" || query.trim() !== ""

  function clearFilters() {
    setQuery("")
    setRoleFilter("All")
    setStatusFilter("All")
    setUnitFilter("All")
  }

  const panelUser = panel ? users.find((u) => u.id === panel.userId) ?? null : null

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, title…"
            aria-label="Search users"
            className="h-9 pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterMenu
            label="Role"
            value={roleFilter}
            options={["All", ...ROLES]}
            onSelect={(v) => setRoleFilter(v as RoleFilter)}
          />
          <FilterMenu
            label="Unit"
            value={unitFilter}
            options={["All", ...BUSINESS_UNITS]}
            onSelect={(v) => setUnitFilter(v as UnitFilter)}
          />
          <FilterMenu
            label="Status"
            value={statusFilter}
            options={["All", "active", "invited", "suspended"]}
            onSelect={(v) => setStatusFilter(v as StatusFilter)}
            renderOption={(o) => (o === "All" ? "All" : STATUS_META[o as UserStatus].label)}
          />
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="size-4" /> Invite user
          </Button>
        </div>
      </div>

      {note && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-lg border border-success/25 bg-success-muted px-3 py-2 text-sm text-success-strong"
        >
          <span className="inline-flex items-center gap-2">
            <Check className="size-4" /> {note}
          </span>
          <button
            type="button"
            onClick={() => setNote("")}
            className="rounded p-0.5 hover:bg-success/10"
            aria-label="Dismiss"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Bulk bar */}
      {selectedInView.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-secondary/60 px-3 py-2 text-sm">
          <span className="font-medium text-foreground">
            {selectedInView.length} selected
          </span>
          <span className="h-4 w-px bg-border" />
          <Button variant="ghost" size="sm" onClick={() => bulk("suspended")}>
            <Ban className="size-4" /> Suspend
          </Button>
          <Button variant="ghost" size="sm" onClick={() => bulk("active")}>
            <RotateCcw className="size-4" /> Reactivate
          </Button>
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 pl-4">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAll}
                  aria-label="Select all users in view"
                  className="size-4 rounded border-border accent-primary"
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Business unit</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last active</TableHead>
              <TableHead className="pr-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id} data-state={selected.has(u.id) ? "selected" : undefined}>
                <TableCell className="pl-4">
                  <input
                    type="checkbox"
                    checked={selected.has(u.id)}
                    onChange={() => toggleOne(u.id)}
                    aria-label={`Select ${u.name}`}
                    className="size-4 rounded border-border accent-primary"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                        {initials(u.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground">{u.name}</div>
                      <div className="max-w-[220px] truncate text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <RolePill role={u.role} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {u.businessUnits.join(", ")}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.branch}</TableCell>
                <TableCell>
                  <StatusPill tone={STATUS_META[u.status].tone}>{STATUS_META[u.status].label}</StatusPill>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.lastActive}</TableCell>
                <TableCell className="pr-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${u.name}`} />
                      }
                    >
                      <MoreHorizontal />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuLabel>{u.name}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => rowAction(u, "view")}>
                        <Eye className="size-4" /> View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => rowAction(u, "edit")}>
                        <Pencil className="size-4" /> Edit
                      </DropdownMenuItem>
                      {u.status === "invited" && (
                        <DropdownMenuItem onClick={() => rowAction(u, "resend")}>
                          <Send className="size-4" /> Resend invite
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {u.status === "suspended" ? (
                        <DropdownMenuItem onClick={() => rowAction(u, "toggle")}>
                          <RotateCcw className="size-4" /> Reactivate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem variant="destructive" onClick={() => rowAction(u, "toggle")}>
                          <Ban className="size-4" /> Suspend
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Users className="size-5" />
            </span>
            <div>
              <p className="font-medium text-foreground">No users match your filters</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Try broadening your search{activeFilters ? " or clearing the active filters" : ""}.
              </p>
            </div>
            {activeFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {users.length} users
      </p>

      {/* Detail / edit panel */}
      <UserPanel
        user={panelUser}
        mode={panel?.mode ?? "view"}
        onModeChange={(mode) => panel && setPanel({ ...panel, mode })}
        onClose={() => setPanel(null)}
        onSaved={(name) => setNote(`${name}'s account was updated.`)}
      />

      {/* Invite panel */}
      <InvitePanel
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvited={(email) => setNote(`Invitation sent to ${email}.`)}
      />
    </div>
  )
}

function RolePill({ role }: { role: Role }) {
  return (
    <StatusPill tone={ROLE_META[role].tone} dot={false}>
      {role}
    </StatusPill>
  )
}

function FilterMenu({
  label,
  value,
  options,
  onSelect,
  renderOption,
}: {
  label: string
  value: string
  options: string[]
  onSelect: (v: string) => void
  renderOption?: (o: string) => string
}) {
  const display = value === "All" ? "All" : renderOption ? renderOption(value) : value
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-medium">{display}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {options.map((o) => (
          <DropdownMenuItem key={o} onClick={() => onSelect(o)} className="justify-between">
            {renderOption ? renderOption(o) : o === "All" ? "All" : o}
            <Check className={cn("size-4", value === o ? "opacity-100" : "opacity-0")} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Re-exported so sibling panels can share the constants without re-importing.
export { BRANCHES }

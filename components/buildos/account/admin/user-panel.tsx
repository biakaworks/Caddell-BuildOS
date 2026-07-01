"use client"

import { useEffect, useState } from "react"
import { Check, Pencil } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
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
  type Branch,
  type UserStatus,
} from "@/lib/account-data"
import { BUSINESS_UNITS, type BusinessUnit } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function UserPanel({
  user,
  mode,
  onModeChange,
  onClose,
  onSaved,
}: {
  user: AccountUser | null
  mode: "view" | "edit"
  onModeChange: (mode: "view" | "edit") => void
  onClose: () => void
  onSaved: (name: string) => void
}) {
  const { updateUser } = useAuth()
  const [role, setRole] = useState<Role>("Staff")
  const [units, setUnits] = useState<BusinessUnit[]>([])
  const [branch, setBranch] = useState<Branch>(BRANCHES[0])
  const [status, setStatus] = useState<UserStatus>("active")

  // Sync draft whenever the panel opens for a user or switches to edit.
  useEffect(() => {
    if (user) {
      setRole(user.role)
      setUnits(user.businessUnits)
      setBranch(user.branch)
      setStatus(user.status)
    }
  }, [user, mode])

  function save() {
    if (!user) return
    updateUser(user.id, { role, businessUnits: units, branch, status })
    onSaved(user.name)
    onModeChange("view")
  }

  function toggleUnit(u: BusinessUnit) {
    setUnits((prev) => (prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]))
  }

  return (
    <Sheet
      open={Boolean(user)}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        {user && (
          <>
            <SheetHeader className="border-b border-border">
              <SheetTitle>{mode === "edit" ? "Edit user" : "User details"}</SheetTitle>
              <SheetDescription>
                {mode === "edit"
                  ? "Update role, access, and status. Elevated access should follow a documented assignment."
                  : "Account and access overview."}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {/* Identity header */}
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-heading text-base font-semibold text-foreground">{user.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {mode === "view" ? (
                <dl className="mt-6 space-y-3.5">
                  <Row label="Title" value={user.title} />
                  <Row label="Role" value={<StatusPill tone={ROLE_META[user.role].tone} dot={false}>{user.role}</StatusPill>} />
                  <Row label="Business unit(s)" value={user.businessUnits.join(", ")} />
                  <Row label="Branch" value={user.branch} />
                  <Row
                    label="Status"
                    value={<StatusPill tone={STATUS_META[user.status].tone}>{STATUS_META[user.status].label}</StatusPill>}
                  />
                  <Row label="Phone" value={user.phone} />
                  <Row label="Last active" value={user.lastActive} />
                </dl>
              ) : (
                <div className="mt-6 space-y-5">
                  <Fieldset legend="Role">
                    <div className="flex flex-wrap gap-2">
                      {ROLES.map((r) => (
                        <ChoiceChip key={r} active={role === r} onClick={() => setRole(r)}>
                          {r}
                        </ChoiceChip>
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">{ROLE_META[role].blurb}</p>
                  </Fieldset>

                  <Fieldset legend="Business unit(s)">
                    <div className="flex flex-wrap gap-2">
                      {BUSINESS_UNITS.map((u) => (
                        <ChoiceChip key={u} active={units.includes(u)} onClick={() => toggleUnit(u)}>
                          {units.includes(u) && <Check className="size-3.5" />}
                          {u}
                        </ChoiceChip>
                      ))}
                    </div>
                    {role === "Trade Partner" && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Trade Partners are project-scoped; business units are advisory only.
                      </p>
                    )}
                  </Fieldset>

                  <Fieldset legend="Branch">
                    <div className="flex flex-wrap gap-2">
                      {BRANCHES.map((b) => (
                        <ChoiceChip key={b} active={branch === b} onClick={() => setBranch(b)}>
                          {b}
                        </ChoiceChip>
                      ))}
                    </div>
                  </Fieldset>

                  <Fieldset legend="Status">
                    <div className="flex flex-wrap gap-2">
                      {(["active", "suspended"] as UserStatus[]).map((s) => (
                        <ChoiceChip key={s} active={status === s} onClick={() => setStatus(s)}>
                          {STATUS_META[s].label}
                        </ChoiceChip>
                      ))}
                    </div>
                  </Fieldset>
                </div>
              )}
            </div>

            <SheetFooter className="border-t border-border">
              {mode === "view" ? (
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => onModeChange("edit")}>
                    <Pencil className="size-4" /> Edit
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Close
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={save}>
                    <Check className="size-4" /> Save changes
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => onModeChange("view")}>
                    Cancel
                  </Button>
                </div>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] items-center gap-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground break-words">{value}</dd>
    </div>
  )
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-foreground">{legend}</legend>
      {children}
    </fieldset>
  )
}

function ChoiceChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

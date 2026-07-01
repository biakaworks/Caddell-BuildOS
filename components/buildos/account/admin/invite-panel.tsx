"use client"

import { useState } from "react"
import { Check, Mail, Send } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "../auth-context"
import { ROLES, ROLE_META, BRANCHES, type Role, type Branch } from "@/lib/account-data"
import { BUSINESS_UNITS, type BusinessUnit } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function InvitePanel({
  open,
  onOpenChange,
  onInvited,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvited: (email: string) => void
}) {
  const { inviteUser } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("Staff")
  const [units, setUnits] = useState<BusinessUnit[]>([])
  const [branch, setBranch] = useState<Branch>(BRANCHES[0])
  const [touched, setTouched] = useState(false)

  const emailValid = EMAIL_RE.test(email.trim())
  const canSubmit = emailValid

  function reset() {
    setName("")
    setEmail("")
    setRole("Staff")
    setUnits([])
    setBranch(BRANCHES[0])
    setTouched(false)
  }

  function submit() {
    setTouched(true)
    if (!canSubmit) return
    inviteUser({ name, email, role, businessUnits: units, branch })
    onInvited(email.trim())
    reset()
    onOpenChange(false)
  }

  function toggleUnit(u: BusinessUnit) {
    setUnits((prev) => (prev.includes(u) ? prev.filter((x) => x !== u) : [...prev, u]))
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <SheetContent side="right" className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Invite user</SheetTitle>
          <SheetDescription>
            Send an email invitation. The user activates their own account and sets up MFA on first
            sign-in.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-5">
            <Field label="Full name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tania Ross"
              />
            </Field>

            <Field label="Work email" required>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="name@caddell.example"
                  className={cn("pl-9", touched && !emailValid && "border-danger")}
                  aria-invalid={touched && !emailValid}
                />
              </div>
              {touched && !emailValid && (
                <p className="mt-1 text-xs text-danger">Enter a valid email address.</p>
              )}
            </Field>

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
          </div>
        </div>

        <SheetFooter className="border-t border-border">
          <div className="flex gap-2">
            <Button className="flex-1" onClick={submit} disabled={!canSubmit}>
              <Send className="size-4" /> Send invitation
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
            >
              Cancel
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {children}
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

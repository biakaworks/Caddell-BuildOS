"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Check,
  Laptop,
  Loader2,
  LogOut,
  Monitor,
  ShieldCheck,
  Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PageContainer, PageHeader } from "@/components/buildos/ui"
import { useAuth } from "./auth-context"
import { ACTIVE_SESSIONS, type SessionInfo } from "@/lib/account-data"
import { cn } from "@/lib/utils"

export function AccountSettingsView() {
  return (
    <PageContainer>
      <PageHeader
        title="Account settings"
        subtitle="Manage your profile basics, security, and notification preferences."
      />

      <Tabs defaultValue="profile" className="mt-6 gap-6">
        <TabsList variant="line" className="h-auto flex-wrap">
          <TabsTrigger value="profile">Profile basics</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileBasics />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySection />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsSection />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}

/* -------------------------------------------------------------------------- */
/* Toggle switch (accessible)                                                 */
/* -------------------------------------------------------------------------- */
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
        checked ? "bg-primary" : "bg-muted-foreground/30",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 rounded-full bg-background shadow-sm transition-transform motion-reduce:transition-none",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  )
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
    </section>
  )
}

function SavedNote({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null
  return (
    <p role="status" className="inline-flex items-center gap-1.5 text-sm text-success-strong">
      <Check className="size-4" /> {children}
    </p>
  )
}

/* -------------------------------------------------------------------------- */
/* Profile basics                                                             */
/* -------------------------------------------------------------------------- */
function ProfileBasics() {
  const { currentUser, updateProfile } = useAuth()
  const [name, setName] = useState(currentUser.name)
  const [title, setTitle] = useState(currentUser.title)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError("Name is required.")
      setSaved(false)
      return
    }
    setError("")
    updateProfile({ name: name.trim(), title: title.trim() })
    setSaved(true)
  }

  return (
    <Card
      title="Profile basics"
      description="Update the name and title shown across BuildOS. Role and business unit are managed by an administrator."
    >
      <form onSubmit={save} className="max-w-md space-y-4" noValidate>
        <div className="grid gap-1.5">
          <label htmlFor="s-name" className="text-sm font-medium text-foreground">
            Full name
          </label>
          <Input
            id="s-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setSaved(false)
            }}
            aria-invalid={Boolean(error)}
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="s-title" className="text-sm font-medium text-foreground">
            Title
          </label>
          <Input
            id="s-title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setSaved(false)
            }}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-danger-strong">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm">
            Save changes
          </Button>
          <SavedNote show={saved}>Saved</SavedNote>
        </div>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Looking for full identity details?{" "}
        <Link href="/profile" className="font-medium text-primary underline-offset-4 hover:underline">
          View your profile
        </Link>
        .
      </p>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/* Security                                                                   */
/* -------------------------------------------------------------------------- */
function SecuritySection() {
  const { mfaEnabled, setMfaEnabled } = useAuth()
  return (
    <div className="space-y-6">
      <ChangePassword />

      <Card
        title="Two-factor authentication"
        description="Require a one-time code from an authenticator app at sign-in."
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck className={cn("size-4", mfaEnabled ? "text-success" : "text-muted-foreground")} />
            <span className="font-medium text-foreground">
              {mfaEnabled ? "Enabled" : "Disabled"}
            </span>
            <span className="text-muted-foreground">
              {mfaEnabled ? "— codes required at every sign-in" : "— recommended for all accounts"}
            </span>
          </div>
          <Toggle checked={mfaEnabled} onChange={setMfaEnabled} label="Two-factor authentication" />
        </div>
      </Card>

      <ActiveSessions />
    </div>
  )
}

function ChangePassword() {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (!current || !next || !confirm) {
      setError("Fill in all password fields.")
      return
    }
    if (next.length < 8) {
      setError("New password must be at least 8 characters.")
      return
    }
    if (next !== confirm) {
      setError("New password and confirmation do not match.")
      return
    }
    setError("")
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setSaved(true)
      setCurrent("")
      setNext("")
      setConfirm("")
    }, 700)
  }

  return (
    <Card title="Change password" description="Choose a strong password you don't use elsewhere.">
      <form onSubmit={submit} className="max-w-md space-y-4" noValidate>
        <PwField id="pw-current" label="Current password" value={current} onChange={setCurrent} />
        <PwField id="pw-new" label="New password" value={next} onChange={setNext} />
        <PwField id="pw-confirm" label="Confirm new password" value={confirm} onChange={setConfirm} />

        {error && (
          <p role="alert" className="text-sm text-danger-strong">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Updating…
              </>
            ) : (
              "Update password"
            )}
          </Button>
          <SavedNote show={saved}>Password updated</SavedNote>
        </div>
      </form>
    </Card>
  )
}

function PwField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <Input id={id} type="password" value={value} onChange={(e) => onChange(e.target.value)} autoComplete="off" />
    </div>
  )
}

function sessionIcon(device: string) {
  if (/iphone|android|phone/i.test(device)) return Smartphone
  if (/mac|windows|linux/i.test(device)) return Laptop
  return Monitor
}

function ActiveSessions() {
  const [sessions, setSessions] = useState<SessionInfo[]>(ACTIVE_SESSIONS)
  const [note, setNote] = useState("")
  const others = sessions.filter((s) => !s.current)

  function revokeOthers() {
    setSessions((prev) => prev.filter((s) => s.current))
    setNote("Signed out of all other sessions.")
  }
  function revoke(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    setNote("Session signed out.")
  }

  return (
    <Card title="Active sessions" description="Devices currently signed in to your account.">
      <ul className="divide-y divide-border">
        {sessions.map((s) => {
          const Icon = sessionIcon(s.device)
          return (
            <li key={s.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  {s.device}
                  {s.current && (
                    <span className="ml-2 rounded-full bg-success-muted px-1.5 py-0.5 text-[11px] font-medium text-success-strong">
                      This device
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {s.location} · {s.lastActive}
                </p>
              </div>
              {!s.current && (
                <Button variant="ghost" size="sm" onClick={() => revoke(s.id)}>
                  Sign out
                </Button>
              )}
            </li>
          )
        })}
      </ul>

      <div className="mt-4 flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={revokeOthers} disabled={others.length === 0}>
          <LogOut className="size-4" /> Sign out of other sessions
        </Button>
        {note && (
          <p role="status" className="text-sm text-success-strong">
            {note}
          </p>
        )}
      </div>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */
function NotificationsSection() {
  const { notifications, setNotification } = useAuth()
  return (
    <Card
      title="Notifications"
      description="Choose what BuildOS sends you. Changes take effect immediately."
    >
      <ul className="divide-y divide-border">
        {notifications.map((n) => (
          <li key={n.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{n.label}</p>
              <p className="text-sm text-muted-foreground text-pretty">{n.description}</p>
            </div>
            <Toggle
              checked={n.enabled}
              onChange={(v) => setNotification(n.id, v)}
              label={n.label}
            />
          </li>
        ))}
      </ul>
    </Card>
  )
}

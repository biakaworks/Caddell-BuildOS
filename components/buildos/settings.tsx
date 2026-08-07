"use client"

import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageContainer, PageHeader, SectionHeading } from "./ui"
import { cn } from "@/lib/utils"

type ToggleProps = { checked: boolean; onChange: (v: boolean) => void; label: string }
function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "bg-primary" : "bg-muted-foreground/30",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 bg-background shadow-sm transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  )
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <SectionHeading title={title} description={description} />
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function FieldRow({ id, label, defaultValue, type = "text" }: { id: string; label: string; defaultValue: string; type?: string }) {
  const [val, setVal] = useState(defaultValue)
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-xs text-muted-foreground">{label}</label>
      <input
        id={id}
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  )
}

const NOTIFICATIONS = [
  { id: "at-risk", label: "Project goes At Risk", description: "Notify when a project health status changes to At Risk or Late.", enabled: true },
  { id: "fab-blocked", label: "Fabrication item blocked", description: "Notify when a fab item is flagged as blocked in the shop.", enabled: true },
  { id: "bid-due", label: "Bid due in 48 hours", description: "Reminder when an active bid is due within two days.", enabled: true },
  { id: "crew-conflict", label: "Crew scheduling conflict", description: "Notify when a new crew overlap is detected on the install schedule.", enabled: false },
  { id: "dispatch-new", label: "New emergency dispatch ticket", description: "Notify when a new service call ticket is created.", enabled: false },
  { id: "doc-approved", label: "Document approved", description: "Notify when a shop drawing or submittal reaches Approved status.", enabled: false },
]

export function SettingsView() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  function toggleNotif(id: string, val: boolean) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, enabled: val } : n)))
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
    }, 600)
  }

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        subtitle="Company profile, notification preferences, and team configuration."
      />

      <form onSubmit={handleSave} className="mt-6 space-y-6">
        {/* Company info */}
        <Card title="Company" description="Displayed across reports and PDF exports.">
          <div className="grid gap-4 max-w-lg sm:grid-cols-2">
            <FieldRow id="co-name"    label="Company Name"  defaultValue="Commercial Glass & Metal" />
            <FieldRow id="co-city"    label="Headquarters"  defaultValue="Joplin, MO" />
            <FieldRow id="co-phone"   label="Main Phone"    defaultValue="(417) 624-0085" type="tel" />
            <FieldRow id="co-license" label="License #"     defaultValue="MO-GC-049281" />
          </div>
        </Card>

        {/* Demo user */}
        <Card title="User" description="Your account details. Role and division are managed by an admin.">
          <div className="grid gap-4 max-w-lg sm:grid-cols-2">
            <FieldRow id="u-name"  label="Full Name" defaultValue="Chad Merritt" />
            <FieldRow id="u-title" label="Title"     defaultValue="Estimator / PM" />
            <FieldRow id="u-email" label="Email"     defaultValue="chad.merritt@cgmglass.com" type="email" />
          </div>
        </Card>

        {/* Notifications */}
        <Card title="Notifications" description="Choose what CG&M Operations sends you.">
          <ul className="divide-y divide-border max-w-lg">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{n.label}</p>
                  <p className="text-xs text-muted-foreground text-pretty">{n.description}</p>
                </div>
                <Toggle
                  checked={n.enabled}
                  onChange={(v) => toggleNotif(n.id, v)}
                  label={n.label}
                />
              </li>
            ))}
          </ul>
        </Card>

        {/* Prototype notes */}
        <Card title="Prototype Mode" description="This is a sales prototype. Data is illustrative.">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>All project names, dollar values, dates, GC assignments, contact names, and event history are invented for demonstration purposes only.</p>
            <p>Real project names are sourced from <span className="text-foreground">commercialglassandmetal.com</span>.</p>
            <p className="text-[11px] text-muted-foreground/50">Platform: Midwestern × CG&M · Built by v0</p>
          </div>
        </Card>

        {/* Save */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <><Loader2 className="size-4 animate-spin" /> Saving…</>
            ) : (
              "Save Changes"
            )}
          </Button>
          {saved && (
            <p role="status" className="inline-flex items-center gap-1.5 text-sm text-success-strong">
              <Check className="size-4" /> Saved
            </p>
          )}
        </div>
      </form>
    </PageContainer>
  )
}

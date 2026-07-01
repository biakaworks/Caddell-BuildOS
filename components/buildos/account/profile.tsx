"use client"

import { useRef, useState } from "react"
import { Camera, Check, Lock, Mail, Phone, Pencil, ShieldCheck, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageContainer, PageHeader, StatusPill } from "@/components/buildos/ui"
import { useAuth } from "./auth-context"
import { ROLE_META, initials } from "@/lib/account-data"

export function ProfileView() {
  const { currentUser, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const [draft, setDraft] = useState({
    name: currentUser.name,
    title: currentUser.title,
    email: currentUser.email,
    phone: currentUser.phone,
  })

  function startEdit() {
    setDraft({
      name: currentUser.name,
      title: currentUser.title,
      email: currentUser.email,
      phone: currentUser.phone,
    })
    setError("")
    setSaved(false)
    setEditing(true)
  }

  function cancel() {
    setEditing(false)
    setError("")
  }

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.name.trim()) {
      setError("Name is required.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
      setError("Enter a valid email address.")
      return
    }
    updateProfile({
      name: draft.name.trim(),
      title: draft.title.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
    })
    setEditing(false)
    setError("")
    setSaved(true)
  }

  function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    updateProfile({ avatarUrl: url })
    setSaved(true)
  }

  const roleTone = ROLE_META[currentUser.role].tone

  return (
    <PageContainer>
      <PageHeader
        title="Profile"
        subtitle="Your BuildOS identity. Contact details are yours to manage; role and access are provisioned by an administrator."
      >
        {!editing && (
          <Button variant="outline" size="sm" onClick={startEdit}>
            <Pencil className="size-4" /> Edit profile
          </Button>
        )}
      </PageHeader>

      {saved && (
        <div
          role="status"
          className="mt-6 flex items-center gap-2 rounded-lg border border-success/25 bg-success-muted px-3 py-2 text-sm text-success-strong"
        >
          <Check className="size-4" /> Your profile has been updated.
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Identity card */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar className="size-24">
                {currentUser.avatarUrl && (
                  <AvatarImage src={currentUser.avatarUrl} alt={`${currentUser.name} profile photo`} />
                )}
                <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                  {initials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm outline-none ring-2 ring-card transition-colors hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-label="Upload a profile photo"
              >
                <Camera className="size-4" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={onPickAvatar}
                aria-hidden="true"
                tabIndex={-1}
              />
            </div>
            <h2 className="mt-4 font-heading text-lg font-semibold tracking-tight text-foreground">
              {currentUser.name}
            </h2>
            <p className="text-sm text-muted-foreground">{currentUser.title}</p>
            <div className="mt-3">
              <StatusPill tone={roleTone}>
                <ShieldCheck className="size-3" /> {ROLE_META[currentUser.role].label}
              </StatusPill>
            </div>
          </div>
        </section>

        {/* Details */}
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="font-heading text-sm font-semibold text-foreground">Contact information</h3>
              {editing && <span className="text-xs text-muted-foreground">Editing</span>}
            </div>

            {editing ? (
              <form onSubmit={save} className="space-y-4 p-6" noValidate>
                <EditRow id="p-name" label="Full name">
                  <Input
                    id="p-name"
                    value={draft.name}
                    onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    aria-invalid={Boolean(error) && !draft.name.trim()}
                  />
                </EditRow>
                <EditRow id="p-title" label="Title">
                  <Input
                    id="p-title"
                    value={draft.title}
                    onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  />
                </EditRow>
                <EditRow id="p-email" label="Email">
                  <Input
                    id="p-email"
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                    aria-invalid={Boolean(error) && draft.email.trim() === ""}
                  />
                </EditRow>
                <EditRow id="p-phone" label="Phone">
                  <Input
                    id="p-phone"
                    value={draft.phone}
                    onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                  />
                </EditRow>

                {error && (
                  <p role="alert" className="text-sm text-danger-strong">
                    {error}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <Button type="submit" size="sm">
                    <Check className="size-4" /> Save changes
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={cancel}>
                    <X className="size-4" /> Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <dl className="divide-y divide-border">
                <ReadRow label="Full name" value={currentUser.name} />
                <ReadRow label="Title" value={currentUser.title} />
                <ReadRow
                  label="Email"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="size-3.5 text-muted-foreground" /> {currentUser.email}
                    </span>
                  }
                />
                <ReadRow
                  label="Phone"
                  value={
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="size-3.5 text-muted-foreground" /> {currentUser.phone}
                    </span>
                  }
                />
              </dl>
            )}
          </section>

          {/* Admin-provisioned identity */}
          <section className="rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-6 py-4">
              <Lock className="size-4 text-muted-foreground" />
              <h3 className="font-heading text-sm font-semibold text-foreground">
                Identity &amp; access
              </h3>
              <span className="ml-auto text-xs text-muted-foreground">Provisioned by administrator</span>
            </div>
            <dl className="divide-y divide-border">
              <ReadRow label="Role" value={currentUser.role} />
              <ReadRow
                label="Business unit(s)"
                value={currentUser.businessUnits.join(", ")}
              />
              <ReadRow label="Branch" value={currentUser.branch} />
            </dl>
            <p className="px-6 pb-5 pt-1 text-xs text-muted-foreground text-pretty">
              These attributes govern least-privilege access. Changes require a documented request to
              your administrator and are recorded in the audit log.
            </p>
          </section>
        </div>
      </div>
    </PageContainer>
  )
}

function EditRow({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[160px_1fr] sm:items-center sm:gap-4">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}

function ReadRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 px-6 py-3.5 sm:grid-cols-[160px_1fr] sm:items-center sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground break-words">{value}</dd>
    </div>
  )
}

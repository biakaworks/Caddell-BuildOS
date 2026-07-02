"use client"

import { useEffect, useRef, useState } from "react"
import { HardHat, Loader2, Lock, Mail, ShieldCheck, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "./auth-context"
import { cn } from "@/lib/utils"

type Screen = "signin" | "mfa" | "forgot" | "reset-sent"

export function AuthFlow() {
  const { signIn } = useAuth()
  const [screen, setScreen] = useState<Screen>("signin")
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Move focus to the screen heading on transitions (a11y).
  useEffect(() => {
    headingRef.current?.focus()
  }, [screen])

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Brand panel */}
      <aside className="relative flex shrink-0 flex-col justify-between bg-sidebar px-8 py-10 text-sidebar-foreground lg:w-[42%] lg:px-12 lg:py-14">
        <div className="flex items-center gap-2.5">
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

        <div className="hidden max-w-md lg:block">
          <h2 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-sidebar-accent-foreground text-balance">
            The operating platform for pursuits, projects, and performance.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-sidebar-foreground/75 text-pretty">
            Secure, least-privilege access aligned to how Caddell delivers work across Commercial,
            Governmental, and International units.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-sidebar-foreground/60">
          <ShieldCheck className="size-3.5" />
          Prototype · demo data only · not a live identity system
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm">
          {screen === "signin" && (
            <SignInScreen
              headingRef={headingRef}
              onSuccess={() => setScreen("mfa")}
              onForgot={() => setScreen("forgot")}
            />
          )}
          {screen === "mfa" && (
            <MfaScreen
              headingRef={headingRef}
              onVerified={signIn}
              onBack={() => setScreen("signin")}
            />
          )}
          {screen === "forgot" && (
            <ForgotScreen
              headingRef={headingRef}
              onSent={() => setScreen("reset-sent")}
              onBack={() => setScreen("signin")}
            />
          )}
          {screen === "reset-sent" && (
            <ResetSentScreen headingRef={headingRef} onBack={() => setScreen("signin")} />
          )}
        </div>
      </main>
    </div>
  )
}

type ScreenProps = { headingRef: React.RefObject<HTMLHeadingElement | null> }

/* -------------------------------------------------------------------------- */
/* Sign in                                                                    */
/* -------------------------------------------------------------------------- */
function SignInScreen({
  headingRef,
  onSuccess,
  onForgot,
}: ScreenProps & { onSuccess: () => void; onForgot: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState<"password" | "sso" | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.")
      return
    }
    setError("")
    setLoading("password")
    window.setTimeout(onSuccess, 700)
  }

  function sso() {
    if (loading) return
    setError("")
    setLoading("sso")
    window.setTimeout(onSuccess, 700)
  }

  return (
    <div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-heading text-2xl font-semibold tracking-tight text-foreground outline-none"
      >
        Sign in to BuildOS
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Welcome back. Use your Caddell credentials to continue.
      </p>

      <div className="mt-4 rounded-lg border border-info/25 bg-info-muted px-3 py-2 text-xs text-info">
        Demo — any email and password will work.
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field
          id="email"
          label="Email"
          icon={<Mail className="size-4" />}
          type="email"
          autoComplete="username"
          placeholder="you@caddell.example"
          value={email}
          onChange={setEmail}
          invalid={Boolean(error) && !email.trim()}
        />
        <Field
          id="password"
          label="Password"
          icon={<Lock className="size-4" />}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          invalid={Boolean(error) && !password.trim()}
        />

        {error && (
          <p role="alert" className="text-sm text-danger-strong">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgot}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" variant="cta" size="lg" className="w-full" disabled={loading !== null}>
          {loading === "password" ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={sso}
        disabled={loading !== null}
      >
        {loading === "sso" ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Redirecting…
          </>
        ) : (
          <>
            <KeyRound className="size-4" /> Sign in with SSO
          </>
        )}
      </Button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* MFA                                                                        */
/* -------------------------------------------------------------------------- */
function MfaScreen({
  headingRef,
  onVerified,
  onBack,
}: ScreenProps & { onVerified: () => void; onBack: () => void }) {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your authenticator app.")
      return
    }
    setError("")
    setLoading(true)
    window.setTimeout(onVerified, 700)
  }

  return (
    <div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-heading text-2xl font-semibold tracking-tight text-foreground outline-none"
      >
        Two-factor verification
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Enter the 6-digit code from your authenticator app to finish signing in.
      </p>

      <div className="mt-4 rounded-lg border border-info/25 bg-info-muted px-3 py-2 text-xs text-info">
        Demo — any 6 digits will verify (try <span className="font-mono font-medium">123456</span>).
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <div>
          <label htmlFor="mfa-code" className="mb-1.5 block text-sm font-medium text-foreground">
            Verification code
          </label>
          <Input
            id="mfa-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "mfa-error" : undefined}
            className="h-12 text-center font-mono text-xl tracking-[0.5em]"
          />
        </div>

        {error && (
          <p id="mfa-error" role="alert" className="text-sm text-danger-strong">
            {error}
          </p>
        )}

        <Button type="submit" variant="cta" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Verifying…
            </>
          ) : (
            "Verify & continue"
          )}
        </Button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
        <button
          type="button"
          onClick={() => setResent(true)}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Resend code
        </button>
      </div>
      {resent && (
        <p role="status" className="mt-2 text-right text-xs text-success-strong">
          A new code has been sent.
        </p>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Forgot password                                                            */
/* -------------------------------------------------------------------------- */
function ForgotScreen({
  headingRef,
  onSent,
  onBack,
}: ScreenProps & { onSent: () => void; onBack: () => void }) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    if (!email.trim()) {
      setError("Enter the email associated with your account.")
      return
    }
    setError("")
    setLoading(true)
    window.setTimeout(onSent, 700)
  }

  return (
    <div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-heading text-2xl font-semibold tracking-tight text-foreground outline-none"
      >
        Reset your password
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send a link to reset your password.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <Field
          id="forgot-email"
          label="Email"
          icon={<Mail className="size-4" />}
          type="email"
          autoComplete="username"
          placeholder="you@caddell.example"
          value={email}
          onChange={setEmail}
          invalid={Boolean(error)}
        />

        {error && (
          <p role="alert" className="text-sm text-danger-strong">
            {error}
          </p>
        )}

        <Button type="submit" variant="cta" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Sending…
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to sign in
      </button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Reset link sent confirmation                                               */
/* -------------------------------------------------------------------------- */
function ResetSentScreen({ headingRef, onBack }: ScreenProps & { onBack: () => void }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-muted text-success-strong">
        <CheckCircle2 className="size-6" />
      </div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-4 font-heading text-2xl font-semibold tracking-tight text-foreground outline-none"
      >
        Check your inbox
      </h1>
      <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground text-pretty">
        If an account exists for that email, a password reset link is on its way. The link expires in
        30 minutes.
      </p>
      <Button variant="cta" size="lg" className="mt-6 w-full" onClick={onBack}>
        Back to sign in
      </Button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Shared labeled field                                                       */
/* -------------------------------------------------------------------------- */
function Field({
  id,
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  invalid,
}: {
  id: string
  label: string
  icon: React.ReactNode
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  invalid?: boolean
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <span
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground",
          )}
        >
          {icon}
        </span>
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={invalid}
          className="h-11 pl-9"
        />
      </div>
    </div>
  )
}

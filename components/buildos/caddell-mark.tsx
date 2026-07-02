import { cn } from "@/lib/utils"

/**
 * Compact Caddell brand mark — a squared maroon tile with the heavy white "C"
 * from the CADDELL wordmark. Use this anywhere the full wordmark doesn't fit:
 * favicons, icon-only slots, avatar/identity placeholders, and splash states.
 *
 * Rendered inline so it stays crisp at any size and inherits layout sizing.
 * Never stretch or recolor it — the maroon/white pairing is fixed.
 */
export function CaddellCMark({
  className,
  title = "Caddell",
}: {
  className?: string
  title?: string
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={cn("size-8 shrink-0", className)}
    >
      <rect width="64" height="64" rx="3" fill="#691C32" />
      <path
        d="M 44.02 44.02 A 17 17 0 1 1 44.02 19.98"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10.5"
        strokeLinecap="butt"
      />
    </svg>
  )
}

/**
 * Full-screen splash shown while the app boots / rehydrates the session.
 * Anchored on the compact C-mark so the first paint is unmistakably Caddell.
 */
export function CaddellSplash() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-background">
      <CaddellCMark className="size-14" />
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <span
          className="size-3.5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary"
          aria-hidden="true"
        />
        Loading BuildOS…
      </div>
      <span className="sr-only">Loading</span>
    </div>
  )
}

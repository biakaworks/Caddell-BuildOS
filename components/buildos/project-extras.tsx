"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Activity,
  AlertTriangle,
  Camera,
  Scan,
  Thermometer,
  Droplets,
  Gauge,
  Boxes,
  Wifi,
  WifiOff,
  CheckCircle2,
  Camera as CameraIcon,
  ClipboardList,
  ShieldAlert,
} from "lucide-react"
import type { Project } from "@/lib/mock-data"
import { Meter, StatusPill } from "@/components/buildos/ui"
import { PhaseBadge, PreviewBlock } from "@/components/buildos/phase"
import { cn } from "@/lib/utils"

// ===========================================================================
// Phase 2 — Advanced Schedule & Risk Analytics
// ===========================================================================
const FLOAT_RISK = [
  { activity: "Building enclosure", totalFloat: -4, trend: "eroding", driver: "RFI-204 curtain wall embed" },
  { activity: "MEP overhead rough-in", totalFloat: 6, trend: "stable", driver: "On plan" },
  { activity: "Switchgear delivery", totalFloat: 2, trend: "eroding", driver: "Long-lead procurement" },
  { activity: "Interior finishes", totalFloat: 12, trend: "stable", driver: "Not yet started" },
]

export function RiskAnalyticsTab({ project }: { project: Project }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground">
          Advanced schedule &amp; risk analytics
        </h3>
        <PhaseBadge phase={2} />
      </div>

      <PreviewBlock phase={2} className="bg-card">
        <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-3">
          {/* Monte Carlo completion forecast */}
          <div className="lg:col-span-1">
            <p className="text-xs font-medium text-muted-foreground">Probabilistic completion</p>
            <div className="mt-3 space-y-3">
              <ForecastBar label="P50 (likely)" date="Aug 28, 2025" pct={64} tone="info" />
              <ForecastBar label="P80 (conservative)" date="Sep 19, 2025" pct={80} tone="warning" />
              <ForecastBar label="Contract finish" date={project.finishDate} pct={50} tone="neutral" />
            </div>
            <p className="mt-3 rounded-lg bg-warning-muted px-3 py-2 text-xs text-warning-strong">
              63% probability of meeting the contract finish without schedule recovery.
            </p>
          </div>

          {/* Float erosion table */}
          <div className="lg:col-span-2">
            <p className="text-xs font-medium text-muted-foreground">Critical-path float (work days)</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <tbody>
                  {FLOAT_RISK.map((f) => (
                    <tr key={f.activity} className="border-b border-border last:border-0">
                      <td className="py-2.5 pr-3">
                        <p className="font-medium text-foreground">{f.activity}</p>
                        <p className="text-xs text-muted-foreground">{f.driver}</p>
                      </td>
                      <td className="py-2.5 pr-3 text-right">
                        <span
                          className={cn(
                            "font-semibold tabular-nums",
                            f.totalFloat < 0 ? "text-danger-strong" : f.totalFloat <= 3 ? "text-warning-strong" : "text-foreground",
                          )}
                        >
                          {f.totalFloat > 0 ? "+" : ""}
                          {f.totalFloat}d
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <StatusPill tone={f.trend === "eroding" ? "warning" : "success"} dot={false}>
                          {f.trend}
                        </StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </PreviewBlock>
    </div>
  )
}

function ForecastBar({
  label,
  date,
  pct,
  tone,
}: {
  label: string
  date: string
  pct: number
  tone: "info" | "warning" | "neutral"
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums text-foreground">{date}</span>
      </div>
      <Meter value={pct} tone={tone} />
    </div>
  )
}

// ===========================================================================
// Phase 3 — Reality Capture + IoT / Jobsite sensors
// ===========================================================================
const CAPTURES = [
  { src: "/images/capture-drone.png", label: "Site aerial — drone", meta: "Captured weekly", icon: Camera },
  { src: "/images/capture-interior.png", label: "Level 2 progress", meta: "360° walk", icon: Camera },
  { src: "/images/capture-pointcloud.png", label: "Enclosure laser scan", meta: "Point cloud · 1.2B pts", icon: Scan },
]

const SENSORS = [
  { label: "Slab concrete maturity", value: "3,180 psi", icon: Gauge, tone: "success" as const, note: "Grid E pour · ready to strip" },
  { label: "Ambient temp / humidity", value: "78°F · 54%", icon: Thermometer, tone: "info" as const, note: "Within enclosure tolerance" },
  { label: "Tower crane utilization", value: "71%", icon: Activity, tone: "info" as const, note: "Peak 9–11 AM" },
  { label: "Water intrusion sensor", value: "Alert", icon: Droplets, tone: "warning" as const, note: "Level 1 NE — investigating" },
]

export function RealityCaptureTab() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground">
          Reality capture &amp; jobsite data
        </h3>
        <PhaseBadge phase={3} />
      </div>

      <PreviewBlock phase={3} className="bg-card">
        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {CAPTURES.map((c) => {
              const Icon = c.icon
              return (
                <figure key={c.label} className="group/cap overflow-hidden rounded-xl ring-1 ring-border">
                  <div className="relative aspect-[4/3] bg-muted">
                    <Image
                      src={c.src || "/placeholder.svg"}
                      alt={c.label}
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover/cap:scale-105"
                    />
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-foreground/70 px-1.5 py-0.5 text-[10px] font-medium text-background backdrop-blur-sm">
                      <Icon className="size-3" />
                      {c.meta}
                    </span>
                  </div>
                  <figcaption className="px-3 py-2 text-xs font-medium text-foreground">{c.label}</figcaption>
                </figure>
              )
            })}
          </div>

          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-info-muted/60 px-4 py-3 text-sm text-foreground">
            <Boxes className="mt-0.5 size-4 shrink-0 text-info" />
            <p className="text-pretty leading-relaxed">
              Clash-detection overlays compare the federated BIM model against the latest laser scan — 7
              field deviations flagged on the enclosure for coordination.
            </p>
          </div>

          {/* IoT sensor grid */}
          <p className="mb-3 mt-5 text-xs font-medium text-muted-foreground">Live jobsite sensors</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SENSORS.map((s) => {
              const Icon = s.icon
              const iconTone = {
                success: "bg-success-muted text-success-strong",
                info: "bg-info-muted text-info",
                warning: "bg-warning-muted text-warning-strong",
              }[s.tone]
              return (
                <div key={s.label} className="rounded-xl border border-border bg-background p-3.5">
                  <span className={cn("inline-flex size-7 items-center justify-center rounded-lg", iconTone)}>
                    <Icon className="size-4" />
                  </span>
                  <p className="mt-2.5 font-heading text-base font-semibold tracking-tight text-foreground">{s.value}</p>
                  <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{s.note}</p>
                </div>
              )
            })}
          </div>
        </div>
      </PreviewBlock>
    </div>
  )
}

// ===========================================================================
// Phase 2 — Native mobile field app preview
// ===========================================================================
export function MobileFieldPreview() {
  const [offline, setOffline] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-sm font-semibold tracking-tight text-foreground">
            Native mobile field app
          </h3>
          <PhaseBadge phase={2} />
        </div>
        <button
          onClick={() => setOffline((v) => !v)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
            offline
              ? "border-warning/40 bg-warning-muted text-warning-strong"
              : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
          aria-pressed={offline}
        >
          {offline ? <WifiOff className="size-3.5" /> : <Wifi className="size-3.5" />}
          {offline ? "Low-connectivity mode" : "Simulate offline"}
        </button>
      </div>

      <PreviewBlock phase={2} className="bg-secondary/40" ribbon={false}>
        <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:items-start sm:justify-center sm:gap-10">
          <PhoneFrame offline={offline} />
          <ul className="max-w-xs space-y-3 text-sm">
            <FeatureLine icon={ClipboardList} title="Daily reports" body="Crew counts, weather, and progress logged from the field in seconds." />
            <FeatureLine icon={CameraIcon} title="Photo capture" body="Tag photos to location, scope, and issue — synced to the project record." />
            <FeatureLine icon={ShieldAlert} title="Quality & safety" body="Capture observations and near-misses with severity and corrective actions." />
            <FeatureLine icon={WifiOff} title="Works offline" body="Captures queue locally on low-connectivity sites and sync when back online." />
          </ul>
        </div>
      </PreviewBlock>
    </div>
  )
}

function FeatureLine({ icon: Icon, title, body }: { icon: typeof ClipboardList; title: string; body: string }) {
  return (
    <li className="flex gap-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-info-muted text-info">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </li>
  )
}

function PhoneFrame({ offline }: { offline: boolean }) {
  return (
    <div className="relative w-[260px] shrink-0 rounded-[2.25rem] border-[6px] border-foreground/90 bg-background p-2 shadow-xl">
      <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-foreground/20" />
      <div className="overflow-hidden rounded-[1.75rem] bg-secondary/50">
        {/* App header */}
        <div className="flex items-center justify-between bg-sidebar px-4 pb-3 pt-7 text-sidebar-foreground">
          <div>
            <p className="text-[10px] text-sidebar-foreground/70">BuildOS Field</p>
            <p className="text-sm font-semibold text-sidebar-accent-foreground">Daily Report</p>
          </div>
          {offline ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-medium text-warning">
              <WifiOff className="size-3" /> Offline
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-medium text-success">
              <Wifi className="size-3" /> Synced
            </span>
          )}
        </div>

        <div className="space-y-2.5 p-3">
          {offline && (
            <div className="flex items-center gap-1.5 rounded-lg bg-warning-muted px-2.5 py-1.5 text-[11px] font-medium text-warning-strong">
              <WifiOff className="size-3" />
              3 captures queued — will sync
            </div>
          )}

          <div className="rounded-xl bg-card p-3 ring-1 ring-border">
            <p className="text-[11px] font-medium text-muted-foreground">Crew on site</p>
            <p className="font-heading text-xl font-semibold text-foreground">84</p>
            <p className="text-[10px] text-muted-foreground">Partly cloudy · 78°F</p>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {["/images/capture-interior.png", "/images/capture-drone.png", "/images/capture-pointcloud.png"].map(
              (src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <Image src={src || "/placeholder.svg"} alt="" fill sizes="80px" className="object-cover" />
                </div>
              ),
            )}
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-card p-2.5 ring-1 ring-border">
            <CheckCircle2 className="size-4 text-success" />
            <span className="text-[11px] font-medium text-foreground">Safety walk complete</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-warning-muted p-2.5">
            <AlertTriangle className="size-4 text-warning-strong" />
            <span className="text-[11px] font-medium text-warning-strong">1 observation flagged</span>
          </div>
        </div>
      </div>
    </div>
  )
}

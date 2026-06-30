"use client"

import { useMemo } from "react"
import { AlertTriangle, History, Sparkles } from "lucide-react"
import {
  ESTIMATE_ACCURACY,
  ESTIMATE_ASSEMBLIES,
  ESTIMATE_PROJECT,
  formatCurrency,
  formatNumber,
} from "@/lib/mock-data"
import { useApp } from "@/components/buildos/app-context"
import { PageContainer, PageHeader, SectionHeading } from "@/components/buildos/ui"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function EstimatingView() {
  const { openAsk } = useApp()

  const lines = useMemo(
    () =>
      ESTIMATE_ASSEMBLIES.map((a) => ({ ...a, extended: a.qty * a.unitCost })),
    [],
  )
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.extended, 0), [lines])
  const contingency = subtotal * 0.08
  const total = subtotal + contingency
  const perGsf = total / ESTIMATE_PROJECT.gsf

  return (
    <PageContainer>
      <PageHeader
        title="Estimating"
        subtitle="Conceptual estimate assembled from historical unit costs and comparable projects."
      >
        <Button
          onClick={() =>
            openAsk(
              `Pressure-test the conceptual estimate for ${ESTIMATE_PROJECT.name} against our last three education projects.`,
            )
          }
        >
          <Sparkles className="size-4" />
          Validate with BuildOS
        </Button>
      </PageHeader>

      {/* Basis of estimate */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <BasisStat label="Project" value={ESTIMATE_PROJECT.name} />
        <BasisStat label="Gross SF" value={`${formatNumber(ESTIMATE_PROJECT.gsf)} SF`} />
        <BasisStat label="Delivery" value={ESTIMATE_PROJECT.delivery} />
        <BasisStat label="Basis" value={ESTIMATE_PROJECT.basis} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Assemblies table */}
        <div className="xl:col-span-2">
          <div className="rounded-2xl bg-card ring-1 ring-border">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <SectionHeading
                title="Estimate assemblies"
                description="Unit costs sourced from prior Caddell projects."
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-5 py-2.5 font-medium">CSI / Assembly</th>
                    <th className="px-3 py-2.5 text-right font-medium">Qty</th>
                    <th className="px-3 py-2.5 text-right font-medium">Unit $</th>
                    <th className="px-5 py-2.5 text-right font-medium">Extended</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.id} className="border-b border-border/70 last:border-0 align-top">
                      <td className="px-5 py-3">
                        <div className="flex items-start gap-2">
                          <div>
                            <p className="font-medium text-foreground">{l.assembly}</p>
                            <p className="text-xs text-muted-foreground tabular-nums">{l.csi}</p>
                            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <History className="size-3" />
                              {l.source}
                            </p>
                            {l.risk ? (
                              <p
                                className={cn(
                                  "mt-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
                                  l.risk.level === "bad"
                                    ? "bg-danger-muted text-danger-strong"
                                    : "bg-warning-muted text-warning-strong",
                                )}
                              >
                                <AlertTriangle className="size-3" />
                                {l.risk.note}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                        {formatNumber(l.qty)} {l.unit}
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                        ${formatNumber(l.unitCost)}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums text-foreground">
                        {formatCurrency(l.extended)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Rollup */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
            <h3 className="text-sm font-semibold text-foreground">Estimate summary</h3>
            <dl className="mt-4 space-y-2.5 text-sm">
              <Row label="Direct work subtotal" value={formatCurrency(subtotal)} />
              <Row label="Contingency (8%)" value={formatCurrency(contingency)} muted />
              <div className="my-2 border-t border-border" />
              <Row label="Total conceptual" value={formatCurrency(total)} emphasize />
            </dl>
            <div className="mt-4 rounded-xl bg-primary p-4 text-primary-foreground">
              <p className="text-xs text-primary-foreground/75">Cost per gross SF</p>
              <p className="text-2xl font-semibold tabular-nums">${perGsf.toFixed(0)}</p>
              <p className="text-xs text-primary-foreground/70">
                vs. ${(perGsf * 0.94).toFixed(0)} education benchmark
              </p>
            </div>
          </div>

          <AccuracyCard />
        </div>
      </div>
    </PageContainer>
  )
}

function BasisStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-3.5 ring-1 ring-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground text-balance">{value}</p>
    </div>
  )
}

function Row({
  label,
  value,
  muted,
  emphasize,
}: {
  label: string
  value: string
  muted?: boolean
  emphasize?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={cn(muted ? "text-muted-foreground" : "text-foreground", emphasize && "font-semibold")}>
        {label}
      </dt>
      <dd
        className={cn(
          "tabular-nums",
          emphasize ? "text-lg font-semibold text-foreground" : "font-medium text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  )
}

function AccuracyCard() {
  const max = Math.max(...ESTIMATE_ACCURACY.flatMap((a) => [a.conceptual, a.final]))
  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
      <h3 className="text-sm font-semibold text-foreground">Estimate-to-actual accuracy</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Conceptual estimate vs. final cost on recent jobs ($M).
      </p>
      <div className="mt-4 space-y-3.5">
        {ESTIMATE_ACCURACY.map((a) => {
          const variance = ((a.final - a.conceptual) / a.conceptual) * 100
          return (
            <div key={a.job}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{a.job}</span>
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    Math.abs(variance) <= 3 ? "text-success-strong" : "text-warning-strong",
                  )}
                >
                  {variance > 0 ? "+" : ""}
                  {variance.toFixed(1)}%
                </span>
              </div>
              <div className="mt-1.5 space-y-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-info" style={{ width: `${(a.conceptual / max) * 100}%` }} />
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(a.final / max) * 100}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-info" /> Conceptual
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-primary" /> Final
        </span>
      </div>
    </div>
  )
}

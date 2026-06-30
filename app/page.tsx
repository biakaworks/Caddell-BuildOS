"use client"

import { PageContainer, PageHeader } from "@/components/buildos/ui"
import {
  KpiTiles,
  NeedsAttention,
  PipelineMini,
  ActivityFeed,
  PromoStrip,
  PredictiveInsights,
} from "@/components/buildos/dashboard"
import { useApp } from "@/components/buildos/app-context"

export default function DashboardPage() {
  const { unit } = useApp()
  return (
    <PageContainer>
      <PageHeader
        title="Pulse"
        subtitle={
          unit === "All"
            ? "Portfolio health across Commercial, Governmental, and International business units."
            : `Portfolio health — filtered to the ${unit} business unit.`
        }
      >
        <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
          Updated just now
        </span>
      </PageHeader>

      <div className="mt-6 space-y-6">
        <KpiTiles />
        <PromoStrip />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <NeedsAttention />
          </div>
          <div className="space-y-6">
            <PipelineMini />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ActivityFeed />
          </div>
          <div className="space-y-6">
            <PredictiveInsights />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

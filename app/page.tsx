import { PageContainer } from "@/components/buildos/ui"
import {
  PulseStatRow,
  SchedulePressureStrip,
  ExceptionsPanel,
  ActiveProjectsTable,
  ActivityFeed,
} from "@/components/buildos/dashboard"

export default function PulseDashboard() {
  return (
    <PageContainer>
      <div className="mb-6">
        <h1
          className="text-2xl text-foreground mb-1"
          style={{ letterSpacing: "-0.03em" }}
        >
          Pulse
        </h1>
        <p className="text-sm text-muted-foreground">
          Commercial Glass &amp; Metal — glazing operations overview · Aug 7, 2026
        </p>
      </div>

      <div className="space-y-6">
        <PulseStatRow />
        <SchedulePressureStrip />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <ExceptionsPanel />
            <ActiveProjectsTable />
          </div>
          <div>
            <ActivityFeed />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

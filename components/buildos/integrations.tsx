"use client"

import { useState } from "react"
import { Check, RefreshCw, Plus, Database, CalendarRange, FolderOpen, Box, DollarSign } from "lucide-react"
import { PageContainer, PageHeader, SectionHeading } from "./ui"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type IntegrationStatus = "Connected" | "Syncing" | "Available"
type IntegrationCategory = "ERP & Accounting" | "Scheduling" | "Document Management" | "BIM & Design" | "Estimating"

type Integration = {
  id: string
  name: string
  category: IntegrationCategory
  status: IntegrationStatus
  description: string
  records?: string
  lastSync?: string
}

const INTEGRATIONS: Integration[] = [
  {
    id: "qbo",
    name: "QuickBooks Online",
    category: "ERP & Accounting",
    status: "Connected",
    description: "Bi-directional sync of invoices, job cost, and change orders. Eliminates manual entry between QuickBooks and field data.",
    records: "1,248 transactions synced",
    lastSync: "Today, 6:04 AM",
  },
  {
    id: "sage",
    name: "Sage 300 CRE",
    category: "ERP & Accounting",
    status: "Available",
    description: "Job-cost integration for subcontractors running Sage. Pulls committed costs and AR aging into the project dashboard.",
  },
  {
    id: "procore",
    name: "Procore",
    category: "Scheduling",
    status: "Syncing",
    description: "Read-only pull of GC project schedules and RFI logs. Surfaces GC milestones that affect CG&M install windows.",
    records: "14 active project schedules",
    lastSync: "Syncing now…",
  },
  {
    id: "ms-project",
    name: "Microsoft Project",
    category: "Scheduling",
    status: "Available",
    description: "Import crew deployment plans from .mpp files. Detects crew conflicts against existing CG&M install events.",
  },
  {
    id: "bluebeam",
    name: "Bluebeam Revu",
    category: "Document Management",
    status: "Connected",
    description: "Markup and approval workflow for shop drawings and submittals. Status updates flow back into the Documents module.",
    records: "342 documents tracked",
    lastSync: "Yesterday, 4:17 PM",
  },
  {
    id: "sharepoint",
    name: "SharePoint",
    category: "Document Management",
    status: "Available",
    description: "Mount a SharePoint document library as a project folder. Bidirectional sync keeps submittals and RFIs current.",
  },
  {
    id: "revit",
    name: "Autodesk Revit",
    category: "BIM & Design",
    status: "Available",
    description: "Extract glazing quantities and system types directly from Revit models. Feeds the Fabrication module without manual takeoff.",
  },
  {
    id: "autocad",
    name: "AutoCAD",
    category: "BIM & Design",
    status: "Available",
    description: "DXF/DWG import for shop drawing review and lite-count extraction. Supports CW, storefront, and entrance layouts.",
  },
  {
    id: "glassmaster",
    name: "GlassMaster",
    category: "Estimating",
    status: "Connected",
    description: "Primary estimating platform for CG&M. Awarded bid values and system line items push directly into the Projects module.",
    records: "89 estimates imported",
    lastSync: "Today, 7:30 AM",
  },
  {
    id: "excel",
    name: "Excel Workbooks",
    category: "Estimating",
    status: "Available",
    description: "Legacy takeoff workbooks can be imported via CSV. Maps to project phases and system types automatically.",
  },
]

const CATEGORY_ICON: Record<IntegrationCategory, typeof Database> = {
  "ERP & Accounting": DollarSign,
  "Scheduling": CalendarRange,
  "Document Management": FolderOpen,
  "BIM & Design": Box,
  "Estimating": Database,
}

const CATEGORIES: IntegrationCategory[] = [
  "ERP & Accounting",
  "Scheduling",
  "Document Management",
  "BIM & Design",
  "Estimating",
]

function StatusChip({ status }: { status: IntegrationStatus }) {
  if (status === "Connected") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-success-muted px-2.5 py-1 text-[11px] text-success-strong">
        <Check className="size-3" />
        Connected
      </span>
    )
  }
  if (status === "Syncing") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-info-muted px-2.5 py-1 text-[11px] text-info">
        <RefreshCw className="size-3 motion-safe:animate-spin [animation-duration:2.5s]" />
        Syncing
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
      Available
    </span>
  )
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const [requested, setRequested] = useState(false)
  const isLive = integration.status === "Connected" || integration.status === "Syncing"
  return (
    <div className="flex flex-col border border-border bg-card p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm text-foreground" style={{ letterSpacing: "-0.01em" }}>
          {integration.name}
        </p>
        <StatusChip status={integration.status} />
      </div>
      <p className="flex-1 text-xs text-muted-foreground leading-relaxed">{integration.description}</p>
      {isLive ? (
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span>{integration.records}</span>
          <span>{integration.lastSync}</span>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="mt-3 gap-1.5"
          disabled={requested}
          onClick={() => setRequested(true)}
        >
          {requested ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
          {requested ? "Requested" : "Connect"}
        </Button>
      )}
    </div>
  )
}

export function IntegrationsView() {
  const connected = INTEGRATIONS.filter((i) => i.status !== "Available").length
  const available = INTEGRATIONS.filter((i) => i.status === "Available").length

  return (
    <PageContainer>
      <PageHeader
        title="Integrations"
        subtitle="Connect CG&M's existing toolchain — QuickBooks, Procore, GlassMaster, Bluebeam. BuildOS reads from the systems your teams already trust."
      />

      {/* Summary strip */}
      <div className="mt-5 grid grid-cols-3 gap-px bg-border sm:grid-cols-3 max-w-sm">
        {[
          { label: "Connected", val: connected, cls: "text-success-strong" },
          { label: "Available", val: available, cls: "text-muted-foreground" },
          { label: "Total", val: INTEGRATIONS.length, cls: "text-foreground" },
        ].map(({ label, val, cls }) => (
          <div key={label} className="bg-card px-4 py-4">
            <p className={cn("text-2xl tabular-nums", cls)} style={{ letterSpacing: "-0.03em" }}>{val}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="mt-8 space-y-8">
        {CATEGORIES.map((cat) => {
          const items = INTEGRATIONS.filter((i) => i.category === cat)
          if (!items.length) return null
          const Icon = CATEGORY_ICON[cat]
          return (
            <section key={cat}>
              <div className="mb-3 flex items-center gap-2 border-b border-border pb-2">
                <Icon className="size-4 text-primary/60" />
                <SectionHeading title={cat} />
              </div>
              <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
                {items.map((i) => (
                  <IntegrationCard key={i.id} integration={i} />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <div className="mt-8 flex items-center gap-3 border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
        <Plus className="size-4 shrink-0" />
        Don&apos;t see your system? Request a connector and the CG&M team will scope it.
      </div>
    </PageContainer>
  )
}

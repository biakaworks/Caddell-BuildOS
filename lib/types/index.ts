// CG&M domain types — written as if this is the real production schema.

export type HealthStatus = 'On Schedule' | 'At Risk' | 'Late'
export type ProjectPhase =
  | 'Estimate'
  | 'Submittal'
  | 'Shop Drawings'
  | 'Fabrication'
  | 'Delivery'
  | 'Install'
  | 'Punch'

export const PROJECT_PHASES: ProjectPhase[] = [
  'Estimate',
  'Submittal',
  'Shop Drawings',
  'Fabrication',
  'Delivery',
  'Install',
  'Punch',
]

export type SystemType =
  | 'Curtain Wall'
  | 'Storefront'
  | 'Entrances'
  | 'Operators'
  | 'Specialty Glass'
  | 'Glass Replacement'

export type Sector =
  | 'Education'
  | 'Healthcare'
  | 'Commercial'
  | 'Industrial'
  | 'Hospitality / Civic'

export type State = 'MO' | 'KS' | 'AR' | 'OK'

export type SystemStatus = 'Not Started' | 'In Progress' | 'Complete' | 'On Hold'

export type SystemLine = {
  type: SystemType
  liteCount: number
  status: SystemStatus
  notes?: string
}

export type Project = {
  id: string
  name: string
  city: string
  state: State
  sector: Sector
  gc: string
  contractValue: number
  phase: ProjectPhase
  percentComplete: number
  installWindowStart: string   // ISO date string
  installWindowEnd: string
  hardDeadlineWindow?: string  // e.g. "Summer 2027 shutdown"
  healthStatus: HealthStatus
  systems: SystemLine[]
  atRiskReason?: string
}

// --- Fabrication -----------------------------------------------------------
export type FabStage =
  | 'Cut'
  | 'Machine'
  | 'Assemble'
  | 'Glaze'
  | 'Stage'
  | 'Shipped'

export const FAB_STAGES: FabStage[] = ['Cut', 'Machine', 'Assemble', 'Glaze', 'Stage', 'Shipped']

export type FabItem = {
  id: string
  projectId: string
  description: string
  system: SystemType
  liteCount: number
  dueDate: string
  stage: FabStage
  blocked: boolean
  blockReason?: string
}

// --- Install Schedule ------------------------------------------------------
export type InstallEvent = {
  id: string
  projectId: string
  crew: 'Crew A' | 'Crew B' | 'Crew C'
  city: string
  state: State
  startDate: string
  endDate: string
  conflictWith?: string   // id of conflicting event
}

// --- Bids ------------------------------------------------------------------
export type BidStatus =
  | 'Received'
  | 'In Takeoff'
  | 'Pricing'
  | 'Submitted'
  | 'Awarded'
  | 'Lost'

export const BID_STATUSES: BidStatus[] = [
  'Received',
  'In Takeoff',
  'Pricing',
  'Submitted',
  'Awarded',
  'Lost',
]

export type Bid = {
  ref: string
  projectName: string
  gc: string
  systems: SystemType[]
  bidDueDate: string
  status: BidStatus
  estimator: string
  estimatedHours: number
  city: string
  state: State
  sector: Sector
  shutdownConstraint?: string
}

// --- Pipeline / Opportunities ----------------------------------------------
export type OpportunityStage =
  | 'Lead'
  | 'Qualified'
  | 'Bidding'
  | 'Proposal Out'
  | 'Won'
  | 'Lost'

export const OPPORTUNITY_STAGES: OpportunityStage[] = [
  'Lead',
  'Qualified',
  'Bidding',
  'Proposal Out',
  'Won',
  'Lost',
]

export type Opportunity = {
  id: string
  name: string
  gc: string
  stage: OpportunityStage
  value: number
  closeDate: string
  owner: string
  sector: Sector
  city: string
  state: State
  systems: SystemType[]
}

// --- Contacts --------------------------------------------------------------
export type ContactRole = 'GC PM' | 'Architect' | 'Facilities Director' | 'Owner'

export type Contact = {
  id: string
  name: string
  company: string
  role: ContactRole
  phone: string
  email: string
  projects: string[]   // project ids
}

// --- Emergency Dispatch ----------------------------------------------------
export type TicketStatus =
  | 'New'
  | 'Dispatched'
  | 'En Route'
  | 'On Site'
  | 'Made Safe'
  | 'Resolved'

export type Ticket = {
  id: string
  location: string
  opening: string
  hazardState: string
  reportedAt: string
  dispatchedAt?: string
  enRouteAt?: string
  onSiteAt?: string
  securedAt?: string
  scheduledAt?: string
  resolvedAt?: string
  status: TicketStatus
  techAssigned?: string
  customerPhone?: string
}

// --- Documents -------------------------------------------------------------
export type DocType =
  | 'Shop Drawing'
  | 'Submittal'
  | 'RFI'
  | 'Change Order'

export type ApprovalState =
  | 'Draft'
  | 'Submitted'
  | 'Awaiting Architect Approval'
  | 'Approved'
  | 'Revise & Resubmit'

export type Document = {
  id: string
  projectId: string
  name: string
  type: DocType
  revision: string
  approvalState: ApprovalState
  updatedAt: string
}

// --- Activity Feed ---------------------------------------------------------
export type ActivityEvent = {
  id: string
  projectId: string
  timestamp: string
  actor: string
  message: string
}

// BuildOS mock data — clearly generic, illustrative placeholders.
// NOT real Caddell contract or cost figures.

export type BusinessUnit = "Commercial" | "Governmental" | "International"
export const BUSINESS_UNITS: BusinessUnit[] = [
  "Commercial",
  "Governmental",
  "International",
]

export type Health = "on-track" | "at-risk" | "critical"
export type DeliveryMethod = "Design-Build" | "CMaR" | "GC"
export type PursuitStage =
  | "Identified"
  | "Go/No-Go"
  | "Proposal"
  | "Submitted"
  | "Won"
  | "Lost"

export const PURSUIT_STAGES: PursuitStage[] = [
  "Identified",
  "Go/No-Go",
  "Proposal",
  "Submitted",
  "Won",
  "Lost",
]

export const formatCurrency = (value: number, compact = true): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value)

export const formatNumber = (value: number): string =>
  new Intl.NumberFormat("en-US").format(value)

// ---------------------------------------------------------------------------
// Dashboard KPIs
// ---------------------------------------------------------------------------
export type Kpi = {
  id: string
  label: string
  value: string
  delta: number // percent change vs. prior period
  deltaLabel: string
  intent: "good" | "warn" | "bad" | "neutral"
  spark: number[]
  goodWhenUp: boolean
}

export const KPIS: Kpi[] = [
  {
    id: "pursuits",
    label: "Active Pursuits",
    value: "28",
    delta: 12,
    deltaLabel: "+3 this quarter",
    intent: "good",
    goodWhenUp: true,
    spark: [18, 20, 19, 22, 24, 23, 25, 28],
  },
  {
    id: "winrate",
    label: "Win Rate (TTM)",
    value: "41%",
    delta: 4,
    deltaLabel: "+4 pts YoY",
    intent: "good",
    goodWhenUp: true,
    spark: [33, 35, 34, 36, 38, 37, 40, 41],
  },
  {
    id: "inflight",
    label: "Projects in Flight",
    value: "19",
    delta: 0,
    deltaLabel: "Flat vs. last month",
    intent: "neutral",
    goodWhenUp: true,
    spark: [17, 18, 18, 19, 19, 18, 19, 19],
  },
  {
    id: "schedule",
    label: "Schedule Health",
    value: "84%",
    delta: -3,
    deltaLabel: "3 projects slipped",
    intent: "warn",
    goodWhenUp: true,
    spark: [90, 89, 88, 87, 88, 86, 85, 84],
  },
  {
    id: "budget",
    label: "Budget Variance",
    value: "+1.8%",
    delta: 1.8,
    deltaLabel: "Over baseline",
    intent: "warn",
    goodWhenUp: false,
    spark: [0.4, 0.6, 0.9, 1.1, 1.0, 1.3, 1.6, 1.8],
  },
  {
    id: "trir",
    label: "Safety TRIR",
    value: "0.61",
    delta: -18,
    deltaLabel: "Below 0.75 target",
    intent: "good",
    goodWhenUp: false,
    spark: [0.95, 0.9, 0.84, 0.8, 0.74, 0.7, 0.65, 0.61],
  },
]

// ---------------------------------------------------------------------------
// Needs Attention
// ---------------------------------------------------------------------------
export type AttentionType = "rfi" | "submittal" | "schedule" | "pursuit" | "safety"
export type AttentionItem = {
  id: string
  type: AttentionType
  title: string
  project: string
  unit: BusinessUnit
  meta: string
  severity: "critical" | "at-risk"
  age: string
  href: string
}

export const ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: "att-1",
    type: "rfi",
    title: "RFI-204 — Curtain wall embed conflict",
    project: "Regional Logistics Center",
    unit: "Commercial",
    meta: "Owner: Structural EOR",
    severity: "critical",
    age: "9 days overdue",
    href: "/projects/regional-logistics-center?tab=rfis",
  },
  {
    id: "att-2",
    type: "submittal",
    title: "SUB-118 — Exterior glazing system",
    project: "Federal Courthouse Renovation",
    unit: "Governmental",
    meta: "Reviewer: Architect of Record",
    severity: "critical",
    age: "6 days overdue",
    href: "/projects/federal-courthouse-renovation?tab=submittals",
  },
  {
    id: "att-3",
    type: "schedule",
    title: "Foundations milestone trending late",
    project: "Overseas Embassy Annex",
    unit: "International",
    meta: "Critical path · 11-day float erosion",
    severity: "at-risk",
    age: "Updated 2h ago",
    href: "/projects/overseas-embassy-annex?tab=schedule",
  },
  {
    id: "att-4",
    type: "submittal",
    title: "SUB-090 — Structural steel shop drawings",
    project: "K-12 Campus Expansion",
    unit: "Commercial",
    meta: "Reviewer: SER · stalled in review",
    severity: "at-risk",
    age: "14 days in queue",
    href: "/projects/k-12-campus-expansion?tab=submittals",
  },
  {
    id: "att-5",
    type: "pursuit",
    title: "Go/No-Go decision due",
    project: "Coastal Data Center Campus",
    unit: "Commercial",
    meta: "Est. value $240M · gate review pending",
    severity: "at-risk",
    age: "Due in 2 days",
    href: "/pursuits",
  },
  {
    id: "att-6",
    type: "safety",
    title: "Open safety observation — fall protection",
    project: "Regional Logistics Center",
    unit: "Commercial",
    meta: "Field report DR-0612",
    severity: "at-risk",
    age: "Logged yesterday",
    href: "/projects/regional-logistics-center?tab=field",
  },
]

// ---------------------------------------------------------------------------
// Activity feed
// ---------------------------------------------------------------------------
export type ActivityItem = {
  id: string
  actor: string
  initials: string
  action: string
  target: string
  unit: BusinessUnit
  time: string
}

export const ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    actor: "Dana Whitfield",
    initials: "DW",
    action: "moved a pursuit to",
    target: "Proposal — Coastal Data Center Campus",
    unit: "Commercial",
    time: "12m ago",
  },
  {
    id: "a2",
    actor: "Marcus Reyes",
    initials: "MR",
    action: "answered",
    target: "RFI-198 on Federal Courthouse Renovation",
    unit: "Governmental",
    time: "48m ago",
  },
  {
    id: "a3",
    actor: "Priya Anand",
    initials: "PA",
    action: "published a conceptual estimate for",
    target: "K-12 Campus Expansion",
    unit: "Commercial",
    time: "2h ago",
  },
  {
    id: "a4",
    actor: "BuildOS AI",
    initials: "AI",
    action: "drafted win themes for",
    target: "Overseas Embassy Annex proposal",
    unit: "International",
    time: "3h ago",
  },
  {
    id: "a5",
    actor: "Tom Becker",
    initials: "TB",
    action: "submitted a daily report for",
    target: "Regional Logistics Center",
    unit: "Commercial",
    time: "5h ago",
  },
  {
    id: "a6",
    actor: "Lena Ortiz",
    initials: "LO",
    action: "logged a Go decision on",
    target: "State Transit Maintenance Facility",
    unit: "Governmental",
    time: "Yesterday",
  },
]

// ---------------------------------------------------------------------------
// Pursuits
// ---------------------------------------------------------------------------
export type ComparableProject = {
  name: string
  year: string
  value: string
  delivery: DeliveryMethod
  outcome: "Won" | "Delivered"
  winThemes: string[]
  result: string
  subcontractor: { name: string; trade: string; rating: number; note: string }
}

export type Pursuit = {
  id: string
  name: string
  stage: PursuitStage
  unit: BusinessUnit
  market: string
  delivery: DeliveryMethod
  clientType: string
  value: number
  geography: string
  probability: number
  dueLabel: string
  flagged?: boolean
  captain: string
  summary: string
  comparables: ComparableProject[]
}

export const PURSUITS: Pursuit[] = [
  {
    id: "p-coastal-dc",
    name: "Coastal Data Center Campus",
    stage: "Go/No-Go",
    unit: "Commercial",
    market: "Mission-Critical / Data Center",
    delivery: "Design-Build",
    clientType: "Hyperscale Developer",
    value: 240_000_000,
    geography: "Southeast US",
    probability: 45,
    dueLabel: "Gate review in 2 days",
    flagged: true,
    captain: "Dana Whitfield",
    summary:
      "Three-building hyperscale campus with on-site substation. Aggressive energization date drives a design-build pursuit anchored on speed-to-power.",
    comparables: [
      {
        name: "Inland Hyperscale Phase II",
        year: "2023",
        value: "$310M",
        delivery: "Design-Build",
        outcome: "Delivered",
        winThemes: ["Speed to power", "Self-perform concrete", "Owner-direct switchgear"],
        result: "Energized 6 weeks ahead of contract milestone.",
        subcontractor: {
          name: "Meridian Electric",
          trade: "Electrical",
          rating: 4.6,
          note: "Strong on long-lead switchgear coordination.",
        },
      },
      {
        name: "Regional Cloud Node",
        year: "2021",
        value: "$165M",
        delivery: "CMaR",
        outcome: "Delivered",
        winThemes: ["Phased commissioning", "Modular skids"],
        result: "Zero recordable incidents across 540K craft hours.",
        subcontractor: {
          name: "Apex Mechanical",
          trade: "Mechanical",
          rating: 4.2,
          note: "Reliable on CRAH installs; watch shop-drawing lead time.",
        },
      },
    ],
  },
  {
    id: "p-embassy",
    name: "Overseas Embassy Annex",
    stage: "Proposal",
    unit: "International",
    market: "Federal / Diplomatic",
    delivery: "Design-Build",
    clientType: "Federal Agency",
    value: 185_000_000,
    geography: "EMEA",
    probability: 55,
    dueLabel: "Proposal due in 9 days",
    flagged: true,
    captain: "Sofia Marquez",
    summary:
      "Secure annex with blast-resistant facade and strict accreditation requirements. Local labor integration and security clearances are key differentiators.",
    comparables: [
      {
        name: "Consulate Compound Modernization",
        year: "2022",
        value: "$140M",
        delivery: "Design-Build",
        outcome: "Won",
        winThemes: ["Cleared workforce", "Blast-resistant facade", "Local JV partner"],
        result: "Met all accreditation milestones on first inspection.",
        subcontractor: {
          name: "Atlas Facade Systems",
          trade: "Facade",
          rating: 4.7,
          note: "Proven blast-resistant glazing track record.",
        },
      },
    ],
  },
  {
    id: "p-courthouse-2",
    name: "Federal Courthouse — South Wing",
    stage: "Submitted",
    unit: "Governmental",
    market: "Justice / Civic",
    delivery: "CMaR",
    clientType: "GSA",
    value: 96_000_000,
    geography: "Mid-Atlantic US",
    probability: 60,
    dueLabel: "Award expected in 3 weeks",
    captain: "Marcus Reyes",
    summary:
      "Occupied-facility addition with phased security zoning. Continuity-of-operations planning is the central evaluation theme.",
    comparables: [
      {
        name: "Federal Courthouse Renovation",
        year: "2020",
        value: "$88M",
        delivery: "CMaR",
        outcome: "Delivered",
        winThemes: ["Occupied-facility phasing", "Security zoning", "GMP transparency"],
        result: "Maintained full court operations through construction.",
        subcontractor: {
          name: "Sentry Security Integrators",
          trade: "Electronic Security",
          rating: 4.4,
          note: "Strong on SCIF integration.",
        },
      },
    ],
  },
  {
    id: "p-transit",
    name: "State Transit Maintenance Facility",
    stage: "Identified",
    unit: "Governmental",
    market: "Transportation",
    delivery: "GC",
    clientType: "State DOT",
    value: 64_000_000,
    geography: "Midwest US",
    probability: 25,
    dueLabel: "RFQ released",
    captain: "Lena Ortiz",
    summary:
      "Heavy-vehicle maintenance facility with fueling and wash systems. Early relationship-building underway with the DOT capital program office.",
    comparables: [],
  },
  {
    id: "p-k12-2",
    name: "K-12 STEM Academy",
    stage: "Proposal",
    unit: "Commercial",
    market: "Education",
    delivery: "CMaR",
    clientType: "School District",
    value: 78_000_000,
    geography: "Southwest US",
    probability: 50,
    dueLabel: "Interview in 6 days",
    captain: "Priya Anand",
    summary:
      "New STEM-focused campus with occupied adjacency to existing school. Community engagement and summer-window scheduling drive the approach.",
    comparables: [
      {
        name: "K-12 Campus Expansion",
        year: "2023",
        value: "$72M",
        delivery: "CMaR",
        outcome: "Delivered",
        winThemes: ["Summer-window phasing", "Community engagement", "Self-perform sitework"],
        result: "Opened on schedule for fall term.",
        subcontractor: {
          name: "Cornerstone Concrete",
          trade: "Concrete",
          rating: 4.5,
          note: "Dependable on aggressive sitework schedules.",
        },
      },
    ],
  },
  {
    id: "p-port",
    name: "International Port Terminal",
    stage: "Go/No-Go",
    unit: "International",
    market: "Infrastructure / Marine",
    delivery: "Design-Build",
    clientType: "Port Authority",
    value: 320_000_000,
    geography: "LATAM",
    probability: 30,
    dueLabel: "Gate review in 5 days",
    captain: "Sofia Marquez",
    summary:
      "Container terminal expansion with marine works and crane rail. High-risk pursuit pending geotechnical and partner due diligence.",
    comparables: [],
  },
  {
    id: "p-bio",
    name: "Biopharma Manufacturing Plant",
    stage: "Submitted",
    unit: "Commercial",
    market: "Advanced Manufacturing",
    delivery: "Design-Build",
    clientType: "Life Sciences Corp.",
    value: 210_000_000,
    geography: "Northeast US",
    probability: 58,
    dueLabel: "Award expected in 2 weeks",
    captain: "Dana Whitfield",
    summary:
      "GMP fill-finish facility with cleanroom build-out. Validation-driven schedule and commissioning rigor are the evaluation focus.",
    comparables: [
      {
        name: "Inland Hyperscale Phase II",
        year: "2023",
        value: "$310M",
        delivery: "Design-Build",
        outcome: "Delivered",
        winThemes: ["Speed to power", "Commissioning rigor"],
        result: "Energized 6 weeks ahead of milestone.",
        subcontractor: {
          name: "Apex Mechanical",
          trade: "Mechanical",
          rating: 4.2,
          note: "Cleanroom HVAC experience.",
        },
      },
    ],
  },
  {
    id: "p-won-civic",
    name: "Civic Center Modernization",
    stage: "Won",
    unit: "Governmental",
    market: "Civic",
    delivery: "CMaR",
    clientType: "Municipality",
    value: 54_000_000,
    geography: "West US",
    probability: 100,
    dueLabel: "Awarded · mobilizing",
    captain: "Lena Ortiz",
    summary:
      "Award secured. Transitioning to preconstruction with GMP development underway.",
    comparables: [],
  },
  {
    id: "p-lost-mixed",
    name: "Mixed-Use Tower",
    stage: "Lost",
    unit: "Commercial",
    market: "Commercial / Residential",
    delivery: "GC",
    clientType: "Private Developer",
    value: 130_000_000,
    geography: "Southeast US",
    probability: 0,
    dueLabel: "Not awarded",
    captain: "Priya Anand",
    summary:
      "Lost on price. Debrief captured: competitor self-performed structure for a 4% cost advantage.",
    comparables: [],
  },
]

// ---------------------------------------------------------------------------
// Projects (shared state)
// ---------------------------------------------------------------------------
export type Rfi = {
  id: string
  subject: string
  status: "Open" | "In Review" | "Answered" | "Overdue"
  owner: string
  due: string
  overdue?: boolean
}
export type Submittal = {
  id: string
  item: string
  status: "Pending" | "In Review" | "Approved" | "Revise & Resubmit" | "Overdue"
  reviewer: string
  due: string
  overdue?: boolean
}
export type SovLine = {
  code: string
  description: string
  budget: number
  committed: number
  spent: number
}
export type FieldReport = {
  id: string
  date: string
  author: string
  crew: number
  weather: string
  summary: string
  observations: { type: "safety" | "quality"; severity: Health; note: string }[]
}
export type ScheduleMilestone = {
  name: string
  date: string
  status: "complete" | "in-progress" | "upcoming"
  critical: boolean
  health: Health
}

export type Project = {
  slug: string
  name: string
  unit: BusinessUnit
  delivery: DeliveryMethod
  market: string
  location: string
  contractValue: number
  percentComplete: number
  scheduleHealth: Health
  budgetVariancePct: number
  pm: string
  startDate: string
  finishDate: string
  scheduleNote: string
  milestones: ScheduleMilestone[]
  sov: SovLine[]
  rfis: Rfi[]
  submittals: Submittal[]
  field: FieldReport[]
}

export const PROJECTS: Project[] = [
  {
    slug: "regional-logistics-center",
    name: "Regional Logistics Center",
    unit: "Commercial",
    delivery: "Design-Build",
    market: "Industrial / Logistics",
    location: "Southeast US",
    contractValue: 142_000_000,
    percentComplete: 62,
    scheduleHealth: "at-risk",
    budgetVariancePct: 2.4,
    pm: "Tom Becker",
    startDate: "Mar 2024",
    finishDate: "Aug 2025",
    scheduleNote:
      "Curtain wall embed conflict (RFI-204) is eroding float on the enclosure milestone. Recovery plan under review.",
    milestones: [
      { name: "Mobilization", date: "Mar 2024", status: "complete", critical: false, health: "on-track" },
      { name: "Foundations Complete", date: "Aug 2024", status: "complete", critical: true, health: "on-track" },
      { name: "Structure Topped Out", date: "Jan 2025", status: "complete", critical: true, health: "on-track" },
      { name: "Building Enclosed", date: "May 2025", status: "in-progress", critical: true, health: "at-risk" },
      { name: "Substantial Completion", date: "Aug 2025", status: "upcoming", critical: true, health: "at-risk" },
    ],
    sov: [
      { code: "03", description: "Concrete", budget: 18_400_000, committed: 18_100_000, spent: 16_900_000 },
      { code: "05", description: "Structural Steel", budget: 22_700_000, committed: 22_700_000, spent: 21_000_000 },
      { code: "07", description: "Thermal & Moisture", budget: 9_300_000, committed: 9_800_000, spent: 6_400_000 },
      { code: "08", description: "Openings / Glazing", budget: 7_100_000, committed: 7_400_000, spent: 3_200_000 },
      { code: "23", description: "HVAC", budget: 14_200_000, committed: 13_900_000, spent: 8_100_000 },
      { code: "26", description: "Electrical", budget: 16_800_000, committed: 16_500_000, spent: 9_700_000 },
    ],
    rfis: [
      { id: "RFI-204", subject: "Curtain wall embed conflict", status: "Overdue", owner: "Structural EOR", due: "9 days ago", overdue: true },
      { id: "RFI-211", subject: "Dock leveler pit dimensions", status: "Open", owner: "Architect", due: "in 4 days" },
      { id: "RFI-209", subject: "Fire pump room clearances", status: "In Review", owner: "MEP Engineer", due: "in 6 days" },
      { id: "RFI-198", subject: "Slab joint layout at grid F", status: "Answered", owner: "Structural EOR", due: "closed" },
    ],
    submittals: [
      { id: "SUB-141", item: "Roofing membrane system", status: "In Review", reviewer: "Architect", due: "in 3 days" },
      { id: "SUB-138", item: "Overhead coiling doors", status: "Approved", reviewer: "Architect", due: "closed" },
      { id: "SUB-150", item: "Switchgear lineup", status: "Pending", reviewer: "EE of Record", due: "in 8 days" },
      { id: "SUB-129", item: "Storefront glazing", status: "Revise & Resubmit", reviewer: "Architect", due: "returned" },
    ],
    field: [
      {
        id: "DR-0612",
        date: "Yesterday",
        author: "Tom Becker",
        crew: 84,
        weather: "Partly cloudy, 78°F",
        summary: "Enclosure crews continued curtain wall install on the east elevation. MEP rough-in advancing on level 2.",
        observations: [
          { type: "safety", severity: "at-risk", note: "Fall-protection tie-off gap flagged at east leading edge; corrected same day." },
          { type: "quality", severity: "on-track", note: "Concrete slab flatness within tolerance at grid E." },
        ],
      },
      {
        id: "DR-0611",
        date: "2 days ago",
        author: "Tom Becker",
        crew: 79,
        weather: "Clear, 81°F",
        summary: "Steel touch-up and deck welding complete on the high bay. Underground plumbing inspection passed.",
        observations: [
          { type: "quality", severity: "on-track", note: "Weld inspection passed on high-bay connections." },
        ],
      },
    ],
  },
  {
    slug: "federal-courthouse-renovation",
    name: "Federal Courthouse Renovation",
    unit: "Governmental",
    delivery: "CMaR",
    market: "Justice / Civic",
    location: "Mid-Atlantic US",
    contractValue: 88_000_000,
    percentComplete: 38,
    scheduleHealth: "on-track",
    budgetVariancePct: -0.6,
    pm: "Marcus Reyes",
    startDate: "Jul 2024",
    finishDate: "Dec 2025",
    scheduleNote:
      "Occupied-facility phasing on plan. Exterior glazing submittal (SUB-118) is the current critical review.",
    milestones: [
      { name: "Phase 1 Demolition", date: "Sep 2024", status: "complete", critical: true, health: "on-track" },
      { name: "Security Zone Buildout", date: "Feb 2025", status: "in-progress", critical: true, health: "on-track" },
      { name: "Courtroom Fit-out", date: "Aug 2025", status: "upcoming", critical: true, health: "on-track" },
      { name: "Substantial Completion", date: "Dec 2025", status: "upcoming", critical: true, health: "on-track" },
    ],
    sov: [
      { code: "02", description: "Selective Demolition", budget: 4_200_000, committed: 4_200_000, spent: 4_000_000 },
      { code: "08", description: "Openings / Glazing", budget: 6_800_000, committed: 6_900_000, spent: 2_100_000 },
      { code: "09", description: "Finishes", budget: 11_400_000, committed: 10_900_000, spent: 3_300_000 },
      { code: "28", description: "Electronic Safety & Security", budget: 9_600_000, committed: 9_600_000, spent: 4_100_000 },
    ],
    rfis: [
      { id: "RFI-074", subject: "Historic cornice restoration detail", status: "In Review", owner: "Architect", due: "in 5 days" },
      { id: "RFI-071", subject: "Courtroom AV conduit routing", status: "Open", owner: "MEP Engineer", due: "in 2 days" },
      { id: "RFI-066", subject: "Blast film glazing spec", status: "Answered", owner: "Security Consultant", due: "closed" },
    ],
    submittals: [
      { id: "SUB-118", item: "Exterior glazing system", status: "Overdue", reviewer: "Architect of Record", due: "6 days ago", overdue: true },
      { id: "SUB-120", item: "Security door hardware", status: "In Review", reviewer: "Security Consultant", due: "in 4 days" },
      { id: "SUB-110", item: "Millwork — judges' bench", status: "Approved", reviewer: "Architect", due: "closed" },
    ],
    field: [
      {
        id: "DR-0339",
        date: "Today",
        author: "Marcus Reyes",
        crew: 46,
        weather: "Overcast, 64°F",
        summary: "Security zone framing and in-wall blocking advancing. Coordination walk completed with the security integrator.",
        observations: [
          { type: "quality", severity: "on-track", note: "In-wall blocking verified against security device layout." },
        ],
      },
    ],
  },
  {
    slug: "overseas-embassy-annex",
    name: "Overseas Embassy Annex",
    unit: "International",
    delivery: "Design-Build",
    market: "Federal / Diplomatic",
    location: "EMEA",
    contractValue: 176_000_000,
    percentComplete: 21,
    scheduleHealth: "critical",
    budgetVariancePct: 3.9,
    pm: "Sofia Marquez",
    startDate: "Jan 2025",
    finishDate: "Jun 2026",
    scheduleNote:
      "Foundations milestone trending late with 11-day float erosion driven by an import permit delay on structural steel.",
    milestones: [
      { name: "Site Mobilization", date: "Jan 2025", status: "complete", critical: false, health: "on-track" },
      { name: "Foundations Complete", date: "Jun 2025", status: "in-progress", critical: true, health: "critical" },
      { name: "Superstructure", date: "Dec 2025", status: "upcoming", critical: true, health: "at-risk" },
      { name: "Accreditation", date: "Jun 2026", status: "upcoming", critical: true, health: "at-risk" },
    ],
    sov: [
      { code: "31", description: "Earthwork", budget: 12_100_000, committed: 12_400_000, spent: 9_900_000 },
      { code: "03", description: "Concrete", budget: 21_300_000, committed: 21_300_000, spent: 6_200_000 },
      { code: "05", description: "Structural Steel", budget: 18_700_000, committed: 19_500_000, spent: 1_100_000 },
      { code: "08", description: "Blast-Resistant Facade", budget: 14_900_000, committed: 14_900_000, spent: 0 },
    ],
    rfis: [
      { id: "RFI-031", subject: "Anti-ram bollard foundation depth", status: "Open", owner: "Civil Engineer", due: "in 3 days" },
      { id: "RFI-028", subject: "Steel import certification", status: "Overdue", owner: "Owner / Agency", due: "4 days ago", overdue: true },
    ],
    submittals: [
      { id: "SUB-044", item: "Blast-resistant glazing", status: "In Review", reviewer: "Security Consultant", due: "in 7 days" },
      { id: "SUB-039", item: "Structural steel shop drawings", status: "Pending", reviewer: "SER", due: "in 10 days" },
    ],
    field: [
      {
        id: "DR-0102",
        date: "Today",
        author: "Sofia Marquez",
        crew: 38,
        weather: "Sunny, 71°F",
        summary: "Mat foundation rebar placement underway in the north zone. Steel delivery still held in customs.",
        observations: [
          { type: "safety", severity: "on-track", note: "Daily toolbox talk completed; no incidents." },
          { type: "quality", severity: "at-risk", note: "Rebar spacing rework required at column line 4." },
        ],
      },
    ],
  },
  {
    slug: "k-12-campus-expansion",
    name: "K-12 Campus Expansion",
    unit: "Commercial",
    delivery: "CMaR",
    market: "Education",
    location: "Southwest US",
    contractValue: 72_000_000,
    percentComplete: 49,
    scheduleHealth: "on-track",
    budgetVariancePct: 0.8,
    pm: "Priya Anand",
    startDate: "Jun 2024",
    finishDate: "Jul 2025",
    scheduleNote:
      "Summer-window phasing on plan. Structural steel shop drawings (SUB-090) stalled in review and need expediting.",
    milestones: [
      { name: "Sitework", date: "Aug 2024", status: "complete", critical: false, health: "on-track" },
      { name: "Foundations", date: "Nov 2024", status: "complete", critical: true, health: "on-track" },
      { name: "Structure & Enclosure", date: "Apr 2025", status: "in-progress", critical: true, health: "on-track" },
      { name: "Substantial Completion", date: "Jul 2025", status: "upcoming", critical: true, health: "on-track" },
    ],
    sov: [
      { code: "31", description: "Sitework", budget: 6_900_000, committed: 6_700_000, spent: 6_500_000 },
      { code: "03", description: "Concrete", budget: 8_800_000, committed: 8_800_000, spent: 7_900_000 },
      { code: "05", description: "Structural Steel", budget: 9_400_000, committed: 9_400_000, spent: 4_200_000 },
      { code: "09", description: "Finishes", budget: 7_600_000, committed: 7_100_000, spent: 1_800_000 },
    ],
    rfis: [
      { id: "RFI-052", subject: "Gym roof deck attachment", status: "Answered", owner: "Structural EOR", due: "closed" },
      { id: "RFI-058", subject: "Classroom casework dimensions", status: "Open", owner: "Architect", due: "in 5 days" },
    ],
    submittals: [
      { id: "SUB-090", item: "Structural steel shop drawings", status: "In Review", reviewer: "SER", due: "in 1 day" },
      { id: "SUB-095", item: "Gym flooring system", status: "Approved", reviewer: "Architect", due: "closed" },
    ],
    field: [
      {
        id: "DR-0288",
        date: "Yesterday",
        author: "Priya Anand",
        crew: 52,
        weather: "Clear, 88°F",
        summary: "Steel erection continued on the classroom wing. Underground utilities tie-in inspected and approved.",
        observations: [
          { type: "quality", severity: "on-track", note: "Utility tie-in inspection passed." },
        ],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Estimating — conceptual estimate assemblies
// ---------------------------------------------------------------------------
export type Assembly = {
  id: string
  csi: string
  assembly: string
  qty: number
  unit: string
  unitCost: number
  source: string
  risk?: { level: "warn" | "bad"; note: string }
}

export const ESTIMATE_PROJECT = {
  name: "K-12 STEM Academy",
  unit: "Commercial" as BusinessUnit,
  delivery: "CMaR" as DeliveryMethod,
  gsf: 96_000,
  basis: "ROM / Conceptual (Design Development pending)",
}

export const ESTIMATE_ASSEMBLIES: Assembly[] = [
  { id: "e1", csi: "31 00 00", assembly: "Sitework & earthwork", qty: 96_000, unit: "SF", unitCost: 14, source: "Hist. avg · 3 K-12 jobs" },
  { id: "e2", csi: "03 30 00", assembly: "Cast-in-place concrete — foundations", qty: 96_000, unit: "SF", unitCost: 22, source: "K-12 Campus Expansion (2023)" },
  {
    id: "e3",
    csi: "05 12 00",
    assembly: "Structural steel frame",
    qty: 96_000,
    unit: "SF",
    unitCost: 38,
    source: "Regional benchmark",
    risk: { level: "warn", note: "Steel slipped budget on 2 prior jobs — escalation risk." },
  },
  { id: "e4", csi: "07 40 00", assembly: "Roofing & weatherproofing", qty: 38_000, unit: "SF", unitCost: 26, source: "Hist. avg" },
  {
    id: "e5",
    csi: "08 40 00",
    assembly: "Curtain wall & glazing",
    qty: 14_500,
    unit: "SF",
    unitCost: 92,
    source: "Mixed-Use Tower (2022)",
    risk: { level: "bad", note: "Glazing lead time drove a change order on 3 of 4 comparable jobs." },
  },
  { id: "e6", csi: "09 00 00", assembly: "Interior finishes", qty: 96_000, unit: "SF", unitCost: 58, source: "Hist. avg · education" },
  { id: "e7", csi: "23 00 00", assembly: "HVAC systems", qty: 96_000, unit: "SF", unitCost: 46, source: "Education benchmark" },
  { id: "e8", csi: "26 00 00", assembly: "Electrical & lighting", qty: 96_000, unit: "SF", unitCost: 41, source: "Hist. avg" },
  { id: "e9", csi: "11 50 00", assembly: "STEM lab equipment & casework", qty: 8, unit: "EA", unitCost: 210_000, source: "Vendor ROM" },
]

export const ESTIMATE_ACCURACY = [
  { job: "Civic Center", conceptual: 51, final: 54 },
  { job: "K-12 Campus Exp.", conceptual: 70, final: 72 },
  { job: "Logistics Center", conceptual: 138, final: 142 },
  { job: "Courthouse Reno", conceptual: 91, final: 88 },
]

// ---------------------------------------------------------------------------
// Knowledge base
// ---------------------------------------------------------------------------
export type KnowledgeDoc = {
  id: string
  title: string
  type: "Drawing" | "Spec" | "Closeout" | "Photo" | "Report"
  project: string
  unit: BusinessUnit
  market: string
  delivery: DeliveryMethod
  system: string
  phase: string
  date: string
  snippet: string
}

export const KNOWLEDGE_DOCS: KnowledgeDoc[] = [
  {
    id: "k1",
    title: "Blast-resistant facade — performance spec",
    type: "Spec",
    project: "Consulate Compound Modernization",
    unit: "International",
    market: "Federal / Diplomatic",
    delivery: "Design-Build",
    system: "Facade",
    phase: "Design",
    date: "2022",
    snippet:
      "Section 08 44 00 defines blast load criteria and laminated glazing performance accepted on first inspection.",
  },
  {
    id: "k2",
    title: "Occupied-facility phasing plan",
    type: "Report",
    project: "Federal Courthouse Renovation",
    unit: "Governmental",
    market: "Justice / Civic",
    delivery: "CMaR",
    system: "Logistics",
    phase: "Preconstruction",
    date: "2020",
    snippet:
      "Five-phase sequencing maintained full court operations; security zoning handoffs documented per phase.",
  },
  {
    id: "k3",
    title: "Curtain wall embed coordination detail",
    type: "Drawing",
    project: "Regional Logistics Center",
    unit: "Commercial",
    market: "Industrial / Logistics",
    delivery: "Design-Build",
    system: "Enclosure",
    phase: "Construction",
    date: "2025",
    snippet:
      "Detail A8.21 shows revised embed plate layout resolving the structural conflict identified in RFI-204.",
  },
  {
    id: "k4",
    title: "Switchgear long-lead procurement log",
    type: "Closeout",
    project: "Inland Hyperscale Phase II",
    unit: "Commercial",
    market: "Mission-Critical / Data Center",
    delivery: "Design-Build",
    system: "Electrical",
    phase: "Closeout",
    date: "2023",
    snippet:
      "Owner-direct switchgear strategy compressed energization by 6 weeks; lead-time tracker attached.",
  },
  {
    id: "k5",
    title: "Summer-window schedule recovery photos",
    type: "Photo",
    project: "K-12 Campus Expansion",
    unit: "Commercial",
    market: "Education",
    delivery: "CMaR",
    system: "Structure",
    phase: "Construction",
    date: "2024",
    snippet:
      "Progress photography documenting accelerated steel erection during the summer occupancy window.",
  },
  {
    id: "k6",
    title: "Cleanroom commissioning checklist",
    type: "Closeout",
    project: "Inland Hyperscale Phase II",
    unit: "Commercial",
    market: "Advanced Manufacturing",
    delivery: "Design-Build",
    system: "Mechanical",
    phase: "Commissioning",
    date: "2023",
    snippet:
      "Validation-driven commissioning sequence with zero recordable incidents across 540K craft hours.",
  },
]

// ---------------------------------------------------------------------------
// Reporting roll-ups
// ---------------------------------------------------------------------------
export type UnitRollup = {
  unit: BusinessUnit
  activeProjects: number
  backlog: number
  scheduleHealth: number
  budgetVariance: number
  trir: number
  winRate: number
  pipeline: number
}

export const UNIT_ROLLUPS: UnitRollup[] = [
  {
    unit: "Commercial",
    activeProjects: 9,
    backlog: 1_240_000_000,
    scheduleHealth: 82,
    budgetVariance: 1.9,
    trir: 0.58,
    winRate: 44,
    pipeline: 706_000_000,
  },
  {
    unit: "Governmental",
    activeProjects: 6,
    backlog: 620_000_000,
    scheduleHealth: 91,
    budgetVariance: -0.4,
    trir: 0.49,
    winRate: 39,
    pipeline: 214_000_000,
  },
  {
    unit: "International",
    activeProjects: 4,
    backlog: 980_000_000,
    scheduleHealth: 74,
    budgetVariance: 3.6,
    trir: 0.77,
    winRate: 36,
    pipeline: 505_000_000,
  },
]

export const getProject = (slug: string): Project | undefined =>
  PROJECTS.find((p) => p.slug === slug)

// Resolve a project NAME (as referenced from comparables, knowledge docs, citations)
// to a built project slug, when one exists.
export const getProjectSlugByName = (name: string): string | undefined =>
  PROJECTS.find((p) => p.name.toLowerCase() === name.trim().toLowerCase())?.slug

// --- Trade Partners --------------------------------------------------------
export type PrequalStatus = "Qualified" | "Conditional" | "In Review" | "Expired"
export type TradePartner = {
  id: string
  name: string
  trade: string
  region: string
  activeProjects: number
  openItems: number
  safetyEmr: number // experience modification rate
  onTimePct: number
  prequal: PrequalStatus
  capacity: "Available" | "Near capacity" | "Committed"
  tier: "Strategic" | "Preferred" | "Approved"
}

export const TRADE_PARTNERS: TradePartner[] = [
  {
    id: "tp-01",
    name: "Cornerstone Concrete Co.",
    trade: "Concrete / Structural",
    region: "Southeast US",
    activeProjects: 4,
    openItems: 3,
    safetyEmr: 0.78,
    onTimePct: 96,
    prequal: "Qualified",
    capacity: "Near capacity",
    tier: "Strategic",
  },
  {
    id: "tp-02",
    name: "Apex Steel Erectors",
    trade: "Structural Steel",
    region: "National",
    activeProjects: 3,
    openItems: 1,
    safetyEmr: 0.85,
    onTimePct: 92,
    prequal: "Qualified",
    capacity: "Committed",
    tier: "Strategic",
  },
  {
    id: "tp-03",
    name: "Meridian Mechanical",
    trade: "HVAC / Mechanical",
    region: "Southeast US",
    activeProjects: 5,
    openItems: 6,
    safetyEmr: 0.91,
    onTimePct: 88,
    prequal: "Conditional",
    capacity: "Near capacity",
    tier: "Preferred",
  },
  {
    id: "tp-04",
    name: "Voltway Electric",
    trade: "Electrical",
    region: "National",
    activeProjects: 2,
    openItems: 2,
    safetyEmr: 0.72,
    onTimePct: 94,
    prequal: "Qualified",
    capacity: "Available",
    tier: "Preferred",
  },
  {
    id: "tp-05",
    name: "ClearSpan Glazing",
    trade: "Curtain Wall / Glazing",
    region: "Southeast US",
    activeProjects: 1,
    openItems: 4,
    safetyEmr: 1.04,
    onTimePct: 79,
    prequal: "In Review",
    capacity: "Available",
    tier: "Approved",
  },
  {
    id: "tp-06",
    name: "Summit Earthworks",
    trade: "Sitework / Earthwork",
    region: "International",
    activeProjects: 2,
    openItems: 0,
    safetyEmr: 0.88,
    onTimePct: 90,
    prequal: "Qualified",
    capacity: "Available",
    tier: "Approved",
  },
  {
    id: "tp-07",
    name: "Harbor Fire Protection",
    trade: "Fire Protection",
    region: "Southeast US",
    activeProjects: 3,
    openItems: 1,
    safetyEmr: 0.96,
    onTimePct: 86,
    prequal: "Expired",
    capacity: "Near capacity",
    tier: "Approved",
  },
]

// --- Integrations Hub (Phase 2) -------------------------------------------
export type IntegrationStatus = "Connected" | "Available" | "Syncing"
export type IntegrationCategory =
  | "ERP & Accounting"
  | "Scheduling"
  | "Document Management"
  | "BIM & Design"
  | "Field & Safety"
export type Integration = {
  id: string
  name: string
  category: IntegrationCategory
  status: IntegrationStatus
  description: string
  lastSync?: string
  records?: string
}

export const INTEGRATIONS: Integration[] = [
  {
    id: "int-erp",
    name: "Enterprise ERP / Accounting",
    category: "ERP & Accounting",
    status: "Connected",
    description: "Cost codes, commitments, and pay applications sync nightly into project budgets.",
    lastSync: "2 hours ago",
    records: "18 cost ledgers",
  },
  {
    id: "int-sched",
    name: "Primavera P6",
    category: "Scheduling",
    status: "Connected",
    description: "Critical-path schedules and float analytics feed the schedule health indicators.",
    lastSync: "Today, 6:00 AM",
    records: "22 active schedules",
  },
  {
    id: "int-dms",
    name: "Document Management",
    category: "Document Management",
    status: "Syncing",
    description: "Drawings, specs, and closeout documents index into Knowledge search.",
    lastSync: "In progress — 64%",
    records: "41,200 documents",
  },
  {
    id: "int-bim",
    name: "BIM 360 / Model Coordination",
    category: "BIM & Design",
    status: "Connected",
    description: "Model versions and clash reports link to affected scope on Project Detail.",
    lastSync: "Yesterday",
    records: "12 federated models",
  },
  {
    id: "int-field",
    name: "Field & Daily Reports",
    category: "Field & Safety",
    status: "Connected",
    description: "Daily reports, photos, and safety observations captured from the field app.",
    lastSync: "15 minutes ago",
    records: "9 crews reporting",
  },
  {
    id: "int-safety",
    name: "Safety & Incident Management",
    category: "Field & Safety",
    status: "Available",
    description: "Centralize observations, near-misses, and OSHA logs to drive the safety roll-up.",
  },
  {
    id: "int-estimating",
    name: "Conceptual Estimating Database",
    category: "ERP & Accounting",
    status: "Available",
    description: "Historical unit costs and assemblies to seed conceptual estimates automatically.",
  },
  {
    id: "int-procure",
    name: "Procurement & Bid Management",
    category: "Document Management",
    status: "Available",
    description: "Bid packages, leveling sheets, and subcontractor proposals tied to trade partners.",
  },
]

// --- Predictive scoring (Phase 3) -----------------------------------------
export type WinScore = {
  pursuitId: string
  probability: number
  drivers: { label: string; impact: "positive" | "negative" }[]
  confidence: "High" | "Medium" | "Low"
}

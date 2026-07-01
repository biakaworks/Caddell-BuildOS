import type { BusinessUnit } from "@/lib/mock-data"

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------
// Three demo roles. "Admin" maps to the Admin / Security Steward persona
// (least-privilege, audit, isolation). Staff is an internal operator. Trade
// Partner is an external, tightly-scoped collaborator.

export type Role = "Admin" | "Staff" | "Trade Partner"

export const ROLES: Role[] = ["Admin", "Staff", "Trade Partner"]

export const ROLE_META: Record<
  Role,
  { label: string; blurb: string; tone: "info" | "neutral" | "warning" }
> = {
  Admin: {
    label: "Administrator",
    blurb: "Full platform administration, user provisioning, and audit oversight.",
    tone: "info",
  },
  Staff: {
    label: "Staff",
    blurb: "Internal operator — pursuits, estimating, projects, and reporting.",
    tone: "neutral",
  },
  "Trade Partner": {
    label: "Trade Partner",
    blurb: "External collaborator — scoped to assigned projects only.",
    tone: "warning",
  },
}

export type UserStatus = "active" | "invited" | "suspended"

export const STATUS_META: Record<
  UserStatus,
  { label: string; tone: "success" | "warning" | "danger" | "neutral" }
> = {
  active: { label: "Active", tone: "success" },
  invited: { label: "Invited", tone: "warning" },
  suspended: { label: "Suspended", tone: "danger" },
}

// ---------------------------------------------------------------------------
// Branches (office locations)
// ---------------------------------------------------------------------------
export const BRANCHES = [
  "Montgomery, AL",
  "Washington, DC",
  "Atlanta, GA",
  "Houston, TX",
  "Frankfurt, DE",
] as const
export type Branch = (typeof BRANCHES)[number]

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export type AccountUser = {
  id: string
  name: string
  email: string
  title: string
  role: Role
  businessUnits: BusinessUnit[]
  branch: Branch
  status: UserStatus
  lastActive: string
  phone: string
  /** Avatar object URL if the user uploaded one (mock, session-only). */
  avatarUrl?: string
}

/** Deterministic initials for the fallback avatar. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const ACCOUNT_USERS: AccountUser[] = [
  {
    id: "u-jordan-cole",
    name: "Jordan Cole",
    email: "jordan.cole@caddell.example",
    title: "VP, Operations",
    role: "Admin",
    businessUnits: ["Commercial", "Governmental", "International"],
    branch: "Montgomery, AL",
    status: "active",
    lastActive: "Just now",
    phone: "+1 (334) 555-0142",
  },
  {
    id: "u-mara-vance",
    name: "Mara Vance",
    email: "mara.vance@caddell.example",
    title: "IT Security Steward",
    role: "Admin",
    businessUnits: ["Governmental"],
    branch: "Washington, DC",
    status: "active",
    lastActive: "12 minutes ago",
    phone: "+1 (202) 555-0119",
  },
  {
    id: "u-devin-park",
    name: "Devin Park",
    email: "devin.park@caddell.example",
    title: "Senior Estimator",
    role: "Staff",
    businessUnits: ["Commercial"],
    branch: "Atlanta, GA",
    status: "active",
    lastActive: "1 hour ago",
    phone: "+1 (404) 555-0173",
  },
  {
    id: "u-lena-ortiz",
    name: "Lena Ortiz",
    email: "lena.ortiz@caddell.example",
    title: "Project Manager",
    role: "Staff",
    businessUnits: ["Commercial", "Governmental"],
    branch: "Houston, TX",
    status: "active",
    lastActive: "3 hours ago",
    phone: "+1 (713) 555-0188",
  },
  {
    id: "u-arun-patel",
    name: "Arun Patel",
    email: "arun.patel@caddell.example",
    title: "Preconstruction Lead",
    role: "Staff",
    businessUnits: ["Governmental"],
    branch: "Washington, DC",
    status: "active",
    lastActive: "Yesterday",
    phone: "+1 (202) 555-0155",
  },
  {
    id: "u-sofia-reyes",
    name: "Sofia Reyes",
    email: "sofia.reyes@caddell.example",
    title: "Field Engineer",
    role: "Staff",
    businessUnits: ["International"],
    branch: "Frankfurt, DE",
    status: "active",
    lastActive: "2 days ago",
    phone: "+49 69 5550 0123",
  },
  {
    id: "u-marcus-hill",
    name: "Marcus Hill",
    email: "marcus.hill@caddell.example",
    title: "Scheduler",
    role: "Staff",
    businessUnits: ["Commercial"],
    branch: "Atlanta, GA",
    status: "active",
    lastActive: "4 hours ago",
    phone: "+1 (404) 555-0197",
  },
  {
    id: "u-nadia-khan",
    name: "Nadia Khan",
    email: "nadia.khan@caddell.example",
    title: "Safety Manager",
    role: "Staff",
    businessUnits: ["Governmental", "International"],
    branch: "Montgomery, AL",
    status: "active",
    lastActive: "5 hours ago",
    phone: "+1 (334) 555-0164",
  },
  {
    id: "u-theo-grant",
    name: "Theo Grant",
    email: "theo.grant@caddell.example",
    title: "Cost Analyst",
    role: "Staff",
    businessUnits: ["Commercial"],
    branch: "Houston, TX",
    status: "invited",
    lastActive: "Never",
    phone: "+1 (713) 555-0102",
  },
  {
    id: "u-priya-nair",
    name: "Priya Nair",
    email: "priya.nair@caddell.example",
    title: "BIM Coordinator",
    role: "Staff",
    businessUnits: ["International"],
    branch: "Frankfurt, DE",
    status: "invited",
    lastActive: "Never",
    phone: "+49 69 5550 0177",
  },
  {
    id: "u-carl-owens",
    name: "Carl Owens",
    email: "carl.owens@meridiansteel.example",
    title: "Steel Erection — Meridian Steel",
    role: "Trade Partner",
    businessUnits: ["Commercial"],
    branch: "Atlanta, GA",
    status: "active",
    lastActive: "6 hours ago",
    phone: "+1 (404) 555-0210",
  },
  {
    id: "u-bianca-flores",
    name: "Bianca Flores",
    email: "bianca.flores@apexmech.example",
    title: "Mechanical — Apex MEP",
    role: "Trade Partner",
    businessUnits: ["Governmental"],
    branch: "Washington, DC",
    status: "active",
    lastActive: "1 day ago",
    phone: "+1 (202) 555-0233",
  },
  {
    id: "u-owen-brooks",
    name: "Owen Brooks",
    email: "owen.brooks@deltaelec.example",
    title: "Electrical — Delta Electric",
    role: "Trade Partner",
    businessUnits: ["Commercial"],
    branch: "Houston, TX",
    status: "active",
    lastActive: "3 days ago",
    phone: "+1 (713) 555-0244",
  },
  {
    id: "u-hana-suzuki",
    name: "Hana Suzuki",
    email: "hana.suzuki@globalconcrete.example",
    title: "Concrete — Global Concrete",
    role: "Trade Partner",
    businessUnits: ["International"],
    branch: "Frankfurt, DE",
    status: "suspended",
    lastActive: "3 weeks ago",
    phone: "+49 69 5550 0255",
  },
  {
    id: "u-gabe-turner",
    name: "Gabe Turner",
    email: "gabe.turner@caddell.example",
    title: "Assistant PM",
    role: "Staff",
    businessUnits: ["Commercial"],
    branch: "Montgomery, AL",
    status: "suspended",
    lastActive: "1 month ago",
    phone: "+1 (334) 555-0266",
  },
  {
    id: "u-elise-moreau",
    name: "Elise Moreau",
    email: "elise.moreau@caddell.example",
    title: "Contracts Administrator",
    role: "Admin",
    businessUnits: ["Commercial", "International"],
    branch: "Frankfurt, DE",
    status: "active",
    lastActive: "8 hours ago",
    phone: "+49 69 5550 0288",
  },
  {
    id: "u-ray-coleman",
    name: "Ray Coleman",
    email: "ray.coleman@caddell.example",
    title: "Superintendent",
    role: "Staff",
    businessUnits: ["Governmental"],
    branch: "Washington, DC",
    status: "active",
    lastActive: "Yesterday",
    phone: "+1 (202) 555-0299",
  },
  {
    id: "u-tania-ross",
    name: "Tania Ross",
    email: "tania.ross@caddell.example",
    title: "Business Development",
    role: "Staff",
    businessUnits: ["Commercial", "Governmental"],
    branch: "Atlanta, GA",
    status: "invited",
    lastActive: "Never",
    phone: "+1 (404) 555-0301",
  },
]

// ---------------------------------------------------------------------------
// Roles & permissions matrix
// ---------------------------------------------------------------------------
export type CapabilityLevel = "none" | "view" | "create" | "edit" | "admin"

export const CAPABILITY_ORDER: CapabilityLevel[] = ["none", "view", "create", "edit", "admin"]

export const CAPABILITY_META: Record<
  CapabilityLevel,
  { label: string; short: string; tone: "neutral" | "info" | "success" | "warning" }
> = {
  none: { label: "No access", short: "None", tone: "neutral" },
  view: { label: "View", short: "View", tone: "info" },
  create: { label: "View + Create", short: "Create", tone: "info" },
  edit: { label: "View + Create + Edit", short: "Edit", tone: "success" },
  admin: { label: "Full admin", short: "Admin", tone: "warning" },
}

export type Capability = {
  id: string
  label: string
  description: string
  /** Elevated capabilities require a documented assignment when raised. */
  sensitive?: boolean
}

export const CAPABILITIES: Capability[] = [
  { id: "pursuits", label: "Pursuits & pipeline", description: "Opportunity tracking and go/no-go." },
  { id: "estimating", label: "Estimating", description: "Cost models and bid assembly." },
  { id: "projects", label: "Projects", description: "Active project execution records." },
  { id: "reporting", label: "Reporting & analytics", description: "Portfolio metrics and chart library." },
  { id: "knowledge", label: "Knowledge base", description: "Documents, standards, and lessons learned." },
  {
    id: "user-mgmt",
    label: "User management",
    description: "Provision, suspend, and assign roles.",
    sensitive: true,
  },
  {
    id: "audit",
    label: "Audit & security",
    description: "Security events and access review.",
    sensitive: true,
  },
]

/** Least-privilege defaults. Trade Partners see only assigned projects. */
export const PERMISSION_MATRIX: Record<Role, Record<string, CapabilityLevel>> = {
  Admin: {
    pursuits: "admin",
    estimating: "admin",
    projects: "admin",
    reporting: "admin",
    knowledge: "admin",
    "user-mgmt": "admin",
    audit: "admin",
  },
  Staff: {
    pursuits: "edit",
    estimating: "edit",
    projects: "edit",
    reporting: "view",
    knowledge: "edit",
    "user-mgmt": "none",
    audit: "none",
  },
  "Trade Partner": {
    pursuits: "none",
    estimating: "none",
    projects: "view",
    reporting: "none",
    knowledge: "view",
    "user-mgmt": "none",
    audit: "none",
  },
}

// ---------------------------------------------------------------------------
// Access & isolation — scoping per role (the CMMC isolation story)
// ---------------------------------------------------------------------------
export type AccessScope = {
  role: Role
  tenant: string
  businessUnits: string
  projects: string
  crossBoundary: string
  dataResidency: string
}

export const ACCESS_SCOPES: AccessScope[] = [
  {
    role: "Admin",
    tenant: "Caddell (all)",
    businessUnits: "All units",
    projects: "All projects",
    crossBoundary: "Permitted — every action logged as a security event",
    dataResidency: "US + EU regions",
  },
  {
    role: "Staff",
    tenant: "Caddell (internal)",
    businessUnits: "Assigned units only",
    projects: "Projects within assigned units",
    crossBoundary: "Blocked by default — requires documented exception",
    dataResidency: "Home region of assigned unit",
  },
  {
    role: "Trade Partner",
    tenant: "External (guest)",
    businessUnits: "None — project-scoped",
    projects: "Explicitly assigned projects only",
    crossBoundary: "Hard-isolated — no cross-project visibility",
    dataResidency: "Project region only",
  },
]

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------
export type AuditCategory =
  | "sign-in"
  | "permission"
  | "sensitive-access"
  | "admin-action"
  | "isolation"

export const AUDIT_CATEGORY_META: Record<
  AuditCategory,
  { label: string; tone: "info" | "warning" | "danger" | "success" | "neutral" }
> = {
  "sign-in": { label: "Sign-in", tone: "neutral" },
  permission: { label: "Permission change", tone: "warning" },
  "sensitive-access": { label: "Sensitive access", tone: "danger" },
  "admin-action": { label: "Admin action", tone: "info" },
  isolation: { label: "Isolation event", tone: "danger" },
}

export type AuditEvent = {
  id: string
  timestamp: string
  actor: string
  action: string
  target: string
  category: AuditCategory
  ip: string
}

export const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "evt-1024",
    timestamp: "2026-06-30 09:42:11",
    actor: "Mara Vance",
    action: "Elevated permission: Audit & security → Full admin",
    target: "Role: Staff",
    category: "permission",
    ip: "10.4.22.8",
  },
  {
    id: "evt-1023",
    timestamp: "2026-06-30 09:15:03",
    actor: "Jordan Cole",
    action: "Viewed CUI-tagged project record",
    target: "Overseas Embassy Annex",
    category: "sensitive-access",
    ip: "10.4.22.2",
  },
  {
    id: "evt-1022",
    timestamp: "2026-06-30 08:58:47",
    actor: "Lena Ortiz",
    action: "Signed in (MFA verified)",
    target: "Session #A19F",
    category: "sign-in",
    ip: "172.16.4.51",
  },
  {
    id: "evt-1021",
    timestamp: "2026-06-30 08:31:20",
    actor: "Mara Vance",
    action: "Suspended user account",
    target: "Gabe Turner",
    category: "admin-action",
    ip: "10.4.22.8",
  },
  {
    id: "evt-1020",
    timestamp: "2026-06-29 17:12:55",
    actor: "System",
    action: "Blocked cross-boundary access attempt",
    target: "Trade Partner → Governmental unit",
    category: "isolation",
    ip: "203.0.113.44",
  },
  {
    id: "evt-1019",
    timestamp: "2026-06-29 16:40:09",
    actor: "Jordan Cole",
    action: "Invited new user",
    target: "tania.ross@caddell.example",
    category: "admin-action",
    ip: "10.4.22.2",
  },
  {
    id: "evt-1018",
    timestamp: "2026-06-29 15:22:31",
    actor: "Arun Patel",
    action: "Signed in (MFA verified)",
    target: "Session #7C3D",
    category: "sign-in",
    ip: "10.8.1.19",
  },
  {
    id: "evt-1017",
    timestamp: "2026-06-29 14:05:12",
    actor: "Elise Moreau",
    action: "Downloaded contract package",
    target: "Riverside Medical Tower",
    category: "sensitive-access",
    ip: "192.0.2.77",
  },
  {
    id: "evt-1016",
    timestamp: "2026-06-29 11:47:38",
    actor: "Mara Vance",
    action: "Reset MFA device",
    target: "Sofia Reyes",
    category: "admin-action",
    ip: "10.4.22.8",
  },
  {
    id: "evt-1015",
    timestamp: "2026-06-29 09:03:52",
    actor: "System",
    action: "Failed sign-in — lockout after 5 attempts",
    target: "owen.brooks@deltaelec.example",
    category: "sign-in",
    ip: "198.51.100.23",
  },
  {
    id: "evt-1014",
    timestamp: "2026-06-28 16:18:44",
    actor: "Jordan Cole",
    action: "Changed role assignment: Staff → Admin",
    target: "Elise Moreau",
    category: "permission",
    ip: "10.4.22.2",
  },
  {
    id: "evt-1013",
    timestamp: "2026-06-28 13:55:07",
    actor: "Nadia Khan",
    action: "Viewed CUI-tagged safety report",
    target: "Federal Courthouse Renovation",
    category: "sensitive-access",
    ip: "10.8.1.42",
  },
]

// ---------------------------------------------------------------------------
// Active sessions (Security tab)
// ---------------------------------------------------------------------------
export type SessionInfo = {
  id: string
  device: string
  location: string
  lastActive: string
  current: boolean
}

export const ACTIVE_SESSIONS: SessionInfo[] = [
  {
    id: "sess-current",
    device: "Chrome · macOS",
    location: "Montgomery, AL",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "sess-2",
    device: "Safari · iPhone",
    location: "Montgomery, AL",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "sess-3",
    device: "Edge · Windows",
    location: "Atlanta, GA",
    lastActive: "Yesterday",
    current: false,
  },
]

// ---------------------------------------------------------------------------
// Notification preferences
// ---------------------------------------------------------------------------
export type NotificationPref = {
  id: string
  label: string
  description: string
  enabled: boolean
}

export const DEFAULT_NOTIFICATIONS: NotificationPref[] = [
  {
    id: "pursuit-updates",
    label: "Pursuit updates",
    description: "Stage changes and go/no-go decisions on pursuits you follow.",
    enabled: true,
  },
  {
    id: "project-alerts",
    label: "Project risk alerts",
    description: "Schedule slips, budget variance, and safety flags.",
    enabled: true,
  },
  {
    id: "mentions",
    label: "Mentions & assignments",
    description: "When someone @mentions you or assigns you an action.",
    enabled: true,
  },
  {
    id: "weekly-digest",
    label: "Weekly leadership digest",
    description: "Monday summary of portfolio performance.",
    enabled: false,
  },
  {
    id: "security-alerts",
    label: "Security alerts",
    description: "New sign-ins and sensitive access to your records.",
    enabled: true,
  },
]

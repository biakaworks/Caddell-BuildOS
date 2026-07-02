"use client"

import { createContext, use, useCallback, useEffect, useMemo, useState } from "react"
import {
  ACCOUNT_USERS,
  DEFAULT_NOTIFICATIONS,
  type AccountUser,
  type NotificationPref,
  type Role,
  type UserStatus,
} from "@/lib/account-data"
import type { BusinessUnit } from "@/lib/mock-data"

/** The demo account we sign in as. */
const DEMO_USER_ID = "u-jordan-cole"

/** Session-persistence keys so a refresh doesn't drop the demo session. */
const SESSION_KEY = "buildos.signedIn"
const ROLE_KEY = "buildos.role"

export type InviteInput = {
  name: string
  email: string
  role: Role
  businessUnits: BusinessUnit[]
  branch: AccountUser["branch"]
}

type AuthContextValue = {
  signedIn: boolean
  /** False until the session has been rehydrated from storage on the client. */
  hydrated: boolean
  currentUser: AccountUser
  users: AccountUser[]
  notifications: NotificationPref[]
  mfaEnabled: boolean
  // session
  signIn: () => void
  signOut: () => void
  // demo aid
  setRole: (role: Role) => void
  // profile / settings
  updateProfile: (patch: Partial<AccountUser>) => void
  setNotification: (id: string, enabled: boolean) => void
  setMfaEnabled: (enabled: boolean) => void
  // admin user management
  inviteUser: (input: InviteInput) => AccountUser
  setUserStatus: (id: string, status: UserStatus) => void
  updateUser: (id: string, patch: Partial<AccountUser>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [signedIn, setSignedIn] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [users, setUsers] = useState<AccountUser[]>(ACCOUNT_USERS)
  const [currentUserId] = useState(DEMO_USER_ID)
  const [notifications, setNotifications] = useState<NotificationPref[]>(DEFAULT_NOTIFICATIONS)
  const [mfaEnabled, setMfaEnabled] = useState(true)

  // Rehydrate the demo session from localStorage on mount so a page refresh
  // (or deep-linking to /admin) doesn't bounce the user back to sign-in.
  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.localStorage.getItem(SESSION_KEY) === "true") setSignedIn(true)
    const savedRole = window.localStorage.getItem(ROLE_KEY) as Role | null
    if (savedRole) {
      setUsers((prev) => prev.map((u) => (u.id === DEMO_USER_ID ? { ...u, role: savedRole } : u)))
    }
    setHydrated(true)
  }, [])

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? users[0],
    [users, currentUserId],
  )

  const signIn = useCallback(() => {
    setSignedIn(true)
    if (typeof window !== "undefined") window.localStorage.setItem(SESSION_KEY, "true")
  }, [])
  const signOut = useCallback(() => {
    setSignedIn(false)
    if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY)
  }, [])

  const patchUser = useCallback(
    (id: string, patch: Partial<AccountUser>) =>
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u))),
    [],
  )

  const setRole = useCallback(
    (role: Role) => {
      patchUser(currentUserId, { role })
      if (typeof window !== "undefined") window.localStorage.setItem(ROLE_KEY, role)
    },
    [patchUser, currentUserId],
  )

  const updateProfile = useCallback(
    (patch: Partial<AccountUser>) => patchUser(currentUserId, patch),
    [patchUser, currentUserId],
  )

  const setNotification = useCallback(
    (id: string, enabled: boolean) =>
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, enabled } : n))),
    [],
  )

  const inviteUser = useCallback((input: InviteInput): AccountUser => {
    const user: AccountUser = {
      id: `u-invite-${Date.now()}`,
      name: input.name.trim() || input.email.split("@")[0],
      email: input.email.trim(),
      title: "Invitation pending",
      role: input.role,
      businessUnits: input.businessUnits,
      branch: input.branch,
      status: "invited",
      lastActive: "Never",
      phone: "—",
    }
    setUsers((prev) => [user, ...prev])
    return user
  }, [])

  const setUserStatus = useCallback(
    (id: string, status: UserStatus) => patchUser(id, { status }),
    [patchUser],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      signedIn,
      hydrated,
      currentUser,
      users,
      notifications,
      mfaEnabled,
      signIn,
      signOut,
      setRole,
      updateProfile,
      setNotification,
      setMfaEnabled,
      inviteUser,
      setUserStatus,
      updateUser: patchUser,
    }),
    [
      signedIn,
      hydrated,
      currentUser,
      users,
      notifications,
      mfaEnabled,
      signIn,
      signOut,
      setRole,
      updateProfile,
      setNotification,
      inviteUser,
      setUserStatus,
      patchUser,
    ],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

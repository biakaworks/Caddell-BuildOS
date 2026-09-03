"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { AppProvider, useApp } from "./app-context"
import { AuthProvider, useAuth } from "./account/auth-context"
import { AuthFlow } from "./account/auth-flow"
import { SidebarNav } from "./sidebar"
import { Topbar } from "./topbar"
import { AskPanel } from "./ask-panel"
import { OwnerPortal } from "./owner-portal"

function ShellInner({ children }: { children: React.ReactNode }) {
  const { ownerView } = useApp()
  const { signedIn } = useAuth()

  // Signed-out guard: the entire app is replaced by the auth flow. Any route
  // rendered while signed out shows Sign in, satisfying the mock redirect.
  if (!signedIn) {
    return <AuthFlow />
  }

  if (ownerView) {
    return <OwnerPortal />
  }

  return (
    <>
      <div className="flex min-h-screen w-full bg-background">
        <aside className="print-hide sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border lg:block">
          <SidebarNav />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-30 print-hide">
            <Topbar />
          </div>
          <main className="flex-1">{children}</main>
        </div>
      </div>
      <AskPanel />
    </>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AuthProvider>
        <TooltipProvider delay={200}>
          <ShellInner>{children}</ShellInner>
        </TooltipProvider>
      </AuthProvider>
    </AppProvider>
  )
}

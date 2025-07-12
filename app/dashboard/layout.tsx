import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AuthProvider } from "@/hooks/use-auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <span className="font-semibold text-gray-900">ProvaFácil</span>
            </div>
          </header>
          <main className="flex-1 p-6 bg-gray-50">{children}</main>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </AuthProvider>
  )
}

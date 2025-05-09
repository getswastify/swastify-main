import type React from "react"
import { Toaster } from "@/components/ui/sonner"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { MobileNavbar } from "@/components/mobile-navbar"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <MobileNavbar />
        <main className="flex-1 w-full p-4 md:p-6 max-w-full pt-16 md:pt-6">{children}</main>
        <Toaster />
      </div>
    </SidebarProvider>
  )
}

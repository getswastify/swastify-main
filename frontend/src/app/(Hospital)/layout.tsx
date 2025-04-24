import type React from "react"
import { Toaster } from "@/components/ui/sonner"
import { SidebarProvider } from "@/components/ui/sidebar"
import { HospitalSidebar } from "@/components/hospital/hospital-sidebar"

export default function HospitalLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <HospitalSidebar />
        <main className="flex-1 w-full p-4 md:p-6 max-w-full">{children}</main>
        <Toaster />
      </div>
    </SidebarProvider>
  )
}

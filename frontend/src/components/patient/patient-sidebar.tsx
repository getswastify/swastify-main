"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserNav } from "@/components/user-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Home, User } from "lucide-react"

export function PatientSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/patient/dashboard",
      active: pathname === "/patient/dashboard",
    },
    {
      label: "Profile",
      icon: User,
      href: "/patient/profile",
      active: pathname === "/patient/profile",
    },
  ]

  return (
    <>
      {/* Mobile menu trigger - visible only on small screens */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <SidebarTrigger />
      </div>

      <Sidebar>
        <SidebarHeader className="flex flex-col gap-4 py-4">
          <div className="flex items-center px-4">
            <Link href="/patient/dashboard" className="flex items-center gap-2 font-semibold">
              <span className="text-primary">Swastify</span>
              <span className="text-sm text-muted-foreground">Patient</span>
            </Link>
            <div className="ml-auto">
              <UserNav />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {routes.map((route) => (
              <SidebarMenuItem key={route.href}>
                <SidebarMenuButton asChild isActive={route.active}>
                  <Link href={route.href}>
                    <route.icon className="mr-2 h-4 w-4" />
                    <span>{route.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    </>
  )
}

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
import { Home, User, Calendar, CalendarClock, Settings } from "lucide-react"

export function DoctorSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/doctor/dashboard",
      active: pathname === "/doctor/dashboard",
    },
    {
      label: "Profile",
      icon: User,
      href: "/doctor/profile",
      active: pathname === "/doctor/profile",
    },
    {
      label: "Availability",
      icon: Calendar,
      href: "/doctor/availability",
      active: pathname === "/doctor/availability",
    },
    {
      label: "Appointments",
      icon: CalendarClock,
      href: "/doctor/appointments",
      active: pathname === "/doctor/appointments",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/doctor/settings",
      active: pathname === "/doctor/settings",
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
            <Link href="/doctor/dashboard" className="flex items-center gap-2 font-semibold">
              <span className="text-primary">Swastify</span>
              <span className="text-sm text-muted-foreground">Doctor</span>
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

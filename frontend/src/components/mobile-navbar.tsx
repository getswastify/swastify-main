"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, Home, Calendar, User, Settings, LogOut, Clock, Building, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { getCookie } from "@/lib/cookies"
import type { UserRole } from "@/lib/roles"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  active?: boolean
}

export function MobileNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [userRole, setUserRole] = useState<string | null>(null)

  // Get user role from cookie as a fallback
  useEffect(() => {
    const roleCookie = getCookie("user_role")
    if (roleCookie) {
      setUserRole(roleCookie)
    }
  }, [])

  // Get initials from name
  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Get navigation items based on role
  const getNavItems = (): NavItem[] => {
    // Try to get role from user object first, then from state
    const role = (user?.role || userRole || "").toUpperCase() as UserRole



    if (role === "DOCTOR") {
      return [
        {
          label: "Dashboard",
          href: "/doctor/dashboard",
          icon: <Home className="h-5 w-5" />,
          active: pathname === "/doctor/dashboard",
        },
        {
          label: "Appointments",
          href: "/doctor/appointments",
          icon: <Calendar className="h-5 w-5" />,
          active: pathname.startsWith("/doctor/appointments"),
        },
        {
          label: "Availability",
          href: "/doctor/availability",
          icon: <Clock className="h-5 w-5" />,
          active: pathname === "/doctor/availability",
        },
        {
          label: "Profile",
          href: "/doctor/profile",
          icon: <User className="h-5 w-5" />,
          active: pathname === "/doctor/profile",
        },
        {
          label: "Settings",
          href: "/doctor/settings",
          icon: <Settings className="h-5 w-5" />,
          active: pathname === "/doctor/settings",
        },
      ]
    } else if (role === "USER") {
      return [
        {
          label: "Dashboard",
          href: "/patient/dashboard",
          icon: <Home className="h-5 w-5" />,
          active: pathname === "/patient/dashboard",
        },
        {
          label: "Book Appointment",
          href: "/patient/book-appointment",
          icon: <Calendar className="h-5 w-5" />,
          active: pathname === "/patient/book-appointment",
        },
        {
          label: "My Appointments",
          href: "/patient/appointments",
          icon: <Clock className="h-5 w-5" />,
          active: pathname === "/patient/appointments",
        },
        {
          label: "Profile",
          href: "/patient/profile",
          icon: <User className="h-5 w-5" />,
          active: pathname === "/patient/profile",
        },
      ]
    } else if (role === "HOSPITAL") {
      return [
        {
          label: "Dashboard",
          href: "/hospital/dashboard",
          icon: <Home className="h-5 w-5" />,
          active: pathname === "/hospital/dashboard",
        },
        {
          label: "Doctors",
          href: "/hospital/doctors",
          icon: <Users className="h-5 w-5" />,
          active: pathname === "/hospital/doctors",
        },
        {
          label: "Profile",
          href: "/hospital/profile",
          icon: <User className="h-5 w-5" />,
          active: pathname === "/hospital/profile",
        },
      ]
    } else if (role === "ADMIN") {
      return [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: <Home className="h-5 w-5" />,
          active: pathname === "/admin/dashboard",
        },
        {
          label: "Users",
          href: "/admin/users",
          icon: <Users className="h-5 w-5" />,
          active: pathname === "/admin/users",
        },
        {
          label: "Hospitals",
          href: "/admin/hospitals",
          icon: <Building className="h-5 w-5" />,
          active: pathname === "/admin/hospitals",
        },
      ]
    }

    // Fallback - determine by URL path if role is not available
    if (pathname.startsWith("/patient")) {
      return [
        {
          label: "Dashboard",
          href: "/patient/dashboard",
          icon: <Home className="h-5 w-5" />,
          active: pathname === "/patient/dashboard",
        },
        {
          label: "Book Appointment",
          href: "/patient/book-appointment",
          icon: <Calendar className="h-5 w-5" />,
          active: pathname === "/patient/book-appointment",
        },
        {
          label: "My Appointments",
          href: "/patient/appointments",
          icon: <Clock className="h-5 w-5" />,
          active: pathname === "/patient/appointments",
        },
        {
          label: "Profile",
          href: "/patient/profile",
          icon: <User className="h-5 w-5" />,
          active: pathname === "/patient/profile",
        },
      ]
    } else if (pathname.startsWith("/doctor")) {
      return [
        {
          label: "Dashboard",
          href: "/doctor/dashboard",
          icon: <Home className="h-5 w-5" />,
          active: pathname === "/doctor/dashboard",
        },
        {
          label: "Appointments",
          href: "/doctor/appointments",
          icon: <Calendar className="h-5 w-5" />,
          active: pathname.startsWith("/doctor/appointments"),
        },
        {
          label: "Availability",
          href: "/doctor/availability",
          icon: <Clock className="h-5 w-5" />,
          active: pathname === "/doctor/availability",
        },
        {
          label: "Profile",
          href: "/doctor/profile",
          icon: <User className="h-5 w-5" />,
          active: pathname === "/doctor/profile",
        },
      ]
    } else if (pathname.startsWith("/hospital")) {
      return [
        {
          label: "Dashboard",
          href: "/hospital/dashboard",
          icon: <Home className="h-5 w-5" />,
          active: pathname === "/hospital/dashboard",
        },
        {
          label: "Doctors",
          href: "/hospital/doctors",
          icon: <Users className="h-5 w-5" />,
          active: pathname === "/hospital/doctors",
        },
        {
          label: "Profile",
          href: "/hospital/profile",
          icon: <User className="h-5 w-5" />,
          active: pathname === "/hospital/profile",
        },
      ]
    } else if (pathname.startsWith("/admin")) {
      return [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: <Home className="h-5 w-5" />,
          active: pathname === "/admin/dashboard",
        },
        {
          label: "Users",
          href: "/admin/users",
          icon: <Users className="h-5 w-5" />,
          active: pathname === "/admin/users",
        },
        {
          label: "Hospitals",
          href: "/admin/hospitals",
          icon: <Building className="h-5 w-5" />,
          active: pathname === "/admin/hospitals",
        },
      ]
    }

    return []
  }

  const navItems = getNavItems()

  // Get user name from the user object
  const userName = user?.firstName || user?.firstName || "User"

  return (
    <div className="fixed top-0 left-0 right-0 z-50 md:hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/90 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center">
          <span className="font-semibold text-white">Swastify</span>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 bg-gray-900 border-gray-800 text-white">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user?.profilePicture || ""} />
                    <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{userName}</p>
                    <p className="text-xs text-gray-400">{user?.email || ""}</p>
                  </div>
                </div>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {navItems.length > 0 ? (
                  navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        item.active ? "bg-primary/20 text-primary" : "text-gray-300 hover:text-white hover:bg-gray-800",
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm px-3 py-2">No navigation items available</div>
                )}
              </nav>
              <div className="p-4 border-t border-gray-800">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  onClick={() => {
                    logout()
                    setOpen(false)
                  }}
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

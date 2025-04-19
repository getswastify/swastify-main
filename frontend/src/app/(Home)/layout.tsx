import type React from "react"
import type { Metadata } from "next"
import "../globals.css"

export const metadata: Metadata = {
  title: "Swastify | #1 Healthcare Platform",
  description: "Where Healthcare meets Innovation.",
  icons: {
    icon: "/favicon.ico", // Important!
  },
}

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}

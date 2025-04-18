import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import "../globals.css"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Swastify | Dashboard",
  description: "Where Healthcare meets Innovation.",
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* You can add a dashboard header/sidebar here */}
          <main className="min-h-screen">{children}</main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

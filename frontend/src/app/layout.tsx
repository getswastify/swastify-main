import type React from "react"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { Inter } from 'next/font/google';

import { cn } from "@/lib/utils"
import { AuthProvider } from "../context/auth-context"

export const metadata: Metadata = {
  title: "Swastify | Healthcare Platform",
  description: "Where Healthcare meets Innovation.",
}

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body
        className={cn(
          "antialiased min-h-screen bg-gradient-to-br from-background to-background via-background/90 dark:from-background dark:via-background/95 dark:to-emerald-950/20",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="swastify-theme"
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

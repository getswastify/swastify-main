import type React from "react"
import type { Metadata } from "next"
import "../globals.css"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Swastify | #1 Healthcare Platform",
  description: "Where Healthcare meets Innovation.",
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="container relative min-h-screen flex flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 ">
      <div className="relative hidden h-screen flex-col bg-muted p-10 text-white lg:flex dark:border-r overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: "url('/images/login-image.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/60 via-emerald-800/40 to-background z-10 dark:from-emerald-800/60 dark:via-background/80 dark:to-background" />

        {/* Content */}
        <div className="relative z-20 flex items-center text-lg font-medium">Swastify</div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &quot;Swastify connects patient experiences with innovative solutions. Share your healthcare journey to
              help us build a better system for everyone.&quot;
            </p>
            <footer className="text-sm text-emerald-500">Healthcare Innovation Team</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] md:w-[450px]">
          {children}
        </div>
      </div>
      <Toaster />
    </div>
  )
}

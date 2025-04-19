"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { verifyResetToken, resetPassword } from "@/actions/auth"

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })

  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsVerifying(false)
        return
      }

      try {
        const response = await verifyResetToken(token)

        if (!response.status) {
          throw new Error(response.message || "Invalid or expired token")
        }

        setIsTokenValid(response.status || false)
      } catch (error) {
        toast.error("Token Verification Failed", {
          description: error instanceof Error ? error.message : "Invalid or expired token",
        })
        setIsTokenValid(false)
      } finally {
        setIsVerifying(false)
      }
    }

    checkToken()
  }, [token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Please make sure your passwords match",
      })
      return
    }

    if (formData.newPassword.length < 8) {
      toast.error("Password too short", {
        description: "Password must be at least 8 characters long",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await resetPassword({

        token,
        newPassword: formData.newPassword,
      })

      if (!response.status) {
        throw new Error(response.message || "Failed to reset password")
      }

      setIsSubmitted(true)
    } catch (error) {
      toast.error("Password Reset Failed", {
        description: error instanceof Error ? error.message : "Something went wrong",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Verifying your reset link...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isTokenValid && !isVerifying) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-destructive"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Invalid or Expired Link</h3>
              <p className="text-sm text-muted-foreground">This password reset link is invalid or has expired.</p>
            </div>
            <Button asChild className="w-full">
              <Link href="/forgot-password">Request New Link</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Password Reset Successful</h3>
              <p className="text-sm text-muted-foreground">Your password has been successfully reset.</p>
            </div>
            <Button asChild className="w-full">
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground">Enter your new password below</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    disabled={isLoading}
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    disabled={isLoading}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-8 w-8 text-muted-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </>
  )
}

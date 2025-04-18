"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { verifyOTP, resendOTP } from "@/actions/auth"

export default function VerifyOTPPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6)
  }, [])

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(0, 1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("").slice(0, 6)
      setOtp(newOtp as string[])

      // Focus the last input
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const otpValue = otp.join("")

    // Validate OTP
    if (otpValue.length !== 6) {
      toast.error("Invalid OTP", {
        description: "Please enter a valid 6-digit OTP",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await verifyOTP(email, otpValue)

      if (!response.status) {
        throw new Error(response.message || "OTP verification failed")
      }

      toast.success("Account Verified", {
        description: "Your account has been successfully verified",
      })

      // Redirect to login page
      router.push("/login")
    } catch (error) {
      toast.error("Verification Failed", {
        description: error instanceof Error ? error.message : "Something went wrong",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email) {
      toast.error("Error", {
        description: "Email is required to resend OTP",
      })
      return
    }

    try {
      const response = await resendOTP(email)

      if (!response.status) {
        throw new Error(response.message || "Failed to resend OTP")
      }

      toast.success("OTP Sent", {
        description: "A new OTP has been sent to your email",
      })
    } catch (error) {
      toast.error("Failed to Resend OTP", {
        description: error instanceof Error ? error.message : "Something went wrong",
      })
    }
  }

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Verify Your Account</h1>
        <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to {email || "your email"}</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              <div className="grid gap-4">
                <div className="flex justify-center space-x-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="h-12 w-12 text-center text-lg"
                      disabled={isLoading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Verifying..." : "Verify Account"}
                </Button>
              </div>
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Didn&apos;t receive a code? </span>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-primary underline-offset-4 hover:underline"
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </>
  )
}

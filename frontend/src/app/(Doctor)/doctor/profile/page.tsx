"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoleGuard } from "@/components/role-guard"
import { doctorProfileSchema, type DoctorProfileFormValues } from "@/lib/validations/profile"
import { createDoctorProfile, updateDoctorProfile, getDoctorProfile } from "@/actions/profile"
import { SPECIALIZATIONS } from "@/types/profile"
import { Loader2, Clock, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { VerificationStatusBadge } from "@/components/verification-status-badge"

export default function DoctorProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileExists, setProfileExists] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | undefined>(
    undefined,
  )
  const router = useRouter()

  const form = useForm<DoctorProfileFormValues>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      specialization: "Cardiology",
      clinicAddress: "",
      consultationFee: 500,
      startedPracticeOn: new Date().toISOString().split("T")[0],
      licenseNumber: "",
      licenseIssuedBy: "",
      licenseDocumentUrl: "",
    },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const response = await getDoctorProfile()
        if (response.status && response.data) {
          setProfileExists(true)
          setVerificationStatus(response.data.isVerified)
          form.reset({
            // Cast the specialization to the correct type
            specialization: response.data.specialization as (typeof SPECIALIZATIONS)[number],
            clinicAddress: response.data.clinicAddress,
            consultationFee: response.data.consultationFee,
            startedPracticeOn: response.data.startedPracticeOn || new Date().toISOString().split("T")[0],
            licenseNumber: response.data.licenseNumber || "",
            licenseIssuedBy: response.data.licenseIssuedBy || "",
            licenseDocumentUrl: response.data.licenseDocumentUrl || "",
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [form])

  const onSubmit = async (data: DoctorProfileFormValues) => {
    setIsSubmitting(true)

    try {
      // Format the date to ISO-8601 DateTime format
      const formattedData = {
        ...data,
        // Convert YYYY-MM-DD to YYYY-MM-DDT00:00:00Z format
        startedPracticeOn: data.startedPracticeOn,
        licenseDocumentUrl: data.licenseDocumentUrl || "https://example.com/placeholder-license",
      }

      const response = profileExists
        ? await updateDoctorProfile(formattedData)
        : await createDoctorProfile(formattedData)

      if (!response.status) {
        throw new Error(response.message || "Failed to save profile")
      }

      toast.success(profileExists ? "Profile Updated" : "Profile Created", {
        description: response.message,
      })

      setProfileExists(true)

      // Update verification status if it's in the response
      if (response.data?.isVerified) {
        setVerificationStatus(response.data.isVerified)
      }

      // Redirect to dashboard after successful submission
      setTimeout(() => {
        router.push("/doctor/dashboard")
      }, 1500)
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Something went wrong",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to render verification status alert
  const renderVerificationAlert = () => {
    if (!verificationStatus) return null

    switch (verificationStatus) {
      case "APPROVED":
        return (
          <Alert className="border-green-500 bg-green-500/10 mb-6">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle>Profile Verified</AlertTitle>
            <AlertDescription>Your doctor profile has been verified and approved.</AlertDescription>
          </Alert>
        )
      case "REJECTED":
        return (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Verification Failed</AlertTitle>
            <AlertDescription>
              Your profile verification was rejected. Please update your information and resubmit.
            </AlertDescription>
          </Alert>
        )
      case "PENDING":
      default:
        return (
          <Alert className="border-yellow-500 bg-yellow-500/10 mb-6">
            <Clock className="h-4 w-4 text-yellow-500" />
            <AlertTitle>Verification Pending</AlertTitle>
            <AlertDescription>
              Your doctor profile is awaiting verification. You can still update your information.
            </AlertDescription>
          </Alert>
        )
    }
  }

  return (
    <RoleGuard requiredRole="DOCTOR">
      <div className="w-full max-w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Doctor Profile</h1>
            <p className="text-muted-foreground">Manage your professional information</p>
          </div>
          {!isLoading && verificationStatus && (
            <VerificationStatusBadge status={verificationStatus} className="mt-2 md:mt-0" />
          )}
        </div>

        <div className="relative w-full overflow-hidden rounded-lg shadow-md">
          {/* Custom header that extends full width */}
          <div className="w-full bg-gradient-to-r from-emerald-600 to-emerald-400 px-6 py-6 text-center">
            <h2 className="text-xl font-semibold text-white">
              {profileExists ? "Update Profile" : "Complete Your Profile"}
            </h2>
            <p className="text-emerald-50">
              {profileExists
                ? "Update your professional information below"
                : "Please provide your professional information to complete your profile"}
            </p>
          </div>

          {/* Card content */}
          <div className="bg-card p-6">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {profileExists && renderVerificationAlert()}

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialization</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your specialization" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {SPECIALIZATIONS.map((specialization) => (
                                <SelectItem key={specialization} value={specialization}>
                                  {specialization}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>Your medical specialization</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clinicAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clinic Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your clinic address" {...field} />
                          </FormControl>
                          <FormDescription>The address where you practice</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consultationFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consultation Fee</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>Your consultation fee in INR</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startedPracticeOn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Started Practice On</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>When you started your medical practice</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your medical license number" {...field} />
                            </FormControl>
                            <FormDescription>Your medical license/registration number</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="licenseIssuedBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Issued By</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter issuing authority" {...field} />
                            </FormControl>
                            <FormDescription>Authority that issued your license</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="licenseDocumentUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Document URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/your-license-document" {...field} />
                          </FormControl>
                          <FormDescription>URL to your license document (optional)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-center pt-4">
                      <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto md:min-w-[200px]">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {profileExists ? "Updating..." : "Creating..."}
                          </>
                        ) : profileExists ? (
                          "Update Profile"
                        ) : (
                          "Create Profile"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>

                {verificationStatus === "REJECTED" && (
                  <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800">
                    <p className="font-medium">Important:</p>
                    <p>
                      Your profile was rejected. Please update your information and ensure all details are accurate
                      before resubmitting.
                    </p>
                  </div>
                )}

                {verificationStatus === "PENDING" && (
                  <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800">
                    <p className="font-medium">Note:</p>
                    <p>
                      Your profile is currently under review. You can still update your information while waiting for
                      verification.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}

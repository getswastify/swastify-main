"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoleGuard } from "@/components/role-guard"
import { doctorProfileSchema, type DoctorProfileFormValues } from "@/lib/validations/profile"
import { createDoctorProfile, updateDoctorProfile, getDoctorProfile } from "@/actions/profile"
import { SPECIALIZATIONS } from "@/types/profile"
import { Loader2 } from "lucide-react"

export default function DoctorProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileExists, setProfileExists] = useState(false)
  const router = useRouter()

  const form = useForm<DoctorProfileFormValues>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      specialization: "Cardiology",
      clinicAddress: "",
      consultationFee: 500,
      availableFrom: "09:00",
      availableTo: "17:00",
    },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const response = await getDoctorProfile()
        if (response.status && response.data) {
          setProfileExists(true)
          form.reset({
            // Cast the specialization to the correct type
            specialization: response.data.specialization as (typeof SPECIALIZATIONS)[number],
            clinicAddress: response.data.clinicAddress,
            consultationFee: response.data.consultationFee,
            availableFrom: response.data.availableFrom,
            availableTo: response.data.availableTo,
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

  const onSubmit = async (values: DoctorProfileFormValues) => {
    setIsSubmitting(true)

    try {
      const response = profileExists ? await updateDoctorProfile(values) : await createDoctorProfile(values)

      if (!response.status) {
        throw new Error(response.message || "Failed to save profile")
      }

      toast.success(profileExists ? "Profile Updated" : "Profile Created", {
        description: response.message,
      })

      setProfileExists(true)

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

  return (
    <RoleGuard requiredRole="DOCTOR">
      <div className="w-full max-w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Doctor Profile</h1>
            <p className="text-muted-foreground">Manage your professional information</p>
          </div>
        </div>

        <Card className="overflow-hidden border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-400 text-white text-center p-6 card-gradient-header">
            <CardTitle>{profileExists ? "Update Profile" : "Complete Your Profile"}</CardTitle>
            <CardDescription className="text-emerald-50">
              {profileExists
                ? "Update your professional information below"
                : "Please provide your professional information to complete your profile"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="availableFrom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available From</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormDescription>Start of your working hours</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="availableTo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Available To</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormDescription>End of your working hours</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}

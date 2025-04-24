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
import { patientProfileSchema, type PatientProfileFormValues } from "@/lib/validations/profile"
import { createPatientProfile, updatePatientProfile, getPatientProfile } from "@/actions/profile"
import { BLOOD_GROUPS } from "@/types/profile"
import { Loader2 } from "lucide-react"

export default function PatientProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileExists, setProfileExists] = useState(false)
  const router = useRouter()

  const form = useForm<PatientProfileFormValues>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: {
      bloodGroup: "A_POSITIVE",
      address: "",
      height: 170,
      weight: 70,
    },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const response = await getPatientProfile()
        if (response.status && response.data) {
          setProfileExists(true)
          form.reset({
            // Cast the bloodGroup to the correct type
            bloodGroup: response.data.bloodGroup as (typeof BLOOD_GROUPS)[number],
            address: response.data.address,
            height: response.data.height,
            weight: response.data.weight,
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

  const onSubmit = async (values: PatientProfileFormValues) => {
    setIsSubmitting(true)

    try {
      const response = profileExists
        ? await updatePatientProfile({ ...values, isProfileComplete: true })
        : await createPatientProfile({ ...values, isProfileComplete: true })

      if (!response.status) {
        throw new Error(response.message || "Failed to save profile")
      }

      toast.success(profileExists ? "Profile Updated" : "Profile Created", {
        description: response.message,
      })

      setProfileExists(true)

      // Redirect to dashboard after successful submission
      setTimeout(() => {
        router.push("/patient/dashboard")
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
    <RoleGuard requiredRole="USER">
      <div className="w-full max-w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Patient Profile</h1>
            <p className="text-muted-foreground">Manage your personal health information</p>
          </div>
        </div>

        <Card className="overflow-hidden border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-400 text-white text-center p-6 card-gradient-header">
            <CardTitle>{profileExists ? "Update Profile" : "Complete Your Profile"}</CardTitle>
            <CardDescription className="text-emerald-50">
              {profileExists
                ? "Update your health information below"
                : "Please provide your health information to complete your profile"}
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
                    name="bloodGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Group</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your blood group" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BLOOD_GROUPS.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Select your blood group for medical records</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your address" {...field} />
                        </FormControl>
                        <FormDescription>Your current residential address</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>Your height in centimeters</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormDescription>Your weight in kilograms</FormDescription>
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

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RoleGuard } from "@/components/role-guard"
import { hospitalProfileSchema, type HospitalProfileFormValues } from "@/lib/validations/profile"
import { createHospitalProfile, updateHospitalProfile, getHospitalProfile } from "@/actions/profile"
import { Loader2 } from "lucide-react"

export default function HospitalProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileExists, setProfileExists] = useState(false)
  const router = useRouter()

  const form = useForm<HospitalProfileFormValues>({
    resolver: zodResolver(hospitalProfileSchema),
    defaultValues: {
      hospitalName: "",
      location: "",
      services: "",
    },
  })

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const response = await getHospitalProfile()
        if (response.status && response.data) {
          setProfileExists(true)
          form.reset({
            hospitalName: response.data.hospitalName,
            location: response.data.location,
            services: response.data.services,
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

  const onSubmit = async (values: HospitalProfileFormValues) => {
    setIsSubmitting(true)

    try {
      const response = profileExists ? await updateHospitalProfile(values) : await createHospitalProfile(values)

      if (!response.status) {
        throw new Error(response.message || "Failed to save profile")
      }

      toast.success(profileExists ? "Profile Updated" : "Profile Created", {
        description: response.message,
      })

      setProfileExists(true)

      // Redirect to dashboard after successful submission
      setTimeout(() => {
        router.push("/hospital/dashboard")
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
    <RoleGuard requiredRole="HOSPITAL">
      <div className="w-full max-w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Hospital Profile</h1>
            <p className="text-muted-foreground">Manage your hospital information</p>
          </div>
        </div>

        <Card className="overflow-hidden border-none shadow-md">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-400 text-white text-center p-6 card-gradient-header">
            <CardTitle>{profileExists ? "Update Profile" : "Complete Your Profile"}</CardTitle>
            <CardDescription className="text-emerald-50">
              {profileExists
                ? "Update your hospital information below"
                : "Please provide your hospital information to complete your profile"}
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
                    name="hospitalName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hospital Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter hospital name" {...field} />
                        </FormControl>
                        <FormDescription>The official name of your hospital</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter hospital location" {...field} />
                        </FormControl>
                        <FormDescription>The address of your hospital</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="services"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Services</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter services offered (e.g., Emergency, OPD, Diagnostics)"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>List of services offered by your hospital</FormDescription>
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
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}

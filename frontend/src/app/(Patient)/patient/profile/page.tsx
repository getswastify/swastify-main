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
import { patientProfileSchema, type PatientProfileFormValues } from "@/lib/validations/profile"
import { createPatientProfile, updatePatientProfile, getPatientProfile } from "@/actions/profile"
import { BLOOD_GROUPS } from "@/types/profile"
import { Loader2, Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function PatientProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileExists, setProfileExists] = useState(false)
  const [newAllergy, setNewAllergy] = useState("")
  const [newDisease, setNewDisease] = useState("")
  const router = useRouter()

  const form = useForm<PatientProfileFormValues>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: {
      bloodGroup: "A_POSITIVE",
      address: "",
      height: 0,
      weight: 0,
      allergies: [], // Always provide an empty array, not undefined
      diseases: [], // Always provide an empty array, not undefined
    },
  })

  const { watch, setValue } = form
  const allergies = watch("allergies") || []
  const diseases = watch("diseases") || []

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
            allergies: response.data.allergies || [],
            diseases: response.data.diseases || [],
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

  const onSubmit = async (data: PatientProfileFormValues) => {
    setIsSubmitting(true)

    try {
      const response = profileExists
        ? await updatePatientProfile({ ...data, isProfileComplete: true })
        : await createPatientProfile({ ...data, isProfileComplete: true })

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

  const addAllergy = () => {
    if (newAllergy.trim() === "") return
    if (!allergies.includes(newAllergy)) {
      setValue("allergies", [...allergies, newAllergy])
    }
    setNewAllergy("")
  }

  const removeAllergy = (allergy: string) => {
    setValue(
      "allergies",
      allergies.filter((a) => a !== allergy),
    )
  }

  const addDisease = () => {
    if (newDisease.trim() === "") return
    if (!diseases.includes(newDisease)) {
      setValue("diseases", [...diseases, newDisease])
    }
    setNewDisease("")
  }

  const removeDisease = (disease: string) => {
    setValue(
      "diseases",
      diseases.filter((d) => d !== disease),
    )
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

        <div className="relative w-full overflow-hidden rounded-lg shadow-md">
          {/* Custom header that extends full width */}
          <div className="w-full bg-gradient-to-r from-emerald-600 to-emerald-400 px-6 py-6 text-center">
            <h2 className="text-xl font-semibold text-white">
              {profileExists ? "Update Profile" : "Complete Your Profile"}
            </h2>
            <p className="text-emerald-50">
              {profileExists
                ? "Update your health information below"
                : "Please provide your health information to complete your profile"}
            </p>
          </div>

          {/* Card content */}
          <div className="bg-card p-6">
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

                  <FormField
                    control={form.control}
                    name="allergies"
                    render={() => (
                      <FormItem>
                        <FormLabel>Allergies</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="Add an allergy"
                              value={newAllergy}
                              onChange={(e) => setNewAllergy(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  addAllergy()
                                }
                              }}
                            />
                          </FormControl>
                          <Button type="button" size="sm" onClick={addAllergy}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {allergies.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No allergies added</p>
                          ) : (
                            allergies.map((allergy, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {allergy}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 hover:bg-transparent"
                                  onClick={() => removeAllergy(allergy)}
                                >
                                  <X className="h-3 w-3" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </Badge>
                            ))
                          )}
                        </div>
                        <FormDescription>List any allergies you have (optional)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diseases"
                    render={() => (
                      <FormItem>
                        <FormLabel>Medical Conditions</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="Add a medical condition"
                              value={newDisease}
                              onChange={(e) => setNewDisease(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  addDisease()
                                }
                              }}
                            />
                          </FormControl>
                          <Button type="button" size="sm" onClick={addDisease}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {diseases.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No medical conditions added</p>
                          ) : (
                            diseases.map((disease, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {disease}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 hover:bg-transparent"
                                  onClick={() => removeDisease(disease)}
                                >
                                  <X className="h-3 w-3" />
                                  <span className="sr-only">Remove</span>
                                </Button>
                              </Badge>
                            ))
                          )}
                        </div>
                        <FormDescription>List any ongoing or past conditions (optional)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-center pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
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
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}

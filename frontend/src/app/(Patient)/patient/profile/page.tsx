"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
import { Edit, Loader2, Plus, Save, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import api from "@/lib/axios"

export default function PatientProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileExists, setProfileExists] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [newAllergy, setNewAllergy] = useState("")
  const [newDisease, setNewDisease] = useState("")
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<{
    user?: { firstName?: string; lastName?: string; email?: string; profilePicture?: string }
    bloodGroup?: string
    address?: string
    height?: number
    weight?: number
    allergies?: string[]
    diseases?: string[]
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingPhoto(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await api.patch("/auth/update/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data?.profilePicture) {
        setProfilePhotoUrl(response.data.profilePicture)
        toast.success("Profile picture updated successfully")
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      toast.error("Failed to update profile picture", {
        description: "Please try again later",
      })
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const form = useForm<PatientProfileFormValues>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: {
      bloodGroup: "A_POSITIVE",
      address: "",
      height: 0,
      weight: 0,
      allergies: [],
      diseases: [],
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
          setProfileData(response.data)
          form.reset({
            bloodGroup: response.data.bloodGroup as (typeof BLOOD_GROUPS)[number],
            address: response.data.address,
            height: response.data.height,
            weight: response.data.weight,
            allergies: response.data.allergies || [],
            diseases: response.data.diseases || [],
          })

          if (response.data.user?.profilePicture) {
            setProfilePhotoUrl(response.data.user.profilePicture)
          }
        } else {
          // If no profile exists, set to edit mode to create one
          setIsEditMode(true)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast.error("Failed to load profile", {
          description: "Please try again later",
        })
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
        ? await updatePatientProfile({
            ...data,
            isProfileComplete: true,
            user: undefined,
          })
        : await createPatientProfile({
            ...data,
            isProfileComplete: true,
            user: undefined,
          })

      if (!response.status) {
        throw new Error(response.message || "Failed to save profile")
      }

      toast.success(profileExists ? "Profile Updated" : "Profile Created", {
        description: response.message,
      })

      setProfileExists(true)
      setIsEditMode(false)

      // Update local data
      setProfileData({
        ...profileData,
        bloodGroup: data.bloodGroup,
        address: data.address,
        height: data.height,
        weight: data.weight,
        allergies: data.allergies,
        diseases: data.diseases,
      })
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

  const formatBloodGroup = (bloodGroup: string) => {
    return bloodGroup.replace("_", " ")
  }

  return (
    <RoleGuard requiredRole="USER">
      <div className="w-full max-w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Patient Profile</h1>
            <p className="text-muted-foreground">Manage your personal health information</p>
          </div>

          {profileExists && !isEditMode && (
            <Button onClick={() => setIsEditMode(true)} className="mt-4 md:mt-0" variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="border rounded-lg shadow-md overflow-hidden">
            <div className="w-full bg-gradient-to-r from-emerald-600 to-emerald-400 p-6 text-white">
              <h2 className="text-xl font-semibold">
                {!profileExists ? "Complete Your Profile" : isEditMode ? "Edit Profile" : "Health Information"}
              </h2>
              <p className="text-emerald-50 text-sm mt-1">
                {!profileExists
                  ? "Please provide your health information to complete your profile"
                  : isEditMode
                    ? "Update your health information below"
                    : "Your personal health details"}
              </p>
            </div>

            <CardContent className="p-6">
              {!isEditMode && profileExists ? (
                // View mode
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Profile photo section */}
                    <div className="md:w-1/4 flex flex-col items-center">
                      <div className="relative group">
                        {profilePhotoUrl ? (
                          <Image
                            src={profilePhotoUrl || "/placeholder.svg"}
                            height={128}
                            width={128}
                            alt="Profile"
                            className="h-32 w-32 rounded-full object-cover border-4 border-emerald-500 shadow-md"
                          />
                        ) : (
                          <div className="h-32 w-32 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-emerald-500 shadow-md">
                            <span className="text-4xl font-bold text-emerald-500">
                              {profileData?.user?.firstName?.charAt(0) || "P"}
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={triggerFileInput}
                          className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1.5 rounded-full shadow-md hover:bg-emerald-600 transition-colors"
                          disabled={isUploadingPhoto}
                        >
                          {isUploadingPhoto ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Edit className="h-4 w-4" />
                          )}
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleProfilePhotoUpload}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                      <h3 className="mt-4 font-semibold text-lg">
                        {profileData?.user?.firstName} {profileData?.user?.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{profileData?.user?.email}</p>
                    </div>

                    {/* Profile details section */}
                    <div className="md:w-3/4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium text-muted-foreground mb-2">Blood Group</h3>
                          <p className="text-lg font-semibold">{formatBloodGroup(profileData?.bloodGroup || "")}</p>
                        </div>

                        <div>
                          <h3 className="font-medium text-muted-foreground mb-2">Address</h3>
                          <p className="text-lg">{profileData?.address || "Not provided"}</p>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium text-muted-foreground mb-2">Height</h3>
                          <p className="text-lg">{profileData?.height || 0} cm</p>
                        </div>

                        <div>
                          <h3 className="font-medium text-muted-foreground mb-2">Weight</h3>
                          <p className="text-lg">{profileData?.weight || 0} kg</p>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div>
                        <h3 className="font-medium text-muted-foreground mb-3">Allergies</h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData?.allergies?.length ? (
                            profileData?.allergies?.map((allergy: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {allergy}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-muted-foreground">No allergies recorded</p>
                          )}
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div>
                        <h3 className="font-medium text-muted-foreground mb-3">Medical Conditions</h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData?.diseases?.length ? (
                            profileData.diseases.map((disease: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {disease}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-muted-foreground">No medical conditions recorded</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Edit mode
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
                                  {formatBloodGroup(group)}
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
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleProfilePhotoUpload}
                      className="hidden"
                      accept="image/*"
                    />

                    <div className="flex justify-end gap-3 pt-4">
                      {profileExists && (
                        <Button type="button" variant="outline" onClick={() => setIsEditMode(false)}>
                          Cancel
                        </Button>
                      )}
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {profileExists ? "Save Changes" : "Create Profile"}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}

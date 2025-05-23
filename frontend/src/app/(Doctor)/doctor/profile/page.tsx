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
import { doctorProfileSchema, type DoctorProfileFormValues } from "@/lib/validations/profile"
import { createDoctorProfile, updateDoctorProfile, getDoctorProfile } from "@/actions/profile"
import { SPECIALIZATIONS } from "@/types/profile"
import { Loader2, Clock, CheckCircle, XCircle, Edit, Save, Mail, Phone, Calendar } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { VerificationStatusBadge } from "@/components/verification-status-badge"
import Image from "next/image"
import api from "@/lib/axios"

export default function DoctorProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileExists, setProfileExists] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"PENDING" | "APPROVED" | "REJECTED" | undefined>(
    undefined,
  )
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [profileData, setProfileData] = useState<{
    user?: {
      fullName?: string 
      email?: string
      phone?: string
      dob?: string
      profilePicture?: string
    }
    specialization?: string
    clinicAddress?: string
    consultationFee?: number
    startedPracticeOn?: string
    licenseNumber?: string
    licenseIssuedBy?: string
    licenseDocumentUrl?: string
    isVerified?: "PENDING" | "APPROVED" | "REJECTED"
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      try {
        const response = await getDoctorProfile()
        if (response.status && response.data) {
          setProfileExists(true)
          setProfileData(response.data)
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

  const onSubmit = async (data: DoctorProfileFormValues) => {
    setIsSubmitting(true)

    try {
      // Format the date to ISO-8601 DateTime format
      const formattedData = {
        ...data,
        // Convert YYYY-MM-DD to YYYY-MM-DDT00:00:00Z format
        startedPracticeOn: data.startedPracticeOn,
        licenseDocumentUrl: data.licenseDocumentUrl || "https://example.com/placeholder-license",
        user: {
          fullName: profileData?.user?.fullName || "",
          email: profileData?.user?.email || "",
          phone: profileData?.user?.phone || "",
          dob: profileData?.user?.dob || "",
        },
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
      setIsEditMode(false)

      // Update verification status if it's in the response
      if (response.data?.isVerified) {
        setVerificationStatus(response.data.isVerified)
      }

      // Update local data
      setProfileData({
        ...profileData,
        specialization: data.specialization,
        clinicAddress: data.clinicAddress,
        consultationFee: data.consultationFee,
        startedPracticeOn: data.startedPracticeOn,
        licenseNumber: data.licenseNumber,
        licenseIssuedBy: data.licenseIssuedBy,
        licenseDocumentUrl: data.licenseDocumentUrl,
      })
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not provided"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      console.error(error)
      return dateString
    }
  }

  return (
    <RoleGuard requiredRole="DOCTOR">
      <div className="w-full max-w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Doctor Profile</h1>
            <p className="text-muted-foreground">Manage your professional information</p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {!isLoading && verificationStatus && <VerificationStatusBadge status={verificationStatus} />}

            {profileExists && !isEditMode && (
              <Button onClick={() => setIsEditMode(true)} variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {profileExists && renderVerificationAlert()}

            <div className="border rounded-lg shadow-md overflow-hidden bg-[#0c1120] text-white">
              <div className="w-full bg-emerald-600 p-6">
                <h2 className="text-xl font-semibold">
                  {!profileExists ? "Complete Your Profile" : isEditMode ? "Edit Profile" : "Professional Information"}
                </h2>
                <p className="text-emerald-50 text-sm mt-1">
                  {!profileExists
                    ? "Please provide your professional information to complete your profile"
                    : isEditMode
                      ? "Update your professional information below"
                      : "Your professional details and credentials"}
                </p>
              </div>

              <div className="p-6">
                {!isEditMode && profileExists ? (
                  // View mode
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-10">
                      {/* Profile photo and user details section */}
                      <div className="md:w-1/3 space-y-6">
                        {/* Profile photo */}
                        <div className="flex flex-col items-center">
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
                                  {profileData?.user?.fullName?.charAt(0) || "D"}
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
                          <h3 className="mt-4 font-semibold text-lg">{profileData?.user?.fullName || "Doctor Name"}</h3>
                        </div>

                        {/* Email */}
                        <div className="bg-[#1a2235] p-4 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-emerald-500" />
                            <div>
                              <p className="text-xs uppercase text-gray-400 font-medium">Email</p>
                              <p className="text-white">{profileData?.user?.email || "Not provided"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="bg-[#1a2235] p-4 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Phone className="h-5 w-5 text-emerald-500" />
                            <div>
                              <p className="text-xs uppercase text-gray-400 font-medium">Phone Number</p>
                              <p className="text-white">{profileData?.user?.phone || "Not provided"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="bg-[#1a2235] p-4 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-emerald-500" />
                            <div>
                              <p className="text-xs uppercase text-gray-400 font-medium">Date of Birth</p>
                              <p className="text-white">
                                {profileData?.user?.dob ? formatDate(profileData.user.dob) : "Not provided"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Professional details section */}
                      <div className="md:w-2/3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-medium text-gray-400 mb-2 text-sm uppercase">Specialization</h3>
                            <p className="text-lg font-semibold">{profileData?.specialization || "Not specified"}</p>
                          </div>

                          <div>
                            <h3 className="font-medium text-gray-400 mb-2 text-sm uppercase">Clinic Address</h3>
                            <p className="text-lg">{profileData?.clinicAddress || "Not provided"}</p>
                          </div>
                        </div>

                        <div className="my-6 h-px bg-gray-800"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-medium text-gray-400 mb-2 text-sm uppercase">Consultation Fee</h3>
                            <p className="text-lg">₹{profileData?.consultationFee || 0}</p>
                          </div>

                          <div>
                            <h3 className="font-medium text-gray-400 mb-2 text-sm uppercase">Started Practice On</h3>
                            <p className="text-lg">{formatDate(profileData?.startedPracticeOn)}</p>
                          </div>
                        </div>

                        <div className="my-6 h-px bg-gray-800"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-medium text-gray-400 mb-2 text-sm uppercase">License Number</h3>
                            <p className="text-lg">{profileData?.licenseNumber || "Not provided"}</p>
                          </div>

                          <div>
                            <h3 className="font-medium text-gray-400 mb-2 text-sm uppercase">License Issued By</h3>
                            <p className="text-lg">{profileData?.licenseIssuedBy || "Not provided"}</p>
                          </div>
                        </div>

                        {profileData?.licenseDocumentUrl && (
                          <>
                            <div className="my-6 h-px bg-gray-800"></div>
                            <div>
                              <h3 className="font-medium text-gray-400 mb-2 text-sm uppercase">License Document</h3>
                              <a
                                href={profileData.licenseDocumentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-400 hover:text-emerald-300 hover:underline"
                              >
                                View License Document
                              </a>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Edit mode
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
                              {profileExists ? "Updating..." : "Creating..."}
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

                {!isEditMode && verificationStatus === "REJECTED" && (
                  <div className="mt-6 rounded-lg border border-red-800 bg-red-900/30 p-4 text-sm text-red-200">
                    <p className="font-medium">Important:</p>
                    <p>
                      Your profile was rejected. Please update your information and ensure all details are accurate
                      before resubmitting.
                    </p>
                  </div>
                )}

                {!isEditMode && verificationStatus === "PENDING" && (
                  <div className="mt-6 rounded-lg border border-yellow-800 bg-yellow-900/30 p-4 text-sm text-yellow-200">
                    <p className="font-medium">Note:</p>
                    <p>
                      Your profile is currently under review. You can still update your information while waiting for
                      verification.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </RoleGuard>
  )
}

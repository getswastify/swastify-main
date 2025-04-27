"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, X } from "lucide-react"
import { EmptyAvailabilityState } from "./empty-availability-state"
import { AvailabilityCard } from "./availability-card"
import {
  fetchDoctorAvailability,
  createDoctorAvailability,
  updateDoctorAvailability,
  deleteTimeSlot,
} from "@/actions/availability"
import type { Availability } from "@/types/availability"
import { DAY_NAMES, getDayName } from "@/types/availability"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Form schema with validation for time slots
const timeSlotSchema = z
  .object({
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  })
  .refine(
    (data) => {
      // Validate that start time is before end time
      const [startHour, startMinute] = data.startTime.split(":").map(Number)
      const [endHour, endMinute] = data.endTime.split(":").map(Number)

      const startMinutes = startHour * 60 + startMinute
      const endMinutes = endHour * 60 + endMinute

      return endMinutes > startMinutes
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  )

// Form schema with validation
const availabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  timeSlots: z.array(timeSlotSchema).min(1, "At least one time slot is required"),
})

function AddAvailabilityPopover({
  onSubmit,
  isSubmitting,
  existingDays,
}: {
  onSubmit: (data: Omit<Availability, "id" | "doctorId" | "createdAt" | "updatedAt">) => Promise<void>
  isSubmitting: boolean
  existingDays: number[]
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const availableDayNumbers = [0, 1, 2, 3, 4, 5, 6].filter((day) => !existingDays.includes(day))

  const form = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      dayOfWeek: availableDayNumbers.length > 0 ? availableDayNumbers[0] : 1, // Use first available day
      timeSlots: [{ startTime: "09:00", endTime: "17:00" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "timeSlots",
  })

  const handleSubmit = async (data: z.infer<typeof availabilitySchema>) => {
    // Add this right before the existingDays check
    console.log("Selected day:", data.dayOfWeek, "Existing days:", existingDays)

    // Check if day already exists
    if (existingDays.includes(data.dayOfWeek)) {
      toast.error("Day already exists", {
        description: `You already have availability set for ${getDayName(data.dayOfWeek)}. Please edit the existing entry instead.`,
      })
      return
    }

    await onSubmit(data)
    form.reset({
      dayOfWeek: availableDayNumbers.length > 0 ? availableDayNumbers[0] : 1,
      timeSlots: [{ startTime: "09:00", endTime: "17:00" }],
    })
    setIsPopoverOpen(false)
  }

  const addTimeSlot = () => {
    append({ startTime: "09:00", endTime: "17:00" })
  }

  // Filter out days that already have availability
  // const availableDayNumbers = [0, 1, 2, 3, 4, 5, 6].filter((day) => !existingDays.includes(day))

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button disabled={availableDayNumbers.length === 0}>
          <Plus className="h-4 w-4 mr-2" /> Add Availability
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Add Availability</h4>
          <p className="text-sm text-muted-foreground">Set your available time slots for a specific day.</p>
          {availableDayNumbers.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              You have set availability for all days of the week. Edit existing entries to make changes.
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="dayOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Week</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          // Explicitly convert to number to ensure proper type
                          field.onChange(Number(value))
                        }}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableDayNumbers.map((dayNum) => (
                            <SelectItem key={dayNum} value={dayNum.toString()}>
                              {DAY_NAMES[dayNum]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <FormLabel>Time Slots</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={addTimeSlot}>
                      <Plus className="h-3 w-3 mr-1" /> Add Slot
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <FormField
                          control={form.control}
                          name={`timeSlots.${index}.startTime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input type="time" {...field} placeholder="09:00" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`timeSlots.${index}.endTime`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input type="time" {...field} placeholder="17:00" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPopoverOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function DoctorAvailabilityManager() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch doctor availability on component mount
  useEffect(() => {
    const getAvailability = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetchDoctorAvailability()

        if (response.status) {
          setAvailabilities(response.data || [])
        } else {
          // If error code is DOCTOR_NOT_FOUND or AVAILABILITY_NOT_FOUND, it means doctor hasn't set availability yet
          if (response.error?.code === "DOCTOR_NOT_FOUND" || response.error?.code === "AVAILABILITY_NOT_FOUND") {
            setAvailabilities([])
          } else {
            setError(response.message || "Failed to fetch availability")
            toast.error("Error", {
              description: response.message || "Failed to fetch availability",
            })
          }
        }
      } catch (err) {
        console.log(err)
        setError("An unexpected error occurred")
        toast.error("Error", {
          description: "Failed to fetch availability. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    getAvailability()
  }, [])

  // Handle form submission for creating new availability
  const handleCreateAvailability = async (data: Omit<Availability, "id" | "doctorId" | "createdAt" | "updatedAt">) => {
    setIsSubmitting(true)

    try {
      const response = await createDoctorAvailability(data)

      if (response.status && response.data) {
        setAvailabilities((prev) => [...prev, response.data as Availability])
        toast.success("Success", {
          description: "Availability has been added successfully.",
        })
      } else {
        toast.error("Error", {
          description: response.message || "Failed to add availability",
        })
      }
    } catch (err: unknown) {
      console.log(err)
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle updating an existing availability
  const handleUpdateAvailability = async (data: Availability) => {
    setIsSubmitting(true)

    try {
      // Extract only the necessary fields for the API
      const updateData = {
        dayOfWeek: data.dayOfWeek,
        timeSlots: data.timeSlots,
      }

      const response = await updateDoctorAvailability(updateData)

      if (response.status) {
        // Update the availability in the state
        if (response.data) {
          setAvailabilities((prev) => prev.map((item) => (item.dayOfWeek === data.dayOfWeek ? response.data! : item)))
        }
        toast.success("Success", {
          description: "Availability has been updated successfully.",
        })
      } else {
        toast.error("Error", {
          description: response.message || "Failed to update availability",
        })
      }
    } catch (err: unknown) {
      console.log(err)
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle deleting a time slot
  const handleDeleteTimeSlot = async (availabilityId: string, timeSlotId: string) => {
    if (!confirm("Are you sure you want to delete this time slot?")) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await deleteTimeSlot(availabilityId, timeSlotId)

      if (response.status) {
        // Update the availability in the state by removing the time slot
        setAvailabilities((prev) => {
          return prev
            .map((availability) => {
              if (availability.id === availabilityId) {
                // Filter out the deleted time slot
                const updatedTimeSlots = availability.timeSlots.filter((slot) => slot.id !== timeSlotId)

                // If no time slots left, remove the entire availability
                if (updatedTimeSlots.length === 0) {
                  return null
                }

                // Otherwise, return the availability with updated time slots
                return {
                  ...availability,
                  timeSlots: updatedTimeSlots,
                }
              }
              return availability
            })
            .filter(Boolean) as Availability[] // Remove null entries
        })

        toast.success("Success", {
          description: "Time slot has been deleted successfully.",
        })
      } else {
        toast.error("Error", {
          description: response.message || "Failed to delete time slot",
        })
      }
    } catch (err: unknown) {
      console.log(err)
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get list of days that already have availability set
  const existingDays = availabilities.map((a) => a.dayOfWeek)

  // Sort availabilities by day of week (Sunday first, then Monday, etc.)
  const sortedAvailabilities = [...availabilities].sort((a, b) => a.dayOfWeek - b.dayOfWeek)

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-6 text-center">
        <h3 className="text-lg font-medium text-destructive mb-2">Something went wrong</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {availabilities.length === 0 ? (
        <EmptyAvailabilityState onAddAvailability={handleCreateAvailability} isSubmitting={isSubmitting} />
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>Your current availability for appointments</CardDescription>
                </div>
                <AddAvailabilityPopover
                  onSubmit={handleCreateAvailability}
                  isSubmitting={isSubmitting}
                  existingDays={existingDays}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {sortedAvailabilities.map((availability) => (
                    <motion.div
                      key={availability.id || availability.dayOfWeek.toString()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="relative"
                    >
                      <AvailabilityCard
                        availability={availability}
                        onUpdate={handleUpdateAvailability}
                        onDeleteTimeSlot={handleDeleteTimeSlot}
                        isSubmitting={isSubmitting}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

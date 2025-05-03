"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, X, Calendar, Info } from "lucide-react"
import { EmptyAvailabilityState } from "./empty-availability-state"
import { AvailabilityCard } from "./availability-card"
import {
  fetchDoctorAvailability,
  createDoctorAvailability,
  updateDoctorAvailability,
  deleteAvailabilitySlot,
} from "@/actions/availability"
import type { Availability } from "@/types/availability"
import { DAY_NAMES, groupAvailabilityByDay, logTimezoneInfo, normalizeTimeFormat } from "@/types/availability"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TimePicker } from "@/components/ui/time-picker"

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
  dayOfWeek: z.string(),
  timeSlots: z.array(timeSlotSchema).min(1, "At least one time slot is required"),
})

function AddAvailabilityPopover({
  onSubmit,
  isSubmitting,
  existingDays,
}: {
  onSubmit: (data: { dayOfWeek: string; timeSlots: { startTime: string; endTime: string }[] }) => Promise<void>
  isSubmitting: boolean
  existingDays: string[]
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [timezoneName, setTimezoneName] = useState("")

  useEffect(() => {
    // Set timezone name to IST for clarity
    setTimezoneName("IST (India Standard Time)")
  }, [])

  const availableDays = DAY_NAMES.filter((day) => !existingDays.includes(day))

  const form = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      dayOfWeek: availableDays.length > 0 ? availableDays[0] : "Monday",
      timeSlots: [{ startTime: "09:00", endTime: "17:00" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "timeSlots",
  })

  const handleSubmit = async (data: z.infer<typeof availabilitySchema>) => {
    // Check if day already exists
    if (existingDays.includes(data.dayOfWeek)) {
      toast.error("Day already exists", {
        description: `You already have availability set for ${data.dayOfWeek}. Please edit the existing entry instead.`,
      })
      return
    }

    await onSubmit(data)
    form.reset({
      dayOfWeek: availableDays.length > 0 ? availableDays[0] : "Monday",
      timeSlots: [{ startTime: "09:00", endTime: "17:00" }],
    })
    setIsPopoverOpen(false)
  }

  const addTimeSlot = () => {
    append({ startTime: "09:00", endTime: "17:00" })
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button disabled={availableDays.length === 0}>
          <Plus className="h-4 w-4 mr-2" /> Add Availability
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Add Availability</h4>
          <p className="text-sm text-muted-foreground">Set your available time slots for a specific day.</p>
          {availableDays.length === 0 ? (
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
                      <Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableDays.map((day) => (
                            <SelectItem key={day} value={day}>
                              {day}
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
                    <div className="flex items-center gap-1.5">
                      <FormLabel>Time Slots</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Times are in your local timezone ({timezoneName})</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
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
                                <TimePicker value={field.value} onChange={field.onChange} />
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
                                <TimePicker value={field.value} onChange={field.onChange} />
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

  // Log timezone info for debugging
  useEffect(() => {
    logTimezoneInfo()
  }, [])

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
          // If no availability found, set empty array
          if (response.message === "No availability found for the doctor.") {
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
  const handleCreateAvailability = async (data: {
    dayOfWeek: string
    timeSlots: { startTime: string; endTime: string }[]
  }) => {
    setIsSubmitting(true)

    try {
      // Normalize all time formats before sending to the server
      const normalizedData = {
        dayOfWeek: data.dayOfWeek,
        timeSlots: data.timeSlots.map((slot) => ({
          startTime: normalizeTimeFormat(slot.startTime),
          endTime: normalizeTimeFormat(slot.endTime),
        })),
      }

      const response = await createDoctorAvailability(normalizedData)

      if (response.status) {
        // Refetch availability after creating
        const updatedResponse = await fetchDoctorAvailability()
        if (updatedResponse.status) {
          setAvailabilities(updatedResponse.data || [])
        }

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
  const handleUpdateAvailability = async (data: {
    dayOfWeek: string
    timeSlots: { startTime: string; endTime: string }[]
  }) => {
    setIsSubmitting(true)

    try {
      // Normalize all time formats before sending to the server
      const normalizedData = {
        dayOfWeek: data.dayOfWeek,
        timeSlots: data.timeSlots.map((slot) => ({
          startTime: normalizeTimeFormat(slot.startTime),
          endTime: normalizeTimeFormat(slot.endTime),
        })),
      }

      const response = await updateDoctorAvailability(normalizedData)

      if (response.status) {
        // Refetch availability after updating
        const updatedResponse = await fetchDoctorAvailability()
        if (updatedResponse.status) {
          setAvailabilities(updatedResponse.data || [])
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

  // Handle deleting an availability slot
  const handleDeleteAvailability = async (availabilityId: number) => {
    if (!confirm("Are you sure you want to delete this time slot?")) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await deleteAvailabilitySlot(availabilityId)

      if (response.status) {
        // Update the state by removing the deleted availability
        setAvailabilities((prev) => prev.filter((avail) => avail.id !== availabilityId))

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

  // Group availabilities by day of week
  const groupedAvailabilities = groupAvailabilityByDay(availabilities)

  // Get list of days that already have availability set
  const existingDays = Object.keys(groupedAvailabilities)

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

  // Update the UI for the doctor availability manager
  return (
    <div className="space-y-8">
      {availabilities.length === 0 ? (
        <EmptyAvailabilityState onAddAvailability={handleCreateAvailability} isSubmitting={isSubmitting} />
      ) : (
        <>
          <Card className="border border-muted/60 shadow-sm">
            <CardHeader className="bg-muted/20">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" /> Weekly Schedule
                  </CardTitle>
                  <CardDescription>Set your weekly availability for patient appointments</CardDescription>
                </div>
                <AddAvailabilityPopover
                  onSubmit={handleCreateAvailability}
                  isSubmitting={isSubmitting}
                  existingDays={existingDays}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {Object.entries(groupedAvailabilities).map(([day, dayAvailabilities]) => (
                    <motion.div
                      key={day}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="relative"
                    >
                      <AvailabilityCard
                        dayOfWeek={day}
                        availabilities={dayAvailabilities}
                        onUpdate={handleUpdateAvailability}
                        onDeleteAvailability={handleDeleteAvailability}
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

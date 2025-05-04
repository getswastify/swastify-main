"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Edit2, Trash2, Save, X, Plus, Info } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import type { Availability } from "@/types/availability"
import {
  DAY_NAMES,
  formatTimeFrom24h,
  getTimezoneName,
  normalizeTimeFormat,
  utcToISTTimeHHMM,
} from "@/types/availability"
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
  timeSlots: z.array(timeSlotSchema),
})

interface AvailabilityCardProps {
  dayOfWeek: string
  availabilities: Availability[]
  onUpdate: (data: { dayOfWeek: string; timeSlots: { startTime: string; endTime: string }[] }) => Promise<void>
  onDeleteAvailability: (availabilityId: number) => Promise<void>
  isSubmitting: boolean
}

export function AvailabilityCard({
  dayOfWeek,
  availabilities,
  onUpdate,
  onDeleteAvailability,
  isSubmitting,
}: AvailabilityCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [timezoneName, setTimezoneName] = useState("")

  useEffect(() => {
    // Get the timezone name on component mount
    setTimezoneName(getTimezoneName())
  }, [])

  // Extract time slots from availabilities with proper timezone handling
  const extractTimeSlots = useCallback(() => {
    return availabilities.map((avail) => {
      let startTime = avail.startTime || ""
      let endTime = avail.endTime || ""

      // Normalize time formats
      startTime = normalizeTimeFormat(startTime)
      endTime = normalizeTimeFormat(endTime)

      return {
        id: avail.id,
        startTime,
        endTime,
      }
    })
  }, [availabilities])

  const form = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      dayOfWeek: dayOfWeek,
      timeSlots: extractTimeSlots(),
    },
  })

  // Update form values when availabilities change
  useEffect(() => {
    form.reset({
      dayOfWeek: dayOfWeek,
      timeSlots: extractTimeSlots(),
    })
  }, [availabilities, dayOfWeek, form, extractTimeSlots])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "timeSlots",
  })

  const handleSubmit = async (data: z.infer<typeof availabilitySchema>) => {
    await onUpdate({
      dayOfWeek: data.dayOfWeek,
      timeSlots: data.timeSlots,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    form.reset({
      dayOfWeek: dayOfWeek,
      timeSlots: extractTimeSlots(),
    })
    setIsEditing(false)
  }

  const addTimeSlot = () => {
    append({ startTime: "09:00", endTime: "17:00" })
  }

  return (
    <Card className="overflow-hidden h-full shadow-md hover:shadow-lg transition-all duration-200">
      {/* Left border accent that extends full height */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />

      {/* Header that covers the entire top of the card */}
      <div className="flex justify-between items-center p-4 bg-background border-b">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          {isEditing ? (
            <span className="font-medium">Edit Schedule</span>
          ) : (
            <CardTitle className="text-base">{dayOfWeek}</CardTitle>
          )}
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          Available
        </Badge>
      </div>

      <CardContent className="pt-4 relative">
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={(value) => field.onChange(value)} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DAY_NAMES.map((day) => (
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
                    <h4 className="text-sm font-medium">Time Slots</h4>
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
                  <Button type="button" variant="outline" size="sm" onClick={addTimeSlot} className="gap-1">
                    <Plus className="h-3 w-3" /> Add Slot
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <FormField
                        control={form.control}
                        name={`timeSlots.${index}.startTime`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <TimePicker value={field.value} onChange={field.onChange} className="w-full" />
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
                              <TimePicker value={field.value} onChange={field.onChange} className="w-full" />
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
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" /> Save
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-1" /> Cancel
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {availabilities.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-sm">No time slots available</div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Times shown in {timezoneName}</span>
                  </div>
                  {availabilities.map((avail, index) => {
                    // Convert UTC times to IST time
                    let istStartTime, istEndTime

                    if (avail.startTime?.includes("T")) {
                      // Convert ISO string to IST time HH:MM
                      istStartTime = utcToISTTimeHHMM(avail.startTime)
                    } else {
                      istStartTime = avail.startTime
                    }

                    if (avail.endTime?.includes("T")) {
                      // Convert ISO string to IST time HH:MM
                      istEndTime = utcToISTTimeHHMM(avail.endTime)
                    } else {
                      istEndTime = avail.endTime
                    }

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>
                            {istStartTime && istEndTime
                              ? `${formatTimeFrom24h(istStartTime)} - ${formatTimeFrom24h(istEndTime)}`
                              : "Time not available"}
                          </span>
                        </div>
                        {avail.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDeleteAvailability(avail.id!)}
                            disabled={isSubmitting}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4" /> Edit
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

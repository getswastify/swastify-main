"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Edit2, Trash2, Save, X, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import type { Availability } from "@/types/availability"
import { DAY_NAMES, formatTimeFrom24h } from "@/types/availability"

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

  // Extract time slots from availabilities
  const extractTimeSlots = () => {
    return availabilities.map((avail) => {
      // Extract HH:MM from ISO string or use as is if already in that format
      const startTime = avail.startTime?.includes("T") ? avail.startTime.split("T")[1].substring(0, 5) : avail.startTime

      const endTime = avail.endTime?.includes("T") ? avail.endTime.split("T")[1].substring(0, 5) : avail.endTime

      return {
        id: avail.id,
        startTime: startTime || "",
        endTime: endTime || "",
      }
    })
  }

  const form = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      dayOfWeek: dayOfWeek,
      timeSlots: extractTimeSlots(),
    },
  })

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
    <Card className="overflow-hidden border-l-4 border-l-primary h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
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
      </CardHeader>
      <CardContent>
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
                  <h4 className="text-sm font-medium">Time Slots</h4>
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
                              <Input type="time" {...field} className="w-full" />
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
                              <Input type="time" {...field} className="w-full" />
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
              {availabilities.map((avail, index) => {
                // Extract time from ISO string or use directly if already in HH:MM format
                const startTime = avail.startTime?.includes("T")
                  ? avail.startTime.split("T")[1].substring(0, 5)
                  : avail.startTime

                const endTime = avail.endTime?.includes("T")
                  ? avail.endTime.split("T")[1].substring(0, 5)
                  : avail.endTime

                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {startTime && endTime
                          ? `${formatTimeFrom24h(startTime)} - ${formatTimeFrom24h(endTime)}`
                          : "Time not available"}
                      </span>
                    </div>
                    {avail.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => onDeleteAvailability(avail.id!)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-1" /> Edit
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

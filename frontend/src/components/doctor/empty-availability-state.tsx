"use client"

import { motion } from "motion/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Loader2, Plus, X } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { DAY_NAMES } from "@/types/availability"

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

interface EmptyAvailabilityStateProps {
  onAddAvailability: (data: { dayOfWeek: string; timeSlots: { startTime: string; endTime: string }[] }) => Promise<void>
  isSubmitting: boolean
}

export function EmptyAvailabilityState({ onAddAvailability, isSubmitting }: EmptyAvailabilityStateProps) {
  const form = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      dayOfWeek: "Monday",
      timeSlots: [{ startTime: "09:00", endTime: "17:00" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "timeSlots",
  })

  const handleSubmit = async (data: z.infer<typeof availabilitySchema>) => {
    await onAddAvailability(data)
    form.reset()
  }

  const addTimeSlot = () => {
    append({ startTime: "09:00", endTime: "17:00" })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="border-dashed">
        <CardHeader className="pb-4">
          <CardTitle>Set Your Availability</CardTitle>
          <CardDescription>You have not set your availability yet. Start by adding your timings! 🚀</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-6">
          <div className="mb-6 flex justify-center">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
              className="relative w-40 h-40 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
              <div className="relative flex flex-col items-center">
                <Calendar className="h-16 w-16 text-primary mb-2" />
                <Clock className="h-8 w-8 text-primary/70 absolute bottom-0 right-0" />
              </div>
            </motion.div>
          </div>

          <div className="text-center mb-6 max-w-md">
            <h3 className="text-lg font-medium mb-2">Why set your availability?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Allow patients to book appointments with you</li>
              <li>• Control your working hours</li>
              <li>• Manage your schedule efficiently</li>
            </ul>
          </div>

          <Card className="w-full max-w-md border shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Create Schedule</CardTitle>
              <CardDescription>Set your available time slots for a specific day</CardDescription>
            </CardHeader>
            <CardContent>
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

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Schedule...
                      </>
                    ) : (
                      "Create Schedule"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </motion.div>
  )
}

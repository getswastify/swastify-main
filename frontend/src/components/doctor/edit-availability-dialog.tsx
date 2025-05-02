"use client"

import { motion } from "motion/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Availability } from "@/types/availability"

// Form schema with validation
const availabilitySchema = z
  .object({
    dayOfWeek: z.coerce.number().min(0).max(6),
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

interface EmptyAvailabilityStateProps {
  onAddAvailability: (data: Omit<Availability, "id">) => Promise<void>
  isSubmitting: boolean
}

export function EmptyAvailabilityState({ onAddAvailability, isSubmitting }: EmptyAvailabilityStateProps) {
  const form = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "17:00",
    },
  })

  const handleSubmit = async (data: z.infer<typeof availabilitySchema>) => {
    const transformedData = {
      dayOfWeek: data.dayOfWeek.toString(),
      timeSlots: [{ startTime: data.startTime, endTime: data.endTime }],
    }
    await onAddAvailability(transformedData)
    form.reset()
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
              <CardDescription>Set your available time slot for a specific day</CardDescription>
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
                        <Select
                          onValueChange={(value) => field.onChange(Number.parseInt(value))}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">Sunday</SelectItem>
                            <SelectItem value="1">Monday</SelectItem>
                            <SelectItem value="2">Tuesday</SelectItem>
                            <SelectItem value="3">Wednesday</SelectItem>
                            <SelectItem value="4">Thursday</SelectItem>
                            <SelectItem value="5">Friday</SelectItem>
                            <SelectItem value="6">Saturday</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} className="w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { EmptyAvailabilityState } from "./empty-availability-state";
import { AvailabilityCard } from "./availability-card";
import {
  fetchDoctorAvailability,
  createDoctorAvailability,
  updateDoctorAvailability,
  deleteDoctorAvailability,
} from "@/actions/availability";
import type { Availability } from "@/types/availability";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Form schema with validation
const availabilitySchema = z
  .object({
    dayOfWeek: z.coerce.number().min(0).max(6),
    startTime: z
      .string()
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
    endTime: z
      .string()
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  })
  .refine(
    (data) => {
      // Validate that start time is before end time
      const [startHour, startMinute] = data.startTime.split(":").map(Number);
      const [endHour, endMinute] = data.endTime.split(":").map(Number);

      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      return endMinutes > startMinutes;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

// Add the AddAvailabilityPopover component inside the DoctorAvailabilityManager component
// Add this right after the availabilitySchema definition

function AddAvailabilityPopover({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: Omit<Availability, "id">) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const form = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      dayOfWeek: 1, // Monday
      startTime: "09:00",
      endTime: "17:00",
    },
  });

  const handleSubmit = async (data: z.infer<typeof availabilitySchema>) => {
    await onSubmit(data);
    form.reset({
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "17:00",
    });
    setIsPopoverOpen(false);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add Availability
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Add Availability</h4>
          <p className="text-sm text-muted-foreground">
            Set your available time slot for a specific day.
          </p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4">
              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(Number.parseInt(value))
                      }
                      defaultValue={field.value.toString()}>
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
                        <Input type="time" {...field} placeholder="09:00" />
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
                        <Input type="time" {...field} placeholder="17:00" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPopoverOpen(false)}
                  disabled={isSubmitting}>
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
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DoctorAvailabilityManager() {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctor availability on component mount
  useEffect(() => {
    const getAvailability = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchDoctorAvailability();

        if (response.status) {
          setAvailabilities(response.data || []);
        } else {
          // If error code is DOCTOR_NOT_FOUND or AVAILABILITY_NOT_FOUND, it means doctor hasn't set availability yet
          if (
            response.error?.code === "DOCTOR_NOT_FOUND" ||
            response.error?.code === "AVAILABILITY_NOT_FOUND"
          ) {
            setAvailabilities([]);
          } else {
            setError(response.message || "Failed to fetch availability");
            toast.error("Error", {
              description: response.message || "Failed to fetch availability",
            });
          }
        }
      } catch (err) {
        console.log(err);
        setError("An unexpected error occurred");
        toast.error("Error", {
          description: "Failed to fetch availability. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getAvailability();
  }, []);

  // Handle form submission for creating new availability
  const handleCreateAvailability = async (data: Omit<Availability, "id">) => {
    setIsSubmitting(true);

    try {
      const response = await createDoctorAvailability(data);

      if (response.status && response.data) {
        setAvailabilities((prev) => [...prev, response.data as Availability]);
        toast.success("Success", {
          description: "Availability has been added successfully.",
        });
      } else {
        toast.error("Error", {
          description: response.message || "Failed to add availability",
        });
      }
    } catch (err: unknown) {
      console.log(err);
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle updating an existing availability
  const handleUpdateAvailability = async (data: Availability) => {
    setIsSubmitting(true);

    try {
      const response = await updateDoctorAvailability(data);

      if (response.status) {
        // Update the availability in the state
        if (response.data) {
          setAvailabilities((prev) =>
            prev.map((item) => (item.id === data.id ? response.data! : item))
          );
        }
        toast.success("Success", {
          description: "Availability has been updated successfully.",
        });
      } else {
        toast.error("Error", {
          description: response.message || "Failed to update availability",
        });
      }
    } catch (err: unknown) {
      console.log(err);
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting an availability
  const handleDeleteAvailability = async (id: string) => {
    if (!confirm("Are you sure you want to delete this availability?")) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await deleteDoctorAvailability(id);

      if (response.status) {
        // Remove the availability from the state
        setAvailabilities((prev) => prev.filter((item) => item.id !== id));
        toast.success("Success", {
          description: "Availability has been deleted successfully.",
        });
      } else {
        toast.error("Error", {
          description: response.message || "Failed to delete availability",
        });
      }
    } catch (err: unknown) {
      console.log(err);

      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sort availabilities by day of week
  const sortedAvailabilities = [...availabilities].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek
  );

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-6 text-center">
        <h3 className="text-lg font-medium text-destructive mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {availabilities.length === 0 ? (
        <EmptyAvailabilityState
          onAddAvailability={handleCreateAvailability}
          isSubmitting={isSubmitting}
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Weekly Schedule</CardTitle>
                  <CardDescription>
                    Your current availability for appointments
                  </CardDescription>
                </div>
                <AddAvailabilityPopover
                  onSubmit={handleCreateAvailability}
                  isSubmitting={isSubmitting}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {sortedAvailabilities.map((availability) => (
                    <motion.div
                      key={availability.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="relative">
                      <AvailabilityCard
                        availability={availability}
                        onUpdate={handleUpdateAvailability}
                        onDelete={handleDeleteAvailability}
                        isSubmitting={isSubmitting}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          {/* Edit Dialog removed - using inline editing instead */}
        </>
      )}
    </div>
  );
}

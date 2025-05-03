"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TimePickerProps {
  value: string // in 24h format "HH:MM"
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function TimePicker({ value, onChange, disabled, className }: TimePickerProps) {
  // Generate time options in 30-minute intervals
  const timeOptions = React.useMemo(() => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (const minute of [0, 30]) {
        const formattedHour = hour.toString().padStart(2, "0")
        const formattedMinute = minute.toString().padStart(2, "0")
        const time24h = `${formattedHour}:${formattedMinute}`

        // Convert to 12h format for display
        const hour12 = hour % 12 || 12
        const ampm = hour >= 12 ? "PM" : "AM"
        const display = `${hour12}:${formattedMinute.padStart(2, "0")} ${ampm}`

        options.push({ value: time24h, display })
      }
    }
    return options
  }, [])

  // Format the current value for display
  const displayValue = React.useMemo(() => {
    if (!value) return ""

    const [hours, minutes] = value.split(":").map(Number)
    const hour12 = hours % 12 || 12
    const ampm = hours >= 12 ? "PM" : "AM"
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${ampm}`
  }, [value])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayValue || "Select time"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <ScrollArea className="h-80">
          <div className="grid">
            {timeOptions.map((option) => (
              <Button
                key={option.value}
                variant="ghost"
                className={cn(
                  "justify-start font-normal",
                  value === option.value && "bg-accent text-accent-foreground",
                )}
                onClick={() => onChange(option.value)}
              >
                {option.display}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

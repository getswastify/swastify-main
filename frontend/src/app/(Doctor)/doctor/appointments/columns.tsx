"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { DoctorAppointment } from "@/actions/appointments"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Eye } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import api from "@/lib/axios"
import { toast } from "sonner" // Optional for better user feedback
import Link from "next/link"

export const columns: ColumnDef<DoctorAppointment>[] = [
  {
    accessorKey: "patientName",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Patient Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "appointmentTime",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Appointment Time (IST)
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const time = new Date(row.getValue("appointmentTime"))
      return <div>{time.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const appointment = row.original

      const handleStatusChange = async (value: string) => {
        try {
          await api.put("/doctor/update-appointment-status", {
            appointmentId: appointment.appointmentId,
            status: value,
          })
          toast.success("Status updated successfully!")
          // Optional: refetch data after update
        } catch (error) {
          console.error("Error updating status:", error)
          toast.error("Failed to update status.")
        }
      }

      return (
        <Select defaultValue={appointment.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const appointment = row.original

      // Use Link component instead of useRouter hook
      return (
        <Link href={`/doctor/appointments/${appointment.appointmentId}`}>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" /> View
          </Button>
        </Link>
      )
    },
  },
]

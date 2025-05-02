"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, User, Stethoscope } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getDoctors } from "@/actions/appointments"
import { toast } from "sonner"

interface Doctor {
  id: string
  name: string
  specialty: string
  experience: number
}

interface DoctorSearchProps {
  onDoctorSelect: (doctor: Doctor) => void
  selectedDoctorId: string | null
}

export function DoctorSearch({ onDoctorSelect, selectedDoctorId }: DoctorSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch doctors from API
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true)
      try {
        const response = await getDoctors()
        setDoctors(response.doctors)
        setFilteredDoctors(response.doctors)
      } catch (error) {
        console.error("Error fetching doctors:", error)
        toast.error("Failed to load doctors")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  // Filter doctors based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDoctors(doctors)
      return
    }

    const filtered = doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredDoctors(filtered)
  }, [searchTerm, doctors])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Find a Doctor</CardTitle>
        <CardDescription>Search for a doctor by name or specialty</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search doctors..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-9 w-24 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No doctors found matching your search</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedDoctorId === doctor.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
                  }`}
                  onClick={() => onDoctorSelect(doctor)}
                >
                  <Avatar className="h-12 w-12 border">
                    <AvatarImage src="/placeholder.svg?height=100&width=100" alt={doctor.name} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doctor.name}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Stethoscope className="h-3 w-3 mr-1" />
                      <span>{doctor.specialty}</span>
                      {doctor.experience > 0 && <span className="ml-2">• {doctor.experience} years experience</span>}
                    </div>
                  </div>
                  <Button
                    variant={selectedDoctorId === doctor.id ? "default" : "outline"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDoctorSelect(doctor)
                    }}
                  >
                    {selectedDoctorId === doctor.id ? "Selected" : "Select"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ClipboardList } from "lucide-react"
import { getProfileRouteByRole } from "@/lib/roles"

interface ProfileCompletionDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  userRole: string
}

export function ProfileCompletionDialog({ isOpen, onOpenChange, userRole }: ProfileCompletionDialogProps) {
  const router = useRouter()
  const [profileRoute, setProfileRoute] = useState("/dashboard")

  useEffect(() => {
    if (userRole) {
      setProfileRoute(getProfileRouteByRole(userRole))
    }
  }, [userRole])

  const handleCompleteProfile = () => {
    onOpenChange(false)
    router.push(profileRoute)
  }

  const getRoleSpecificText = () => {
    switch (userRole) {
      case "DOCTOR":
        return {
          title: "Complete Your Doctor Profile",
          description:
            "Please complete your professional profile to access all doctor features and be visible to patients.",
        }
      case "HOSPITAL":
        return {
          title: "Complete Your Hospital Profile",
          description: "Please complete your hospital profile to access all features and be visible in the directory.",
        }
      case "USER":
      default:
        return {
          title: "Complete Your Patient Profile",
          description:
            "Please complete your health profile to get personalized care recommendations and access all features.",
        }
    }
  }

  const { title, description } = getRoleSpecificText()

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center sm:space-x-2">
          <Button onClick={handleCompleteProfile} className="w-full">
            Complete Profile Now
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-2 sm:mt-0 w-full">
            Remind Me Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

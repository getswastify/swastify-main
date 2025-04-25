import { CheckCircle, Clock, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type VerificationStatus = "PENDING" | "APPROVED" | "REJECTED" | undefined

interface VerificationStatusBadgeProps {
  status: VerificationStatus
  className?: string
}

export function VerificationStatusBadge({ status, className }: VerificationStatusBadgeProps) {
  if (!status) return null

  switch (status) {
    case "APPROVED":
      return (
        <Badge variant="outline" className={cn("bg-green-500/10 text-green-600 border-green-200", className)}>
          <CheckCircle className="mr-1 h-3 w-3" />
          Verified
        </Badge>
      )
    case "REJECTED":
      return (
        <Badge variant="outline" className={cn("bg-red-500/10 text-red-600 border-red-200", className)}>
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      )
    case "PENDING":
    default:
      return (
        <Badge variant="outline" className={cn("bg-yellow-500/10 text-yellow-600 border-yellow-200", className)}>
          <Clock className="mr-1 h-3 w-3" />
          Pending Verification
        </Badge>
      )
  }
}

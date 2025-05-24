"use client"

import { useEffect, useState } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { AlertCircle, Calendar, CheckCircle, Info, LinkIcon, Settings, ShieldAlert, Unlink } from "lucide-react"
import api from "@/lib/axios"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function DoctorSettingsPage() {
  const [isConnectingCalendar, setIsConnectingCalendar] = useState(false)
  const [isDisconnectingCalendar, setIsDisconnectingCalendar] = useState(false)
  // This would ideally come from an API call to check if calendar is connected
  const [isCalendarConnected, setIsCalendarConnected] = useState(false)


  const handleConnectCalendar = async () => {
    try {
      setIsConnectingCalendar(true)
      const res = await api.get("/doctor/calendar-connect")
      const { url } = res.data
      window.location.href = url
    } catch (err) {
      console.error("❌ Failed to get Google Auth URL", err)
      toast.error("Failed to connect to Google Calendar. Please try again.")
    } finally {
      setIsConnectingCalendar(false)
    }
  }

  const handleDisconnectCalendar = async () => {
    try {
      setIsDisconnectingCalendar(true)
      // This would be the actual API call to disconnect
      // await api.post("/doctor/calendar-disconnect")

      // For now, just simulate success
      setTimeout(() => {
        setIsCalendarConnected(false)
        toast.success("Google Calendar disconnected successfully")
        setIsDisconnectingCalendar(false)
      }, 1000)
    } catch (err) {
      console.error("Failed to disconnect Google Calendar", err)
      toast.error("Failed to disconnect Google Calendar. Please try again.")
      setIsDisconnectingCalendar(false)
    }
  }

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings/doctor-settings")
        setIsCalendarConnected(res.data.data.isCalendarConnected)
      } catch (err) {
        console.error("Failed to fetch doctor settings", err)
      }
    }
  
    fetchSettings()
  }, [])

  return (
    <RoleGuard requiredRole="DOCTOR">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <Separator />

        <div className="grid gap-6">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Account Settings
            </h2>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Calendar Integration
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Connecting your Google Calendar allows us to:</p>
                        <ul className="list-disc pl-4 mt-1 text-xs">
                          <li>Check your availability for appointments</li>
                          <li>Add confirmed appointments to your calendar</li>
                          <li>Sync cancellations and reschedules</li>
                        </ul>
                        <p className="mt-1 text-xs">We will never modify existing events or access event details.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
                <CardDescription>
                  Connect your Google Calendar to sync your appointments and manage your availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isCalendarConnected ? (
                  <Alert className="border-green-500 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle>Google Calendar Connected</AlertTitle>
                    <AlertDescription>
                      Your Google Calendar is connected and syncing with your appointments.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="default" className="border-amber-500">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <AlertTitle>Google Calendar Not Connected</AlertTitle>
                    <AlertDescription>
                      Connect your Google Calendar to automatically sync your appointments and manage your availability.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                {isCalendarConnected ? (
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={handleDisconnectCalendar}
                    disabled={isDisconnectingCalendar}
                  >
                    {isDisconnectingCalendar ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        Disconnecting...
                      </>
                    ) : (
                      <>
                        <Unlink className="mr-2 h-4 w-4" />
                        Disconnect Calendar
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleConnectCalendar} disabled={isConnectingCalendar}>
                    {isConnectingCalendar ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Connect Google Calendar
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          </section> 
        </div>
      </div>
    </RoleGuard>
  )
}

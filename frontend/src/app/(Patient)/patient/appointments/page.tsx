"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleGuard } from "@/components/role-guard";
import { useRouter } from "next/navigation";
import { Calendar, Plus, User, X, AlertCircle } from "lucide-react";
import {
  formatAppointmentTime,
  getPatientAppointments,
  type Appointment,
} from "@/actions/appointments";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/axios";

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const router = useRouter();

  // Fetch appointments when activeTab changes
  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      setAppointments([]); // Clear previous appointments when switching tabs

      try {
        const response = await getPatientAppointments(activeTab); // Fetch based on activeTab (status)
        if (response.appointments.length === 0) {
          toast.info(`No ${activeTab} appointments found.`);
        }
        setAppointments(response.appointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        // toast.error("Failed to load appointments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [activeTab]); // Trigger fetch when activeTab changes

  return (
    <RoleGuard requiredRole="USER">
      <div className="w-full max-w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">My Appointments</h1>
            <p className="text-muted-foreground">
              View and manage your appointments
            </p>
          </div>
          <Button
            onClick={() => router.push("/patient/book-appointment")}
            className="mt-4 md:mt-0">
            <Plus className="mr-2 h-4 w-4" />
            Book New Appointment
          </Button>
        </div>

        <Tabs
          defaultValue="upcoming"
          value={activeTab}
          onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          {/* Handle the Content for Each Tab */}
          <TabsContent value="upcoming" className="mt-6">
            {isLoading ? (
              <AppointmentsSkeleton />
            ) : appointments.length === 0 ? (
              <EmptyAppointments
                title="No upcoming appointments"
                description="You don't have any upcoming appointments scheduled."
                actionText="Book an Appointment"
                onAction={() => router.push("/patient/book-appointment")}
              />
            ) : (
              <div className="grid gap-4">
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.appointmentId}
                    appointment={appointment}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {isLoading ? (
              <AppointmentsSkeleton />
            ) : appointments.length === 0 ? (
              <EmptyAppointments
                title="No past appointments"
                description="You don't have any past appointments."
                actionText="Book an Appointment"
                onAction={() => router.push("/patient/book-appointment")}
              />
            ) : (
              <div className="grid gap-4">
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.appointmentId}
                    appointment={appointment}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            {isLoading ? (
              <AppointmentsSkeleton />
            ) : appointments.length === 0 ? (
              <EmptyAppointments
                title="No cancelled appointments"
                description="You don't have any cancelled appointments."
                actionText="Book an Appointment"
                onAction={() => router.push("/patient/book-appointment")}
              />
            ) : (
              <div className="grid gap-4">
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.appointmentId}
                    appointment={appointment}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
};

const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancelAppointment = async () => {
    try {
      await api.delete(`/patient/cancel-appointment/${appointment.appointmentId}`);
      setShowCancelDialog(false);
      toast.success("Appointment cancelled successfully");
    } catch (error) {
      console.error(error)
      // toast.error("Failed to cancel appointment");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <Badge variant="default">Confirmed</Badge>;
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">{appointment.doctorName}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.doctorSpecialization}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-sm text-muted-foreground">
                  {formatAppointmentTime(appointment.appointmentTime)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between items-start md:items-end gap-4">
            <div>{getStatusBadge(appointment.status)}</div>

            <div className="flex gap-2">
              {(appointment.status === "CONFIRMED" ||
                appointment.status === "PENDING") && (
                <Dialog
                  open={showCancelDialog}
                  onOpenChange={setShowCancelDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Appointment</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel this appointment? This
                        action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          <p className="font-medium">Please note:</p>
                        </div>
                        <ul className="ml-6 mt-2 list-disc">
                          <li>Cancellations within 24 hours may incur a fee</li>
                          <li>You will need to book a new appointment if needed</li>
                        </ul>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowCancelDialog(false)}>
                        Keep Appointment
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancelAppointment}>
                        Cancel Appointment
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyAppointments = ({
  title,
  description,
  actionText,
  onAction,
}: {
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
}) => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center p-10 text-center">
      <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
      <CardTitle className="text-xl mb-2">{title}</CardTitle>
      <CardDescription className="mb-6">{description}</CardDescription>
      <Button onClick={onAction}>
        <Plus className="mr-2 h-4 w-4" />
        {actionText}
      </Button>
    </CardContent>
  </Card>
);

const AppointmentsSkeleton = () => (
  <div className="space-y-4">
    {[1, 2].map((i) => (
      <Card key={i}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex items-start gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
            <div className="flex flex-col justify-between items-start md:items-end gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default AppointmentsPage;

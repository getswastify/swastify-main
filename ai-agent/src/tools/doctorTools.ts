export async function getDoctors() {
  return [{ id: 'doc1', name: 'Dr. Sharma' }];
}

export async function getAvailableDates(docId: string, month: number, year: number) {
  return ['2025-06-01', '2025-06-02'];
}

export async function getTimeSlots(docId: string, date: string) {
  return ['10:00 AM', '11:30 AM'];
}

export async function bookAppointment(patientId: string, docId: string, date: string, time: string) {
  return { success: true, message: `Appointment booked with ${docId} on ${date} at ${time}` };
}

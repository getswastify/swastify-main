import {
  getDoctors,
  getAvailableDates,
  getTimeSlots,
  bookAppointment
} from '../tools/doctorTools';

export async function processInput(input: string) {
  if (input.toLowerCase().includes('doctor')) {
    const doctors = await getDoctors();
    return `Available doctors: ${doctors.map(d => d.name).join(', ')}`;
  }

  if (input.toLowerCase().includes('date')) {
    const dates = await getAvailableDates('doc1', 6, 2025);
    return `Available dates for Dr. Sharma: ${dates.join(', ')}`;
  }

  if (input.toLowerCase().includes('slots')) {
    const slots = await getTimeSlots('doc1', '2025-06-01');
    return `Available slots: ${slots.join(', ')}`;
  }

  if (input.toLowerCase().includes('book')) {
    const res = await bookAppointment('pat1', 'doc1', '2025-06-01', '10:00 AM');
    return res.message;
  }

  return "Sorry, I didn't understand that.";
}

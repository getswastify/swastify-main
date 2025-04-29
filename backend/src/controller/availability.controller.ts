import { Request, Response } from 'express';
import { prisma } from '../utils/prismaConnection';

export const getDoctorAvailability = async (req: Request, res: Response): Promise<any> => {
  try {
    const doctorId = req.user?.userId; // Assuming the doctorId comes from the authenticated user's session
    if (!doctorId) {
      return res.status(400).json({ error: 'Doctor ID is required.' });
    }

    // Fetch all availability slots for the given doctor
    const availability = await prisma.doctorAvailability.findMany({
      where: {
        doctorId,
      },
      orderBy: {
        startTime: 'asc', // Sort the availability slots by start time
      },
    });

    if (availability.length === 0) {
      return res.status(404).json({ error: 'No availability found for the doctor.' });
    }

    return res.status(200).json(availability);
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    return res.status(500).json({ error: 'Something went wrong while fetching availability.' });
  }
};

export const setDoctorAvailability = async (req: Request, res: Response): Promise<any> => {
  try {
    const doctorId = req.user?.userId;
    if (!doctorId) {
      return res.status(400).json({ error: 'Doctor ID is required.' });
    }
    
    const { dayOfWeek, timeSlots } = req.body;

    if (!dayOfWeek || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({ error: 'Invalid input. Please provide dayOfWeek and timeSlots.' });
    }

    const buildDateTimeFromTimeString = (dayOfWeek: string, timeStr: string): Date => {
      const now = new Date();
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDayIndex = now.getDay();
      const targetDayIndex = daysOfWeek.indexOf(dayOfWeek);

      if (targetDayIndex === -1) throw new Error('Invalid dayOfWeek');

      let diff = (targetDayIndex - currentDayIndex + 7) % 7;
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + diff);

      const [hours, minutes] = timeStr.split(':');
      targetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      return targetDate;
    };

    // Check if the doctor already has availability set for the given dayOfWeek
    const existingAvailability = await prisma.doctorAvailability.findMany({
      where: {
        doctorId,
        dayOfWeek,
      },
    });

    if (existingAvailability.length > 0) {
      return res.status(400).json({ error: 'Availability for this day already exists.' });
    }

    // If no existing availability, proceed to create new availability slots
    const availabilityData = timeSlots.map((slot: { startTime: string; endTime: string }) => {
      const startTime = buildDateTimeFromTimeString(dayOfWeek, slot.startTime);
      const endTime = buildDateTimeFromTimeString(dayOfWeek, slot.endTime);

      return {
        doctorId,
        dayOfWeek,
        startTime,
        endTime,
      };
    });

    // Bulk insert all availability slots
    await prisma.doctorAvailability.createMany({
      data: availabilityData,
    });

    return res.status(201).json({ message: 'Availability set successfully 🎯' });
  } catch (error) { 
    console.error('Error setting doctor availability:', error);
    return res.status(500).json({ error: 'Something went wrong while setting availability.' });
  }
};

export const updateDoctorAvailability = async (req: Request, res: Response): Promise<any> => {
  try {
    const doctorId = req.user?.userId;
    if (!doctorId) {
      return res.status(400).json({ error: 'Doctor ID is required.' });
    }

    const { dayOfWeek, timeSlots } = req.body;

    if (!dayOfWeek || !Array.isArray(timeSlots) || timeSlots.length === 0) {
      return res.status(400).json({ error: 'Invalid input. Please provide dayOfWeek and timeSlots.' });
    }

    // Check if the doctor already has availability set for the given dayOfWeek
    const existingAvailability = await prisma.doctorAvailability.findMany({
      where: {
        doctorId,
        dayOfWeek,
      },
    });

    // If no availability exists, prompt the doctor to create availability first
    if (existingAvailability.length === 0) {
      return res.status(400).json({ error: 'First create availability for this day before updating it.' });
    }

    const buildDateTimeFromTimeString = (dayOfWeek: string, timeStr: string): Date => {
      const now = new Date();
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDayIndex = now.getDay();
      const targetDayIndex = daysOfWeek.indexOf(dayOfWeek);

      if (targetDayIndex === -1) throw new Error('Invalid dayOfWeek');

      let diff = (targetDayIndex - currentDayIndex + 7) % 7;
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + diff);

      const [hours, minutes] = timeStr.split(':');
      targetDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      return targetDate;
    };

    // Prepare new availability slots data
    const availabilityData = timeSlots.map((slot: { startTime: string; endTime: string }) => {
      const startTime = buildDateTimeFromTimeString(dayOfWeek, slot.startTime);
      const endTime = buildDateTimeFromTimeString(dayOfWeek, slot.endTime);

      return {
        doctorId,
        dayOfWeek,
        startTime,
        endTime,
      };
    });

    // Optionally: Delete existing availability for that day before updating
    await prisma.doctorAvailability.deleteMany({
      where: {
        doctorId,
        dayOfWeek,
      },
    });

    // Insert updated availability slots
    await prisma.doctorAvailability.createMany({
      data: availabilityData,
    });

    return res.status(200).json({ message: 'Availability updated successfully 🎯' });
  } catch (error) {
    console.error('Error updating doctor availability:', error);
    return res.status(500).json({ error: 'Something went wrong while updating availability.' });
  }
};

export const deleteDoctorAvailability = async (req: Request, res: Response): Promise<any> => {
  try {
    const doctorId = req.user?.userId; // Assuming doctorId comes from authenticated user
    if (!doctorId) {
      return res.status(400).json({ error: 'Doctor ID is required.' });
    }

    const { availabilityId } = req.body; // Get the availability id from request body
    if (!availabilityId) {
      return res.status(400).json({ error: 'Availability ID is required.' });
    }

    // Check if the availability slot exists and belongs to the current doctor
    const availability = await prisma.doctorAvailability.findUnique({
      where: {
        id: availabilityId,
      },
    });

    if (!availability) {
      return res.status(404).json({ error: 'Availability slot not found.' });
    }

    if (availability.doctorId !== doctorId) {
      return res.status(403).json({ error: 'You are not authorized to delete this availability.' });
    }

    // Proceed to delete the availability slot
    await prisma.doctorAvailability.delete({
      where: {
        id: availabilityId,
      },
    });

    return res.status(200).json({ message: 'Availability slot deleted successfully.' });
  } catch (error) {
    console.error('Error deleting doctor availability:', error);
    return res.status(500).json({ error: 'Something went wrong while deleting availability.' });
  }
};

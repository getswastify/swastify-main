import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from './prismaConnection'; // adjust the import path if needed

export async function createGoogleMeetEvent(
  doctorId: string,
  startTime: string,
  endTime: string,
  doctorEmail: string,
  patientEmail: string
): Promise<string | null> {
  try {
    // Fetch from doctorProfile using doctorId
    const profile = await prisma.doctorProfile.findUnique({
      where: { userId: doctorId }, // Ensure 'id' is the unique field in your schema
    });

    if (
      !profile?.googleAccessToken ||
      !profile.googleRefreshToken ||
      !profile.tokenExpiry // Use tokenExpiry here
    ) {
      throw new Error('Google Calendar not connected for this doctor.');
    }

    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: profile.googleAccessToken,
      refresh_token: profile.googleRefreshToken,
      expiry_date: profile.tokenExpiry.getTime(), // Convert Date to timestamp
    });

    // Manually check if the token has expired
    const currentTime = new Date().getTime();
    const tokenExpiryTime = profile.tokenExpiry; // Use tokenExpiry here
    
    if (currentTime > tokenExpiryTime.getTime()) {
      // Token expired, refresh it
      const { credentials } = await oauth2Client.refreshAccessToken();
      await prisma.doctorProfile.update({
        where: { userId:doctorId },
        data: {
          googleAccessToken: credentials.access_token!,
          tokenExpiry: new Date(credentials.expiry_date!), // Update tokenExpiry here
        },
      });
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: 'Doctor Appointment',
      description: 'Google Meet appointment with your doctor',
      start: {
        dateTime: startTime,
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endTime,
        timeZone: 'Asia/Kolkata',
      },
      attendees: [
        { email: doctorEmail },
        { email: patientEmail },
      ],
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(2),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });

    return response.data.hangoutLink ?? null;
  } catch (error) {
    console.error('❌ Failed to create Google Meet:', error);
    return null;
  }
}

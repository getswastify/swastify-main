import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import path from 'path';
import fs from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

function loadOAuthClient(): OAuth2Client {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  const { client_id, client_secret, redirect_uris } = credentials.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

export async function createGoogleMeetEvent(
  startTime: string,
  endTime: string,
  doctorEmail: string,
  patientEmail: string
): Promise<string | null> {
  try {
    const auth = loadOAuthClient();
    const calendar = google.calendar({ version: 'v3', auth });

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
        {
          email: doctorEmail,
          optional: false,
        },
        {
          email: patientEmail,
          optional: false,
        },
      ],
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(2),
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },

      guestsCanModify: false,
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: true,
      anyoneCanAddSelf: false,
      // Automatically allow participants to join
      sendUpdates: 'all', // Send invites to all attendees
    };
    

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all', // Send invites to both attendees
    });

    return response.data.hangoutLink ?? null;
  } catch (error) {
    console.error('❌ Failed to create Google Meet:', error);
    return null;
  }
}

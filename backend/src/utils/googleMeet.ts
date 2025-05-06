import { google } from 'googleapis'; // <-- Correctly import the google APIs
import { OAuth2Client } from 'google-auth-library';
import path from 'path';
import fs from 'fs';
import readline from 'readline';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const credentialsPath = path.join(__dirname, 'credentials.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Load credentials from credentials.json file
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));

const { client_id, client_secret, redirect_uris } = credentials.installed;
const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

// Check if there's an existing token
fs.readFile(TOKEN_PATH, (err, token) => {
  if (err) {
    getNewToken(oAuth2Client); // Get new token if no existing token
  } else {
    oAuth2Client.setCredentials(JSON.parse(token.toString()));
    createGoogleMeetEvent(oAuth2Client);
  }
});

// Get new token after prompting for authorization
function getNewToken(oAuth2Client: OAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  rl.question('Enter the code from that page here: ', async (code) => {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens)); // Save the token for later use
    console.log('Token stored to', TOKEN_PATH);
    createGoogleMeetEvent(oAuth2Client);
  });
}

// Function to create a Google Meet event
async function createGoogleMeetEvent(auth: OAuth2Client) {
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: 'Google Meet Appointment',
    location: 'Online',
    description: 'Appointment with doctor',
    start: {
      dateTime: '2025-05-07T09:00:00-07:00', // Replace with actual start time
      timeZone: 'America/Los_Angeles', // Replace with correct time zone
    },
    end: {
      dateTime: '2025-05-07T09:30:00-07:00', // Replace with actual end time
      timeZone: 'America/Los_Angeles', // Replace with correct time zone
    },
    conferenceData: {
      createRequest: {
        requestId: 'sample123', // Random string for request ID
        conferenceSolutionKey: {
          type: 'hangoutsMeet',
        },
      },
    },
  };

  try {
    // Correct usage of calendar.events.insert with params
    const res = await calendar.events.insert({
      calendarId: 'primary', // Specify the calendar ID
      requestBody: event,     // Use requestBody instead of resource
      conferenceDataVersion: 1,
    });

    // Log the hangout link once the event is created
    if (res.data && res.data.hangoutLink) {
      console.log('Event created: %s', res.data.hangoutLink);
    }
  } catch (error) {
    console.error('Error creating Google Meet event:', error);
  }
}

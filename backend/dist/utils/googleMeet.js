"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoogleMeetEvent = void 0;
const googleapis_1 = require("googleapis");
const google_auth_library_1 = require("google-auth-library");
const prismaConnection_1 = require("./prismaConnection"); // adjust the import path if needed
function createGoogleMeetEvent(doctorId, startTime, endTime, doctorEmail, patientEmail) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Fetch from doctorProfile using doctorId
            const profile = yield prismaConnection_1.prisma.doctorProfile.findUnique({
                where: { userId: doctorId }, // Ensure 'id' is the unique field in your schema
            });
            if (!(profile === null || profile === void 0 ? void 0 : profile.googleAccessToken) ||
                !profile.googleRefreshToken ||
                !profile.tokenExpiry // Use tokenExpiry here
            ) {
                throw new Error('Google Calendar not connected for this doctor.');
            }
            const oauth2Client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
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
                const { credentials } = yield oauth2Client.refreshAccessToken();
                yield prismaConnection_1.prisma.doctorProfile.update({
                    where: { id: doctorId },
                    data: {
                        googleAccessToken: credentials.access_token,
                        tokenExpiry: new Date(credentials.expiry_date), // Update tokenExpiry here
                    },
                });
            }
            const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
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
            const response = yield calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
                conferenceDataVersion: 1,
                sendUpdates: 'all',
            });
            return (_a = response.data.hangoutLink) !== null && _a !== void 0 ? _a : null;
        }
        catch (error) {
            console.error('❌ Failed to create Google Meet:', error);
            return null;
        }
    });
}
exports.createGoogleMeetEvent = createGoogleMeetEvent;

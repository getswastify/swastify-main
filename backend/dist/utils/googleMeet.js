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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoogleMeetEvent = void 0;
const googleapis_1 = require("googleapis");
const google_auth_library_1 = require("google-auth-library");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path_1.default.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path_1.default.join(__dirname, 'credentials.json');
function loadOAuthClient() {
    const credentials = JSON.parse(fs_1.default.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    const { client_id, client_secret, redirect_uris } = credentials.installed;
    const oAuth2Client = new google_auth_library_1.OAuth2Client(client_id, client_secret, redirect_uris[0]);
    const token = JSON.parse(fs_1.default.readFileSync(TOKEN_PATH, 'utf-8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
}
function createGoogleMeetEvent(startTime, endTime, doctorEmail, patientEmail) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const auth = loadOAuthClient();
            const calendar = googleapis_1.google.calendar({ version: 'v3', auth });
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
                // 👇 Modify these to make it easier for everyone to join
                guestsCanModify: false,
                guestsCanInviteOthers: false,
                guestsCanSeeOtherGuests: true,
                anyoneCanAddSelf: false,
                // Automatically allow participants to join
                sendUpdates: 'all', // Send invites to all attendees
            };
            const response = yield calendar.events.insert({
                calendarId: 'primary',
                requestBody: event,
                conferenceDataVersion: 1,
                sendUpdates: 'all', // Send invites to both attendees
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

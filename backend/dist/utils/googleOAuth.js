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
exports.getTokens = exports.getAuthUrl = exports.oauth2Client = void 0;
const googleapis_1 = require("googleapis");
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/api/auth/google-calendar/callback';
exports.oauth2Client = new googleapis_1.google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
// Get auth URL
function getAuthUrl() {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    return exports.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent', // always ask again to get refresh_token
    });
}
exports.getAuthUrl = getAuthUrl;
// Exchange code for tokens
function getTokens(code) {
    return __awaiter(this, void 0, void 0, function* () {
        const { tokens } = yield exports.oauth2Client.getToken(code);
        return tokens;
    });
}
exports.getTokens = getTokens;

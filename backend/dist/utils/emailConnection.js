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
exports.sendResetPassEmail = exports.sendOtpEmail = void 0;
const communication_email_1 = require("@azure/communication-email");
const otpEmail_1 = require("../email-templates/otpEmail");
const resetPasswordTemplate_1 = require("../email-templates/resetPasswordTemplate");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.AZURE_COMMUNICATION_CONNECTION_STRING || '';
const senderEmail = 'donotreply@swastify.life';
const emailClient = new communication_email_1.EmailClient(connectionString);
const sendOtpEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const emailContent = {
        subject: 'Your OTP for Registration',
        html: (0, otpEmail_1.otpEmailTemplate)(otp),
    };
    const emailMessage = {
        senderAddress: senderEmail,
        content: emailContent,
        recipients: {
            to: [{ address: email, displayName: 'Swastify User' }],
        },
    };
    try {
        const poller = yield emailClient.beginSend(emailMessage);
        const operationState = poller.getOperationState();
        console.log('OTP email send initiated! Operation ID:', operationState.id);
    }
    catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Error sending OTP');
    }
});
exports.sendOtpEmail = sendOtpEmail;
const sendResetPassEmail = (email, resetLink) => __awaiter(void 0, void 0, void 0, function* () {
    const emailContent = {
        subject: 'Password Reset Request',
        html: (0, resetPasswordTemplate_1.resetPasswordTemplate)(resetLink),
    };
    const emailMessage = {
        senderAddress: senderEmail,
        content: emailContent,
        recipients: {
            to: [{ address: email, displayName: 'Swastify User' }],
        },
    };
    try {
        const poller = yield emailClient.beginSend(emailMessage);
        const operationState = poller.getOperationState();
        console.log('Password reset email send initiated! Operation ID:', operationState.id);
    }
    catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error('Error sending password reset email');
    }
});
exports.sendResetPassEmail = sendResetPassEmail;

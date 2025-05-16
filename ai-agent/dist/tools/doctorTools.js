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
exports.getDoctors = getDoctors;
exports.getAvailableDates = getAvailableDates;
exports.getTimeSlots = getTimeSlots;
exports.bookAppointment = bookAppointment;
function getDoctors() {
    return __awaiter(this, void 0, void 0, function* () {
        return [{ id: 'doc1', name: 'Dr. Sharma' }];
    });
}
function getAvailableDates(docId, month, year) {
    return __awaiter(this, void 0, void 0, function* () {
        return ['2025-06-01', '2025-06-02'];
    });
}
function getTimeSlots(docId, date) {
    return __awaiter(this, void 0, void 0, function* () {
        return ['10:00 AM', '11:30 AM'];
    });
}
function bookAppointment(patientId, docId, date, time) {
    return __awaiter(this, void 0, void 0, function* () {
        return { success: true, message: `Appointment booked with ${docId} on ${date} at ${time}` };
    });
}

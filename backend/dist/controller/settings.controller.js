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
exports.getDoctorSettings = void 0;
const prismaConnection_1 = require("../utils/prismaConnection");
const getDoctorSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const doctorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!doctorId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const doctorProfile = yield prismaConnection_1.prisma.doctorProfile.findUnique({
            where: { userId: doctorId },
            select: {
                googleAccessToken: true,
                googleRefreshToken: true,
                // add any other doctor settings here
            },
        });
        if (!doctorProfile) {
            return res.status(404).json({ message: "Doctor profile not found" });
        }
        const isCalendarConnected = !!doctorProfile.googleAccessToken && !!doctorProfile.googleRefreshToken;
        return res.status(200).json({
            success: true,
            data: {
                isCalendarConnected,
                // include other settings as needed
            },
        });
    }
    catch (err) {
        console.error("❌ Failed to fetch doctor settings:", err);
        return res.status(500).json({ message: "Something went wrong." });
    }
});
exports.getDoctorSettings = getDoctorSettings;

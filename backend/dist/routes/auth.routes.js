"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controller/auth.controller");
const multer_1 = __importDefault(require("multer"));
const requireAuthAndRole_1 = require("../middleware/requireAuthAndRole");
const router = (0, express_1.Router)();
// Setting up multer for file upload (using memoryStorage)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
});
router.post('/register', upload.single('profilePicture'), auth_controller_1.registerUser);
router.post('/register/doctor', auth_controller_1.registerDoctor);
router.post('/register/hospital', auth_controller_1.registerHospital);
router.patch('/update/profile-picture', (0, requireAuthAndRole_1.requireAuthAndRole)('USER'), upload.single("file"), auth_controller_1.updateProfilePicture);
router.post('/resend-otp', auth_controller_1.resendOtp);
router.post('/verify-otp', auth_controller_1.verifyOtpAndRegister);
router.get('/verify-auth', auth_controller_1.verifyTokenFromHeader);
router.post('/login', auth_controller_1.loginUser);
router.get('/getuser-details', auth_controller_1.getUserDetails);
router.post('/logout', auth_controller_1.logoutUser);
router.post('/request-password-reset', auth_controller_1.requestPasswordReset);
router.get("/verify-reset-token", auth_controller_1.verifyResetToken);
router.post("/reset-password", auth_controller_1.resetPassword);
exports.authRoutes = router;

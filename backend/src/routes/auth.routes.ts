import { Router } from 'express';
import {  getUserDetails, loginUser, logoutUser, registerDoctor, registerHospital, registerUser, requestPasswordReset, resendOtp, resetPassword, updateProfilePicture, verifyOtpAndRegister, verifyResetToken, verifyTokenFromHeader } from '../controller/auth.controller';
import multer from 'multer';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';

const router = Router();
// Setting up multer for file upload (using memoryStorage)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});


router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/register/doctor', registerDoctor);
router.post('/register/hospital', registerHospital);
router.patch('/update/profile-picture',requireAuthAndRole('USER'), upload.single("file"), updateProfilePicture);


router.post('/resend-otp', resendOtp);
router.post('/verify-otp', verifyOtpAndRegister);
router.get('/verify-auth', verifyTokenFromHeader);


router.post('/login', loginUser);
router.get('/getuser-details', getUserDetails);
router.post('/logout', logoutUser);

router.post('/request-password-reset', requestPasswordReset);
router.get("/verify-reset-token", verifyResetToken);
router.post("/reset-password", resetPassword);

export const authRoutes =  router;
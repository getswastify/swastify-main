import { Router } from 'express';
import {  getUserDetails, loginUser, logoutUser, registerDoctor, registerHospital, registerUser, requestPasswordReset, resetPassword, verifyOtpAndRegister, verifyResetToken, verifyTokenFromHeader } from '../controller/auth.controller';
import { verifyToken } from '../middleware/verifyToken';

const router = Router();

router.post('/register', registerUser);
router.post('/register/doctor', registerDoctor);
router.post('/register/hospital', registerHospital);


router.post('/verify-otp', verifyOtpAndRegister);
router.get('/verify-auth', verifyTokenFromHeader);


router.post('/login', loginUser);
router.get('/getuser-details', getUserDetails);
router.post('/logout', logoutUser);

router.post('/request-password-reset', requestPasswordReset);
router.get("/verify-reset-token", verifyResetToken);
router.post("/reset-password", resetPassword);

export const authRoutes =  router;
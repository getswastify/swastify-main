import { Router } from 'express';
import {  loginUser, registerDoctor, registerHospital, registerUser, requestPasswordReset, resetPassword, verifyOtpAndRegister, verifyResetToken } from '../controller/auth.controller';


const router = Router();

router.post('/register', registerUser);
router.post('/register/doctor', registerDoctor);
router.post('/register/hospital', registerHospital);


router.post('/verify-otp', verifyOtpAndRegister);

router.post('/login', loginUser);

router.post('/request-password-reset', requestPasswordReset);
router.get("/verify-reset-token", verifyResetToken);
router.post("/reset-password", resetPassword);

export const authRoutes =  router;
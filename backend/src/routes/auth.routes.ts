import { Router } from 'express';
import {  registerPatient, verifyOtpAndRegister } from '../controller/auth.controller';


const router = Router();

router.post('/register', registerPatient);
router.post('/verify-otp', verifyOtpAndRegister);

export const authRoutes =  router;

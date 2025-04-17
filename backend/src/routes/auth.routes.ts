import { Router } from 'express';
import {  registerDoctor, registerHospital, registerUser, verifyOtpAndRegister } from '../controller/auth.controller';


const router = Router();

router.post('/register', registerUser);
router.post('/register/doctor', registerDoctor);
router.post('/register/hospital', registerHospital);


router.post('/verify-otp', verifyOtpAndRegister);

export const authRoutes =  router;
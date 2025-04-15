import { Router } from 'express';
import {  registerPatient } from '../controller/auth.controller';


const router = Router();

router.post('/register', registerPatient);


export const authRoutes =  router;

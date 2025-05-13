import { Router } from 'express';

import { requireAuthAndRole } from '../middleware/requireAuthAndRole';
import { getDoctorDashboard, getHospitalDashboard, getPatientDashboard } from '../controller/dashboard.controller';


const router = Router();



router.get('/patient', requireAuthAndRole(['USER']), getPatientDashboard);
router.get('/doctor', requireAuthAndRole(['DOCTOR']), getDoctorDashboard);
router.get('/hospital', requireAuthAndRole(['HOSPITAL']), getHospitalDashboard);


export const dashboardRoutes =  router;
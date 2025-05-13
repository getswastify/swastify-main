import { Router } from 'express';
import { requireAuthAndRole } from '../middleware/requireAuthAndRole';
import {  deleteDoctorAvailability, getDoctorAvailability, setDoctorAvailability, updateDoctorAvailability} from '../controller/availability.controller';

const router = Router();

router.post('/doctor-availability',requireAuthAndRole(['DOCTOR']), setDoctorAvailability);
router.put('/doctor-availability',requireAuthAndRole(['DOCTOR']), updateDoctorAvailability);
router.get('/doctor-availability',requireAuthAndRole(['DOCTOR']), getDoctorAvailability);
router.delete('/doctor-availability',requireAuthAndRole(['DOCTOR']), deleteDoctorAvailability);

export const availabilityRoutes =  router;
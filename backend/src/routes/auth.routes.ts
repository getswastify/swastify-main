import { Router } from 'express';
import {
  registerPatient,
  registerDoctor,
  registerHospital,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerPatient);
router.post('/register/doctor', registerDoctor);
router.post('/register/hospital', registerHospital);

export default router;

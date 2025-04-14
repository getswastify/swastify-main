import { Request, Response } from 'express';
import * as AuthService from '../services/auth.service';

export const registerPatient = async (req: Request, res: Response) => {
  const result = await AuthService.registerPatient(req.body);
  res.status(result.status).json(result.data);
};

export const registerDoctor = async (req: Request, res: Response) => {
  const result = await AuthService.registerDoctor(req.body);
  res.status(result.status).json(result.data);
};

export const registerHospital = async (req: Request, res: Response) => {
  const result = await AuthService.registerHospital(req.body);
  res.status(result.status).json(result.data);
};

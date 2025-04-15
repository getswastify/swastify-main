import { Request, Response } from "express";

export const registerPatient = async (_req:Request , res:Response) => {
  res.json({
    message:"from the function registerPatient from controller"
  })
}
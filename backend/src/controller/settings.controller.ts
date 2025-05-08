import type { Request, Response } from "express"
import { prisma } from "../utils/prismaConnection"

export const getDoctorSettings = async (req: Request, res: Response):Promise<any> => {
    const doctorId = req.user?.userId
  
    if (!doctorId) {
      return res.status(401).json({ message: "Unauthorized" })
    }
  
    try {
      const doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: doctorId },
        select: {
          googleAccessToken: true,
          googleRefreshToken: true,
          // add any other doctor settings here
        },
      })
  
      if (!doctorProfile) {
        return res.status(404).json({ message: "Doctor profile not found" })
      }
  
      const isCalendarConnected =
        !!doctorProfile.googleAccessToken && !!doctorProfile.googleRefreshToken
  
      return res.status(200).json({
        success: true,
        data: {
          isCalendarConnected,
          // include other settings as needed
        },
      })
    } catch (err) {
      console.error("❌ Failed to fetch doctor settings:", err)
      return res.status(500).json({ message: "Something went wrong." })
    }
  }
  
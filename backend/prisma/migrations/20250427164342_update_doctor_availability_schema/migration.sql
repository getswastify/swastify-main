/*
  Warnings:

  - You are about to drop the column `endTime` on the `DoctorAvailability` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `DoctorAvailability` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DoctorAvailability" DROP COLUMN "endTime",
DROP COLUMN "startTime";

-- DropEnum
DROP TYPE "DayOfWeek";

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" TEXT NOT NULL,
    "doctorAvailabilityId" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_doctorAvailabilityId_fkey" FOREIGN KEY ("doctorAvailabilityId") REFERENCES "DoctorAvailability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

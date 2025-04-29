/*
  Warnings:

  - You are about to drop the column `createdAt` on the `DoctorAvailability` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `DoctorAvailability` table. All the data in the column will be lost.
  - You are about to drop the `Appointment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TimeSlot` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `endTime` to the `DoctorAvailability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `DoctorAvailability` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_patientId_fkey";

-- DropForeignKey
ALTER TABLE "DoctorAvailability" DROP CONSTRAINT "DoctorAvailability_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "TimeSlot" DROP CONSTRAINT "TimeSlot_doctorAvailabilityId_fkey";

-- AlterTable
ALTER TABLE "DoctorAvailability" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "dayOfWeek" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Appointment";

-- DropTable
DROP TABLE "TimeSlot";

-- DropEnum
DROP TYPE "AppointmentStatus";

-- AddForeignKey
ALTER TABLE "DoctorAvailability" ADD CONSTRAINT "DoctorAvailability_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

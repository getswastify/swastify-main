/*
  Warnings:

  - Added the required column `address` to the `PatientProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bloodGroup` to the `PatientProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `PatientProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `PatientProfile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- AlterTable
ALTER TABLE "PatientProfile" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "allergies" TEXT,
ADD COLUMN     "bloodGroup" "BloodGroup" NOT NULL,
ADD COLUMN     "diseases" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL;

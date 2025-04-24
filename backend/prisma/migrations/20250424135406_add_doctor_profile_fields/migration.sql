/*
  Warnings:

  - The primary key for the `DoctorProfile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `availableFrom` on the `DoctorProfile` table. All the data in the column will be lost.
  - You are about to drop the column `availableTo` on the `DoctorProfile` table. All the data in the column will be lost.
  - You are about to alter the column `consultationFee` on the `DoctorProfile` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - A unique constraint covering the columns `[userId]` on the table `DoctorProfile` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `DoctorProfile` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `licenseNumber` to the `DoctorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startedPracticeOn` to the `DoctorProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DoctorProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DoctorProfile" DROP CONSTRAINT "DoctorProfile_pkey",
DROP COLUMN "availableFrom",
DROP COLUMN "availableTo",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "licenseDocumentUrl" TEXT,
ADD COLUMN     "licenseIssuedBy" TEXT,
ADD COLUMN     "licenseNumber" TEXT NOT NULL,
ADD COLUMN     "startedPracticeOn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "consultationFee" SET DATA TYPE INTEGER,
ADD CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON "DoctorProfile"("userId");

/*
  Warnings:

  - The `allergies` column on the `PatientProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `diseases` column on the `PatientProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PatientProfile" DROP COLUMN "allergies",
ADD COLUMN     "allergies" TEXT[],
DROP COLUMN "diseases",
ADD COLUMN     "diseases" TEXT[];

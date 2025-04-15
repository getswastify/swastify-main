-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'DOCTOR', 'HOSPITAL', 'ADMIN');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'STAFF_ADMIN', 'SUPPORT_ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientProfile" (
    "userId" TEXT NOT NULL,

    CONSTRAINT "PatientProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "DoctorProfile" (
    "userId" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "clinicAddress" TEXT NOT NULL,
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "availableTo" TIMESTAMP(3) NOT NULL,
    "consultationFee" DOUBLE PRECISION NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "DoctorProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "HospitalProfile" (
    "userId" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "services" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "HospitalProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "AdminProfile" (
    "userId" TEXT NOT NULL,
    "level" "AdminRole" NOT NULL DEFAULT 'SUPER_ADMIN',

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "PatientProfile" ADD CONSTRAINT "PatientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorProfile" ADD CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HospitalProfile" ADD CONSTRAINT "HospitalProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProfile" ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

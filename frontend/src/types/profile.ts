export interface ProfileResponse<T> {
  status: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    issue: string | Array<{ path: string; message: string }>;
  };
}

// Patient Profile Types
export interface PatientProfileData {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePicture?: string;
  };
  id?: string;
  userId?: string;
  bloodGroup: string;
  address: string;
  height: number;
  weight: number;
  allergies: string[];
  diseases: string[];
  isProfileComplete?: boolean;
}

export type PatientProfileResponse = ProfileResponse<PatientProfileData>;

// Doctor Profile Types
// Update the DoctorProfileData interface to remove availableFrom and availableTo
export interface DoctorProfileData {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePicture?: string;
  };
  id?: string;
  userId?: string;
  specialization: string;
  clinicAddress: string;
  consultationFee: number;
  startedPracticeOn: string;
  licenseNumber: string;
  licenseIssuedBy: string;
  licenseDocumentUrl: string;
  isProfileComplete?: boolean;
  isVerified?: "PENDING" | "APPROVED" | "REJECTED";
}

export type DoctorProfileResponse = ProfileResponse<DoctorProfileData>;

// Hospital Profile Types
export interface HospitalProfileData {
  id?: string;
  userId?: string;
  hospitalName: string;
  location: string;
  services: string;
  isProfileComplete?: boolean;
  isVerified?: "PENDING" | "APPROVED" | "REJECTED";
}

export type HospitalProfileResponse = ProfileResponse<HospitalProfileData>;

// Blood Group Options
export const BLOOD_GROUPS = [
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];

// Specialization Options (example)
export const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Urology",
] as const;

export type Specialization = (typeof SPECIALIZATIONS)[number];

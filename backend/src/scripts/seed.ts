import { PrismaClient, UserRole, ApprovalStatus, BloodGroup } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const password = 'Test@123'; // Dummy password
const SALT_ROUNDS = 10;

async function hashPassword(password: string) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Random helper functions
function getRandomGender() {
  const genders = ['Male', 'Female', 'Other'];
  return genders[Math.floor(Math.random() * genders.length)];
}

function getRandomDOB() {
  const start = new Date(1950, 0, 1);
  const end = new Date(2005, 0, 1);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomBloodGroup() {
  const groups = Object.values(BloodGroup);
  return groups[Math.floor(Math.random() * groups.length)];
}

function generateRandomPhone() {
  return '9' + Math.floor(100000000 + Math.random() * 900000000).toString();
}

function generateRandomEmail(firstName: string, lastName: string) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@example.com`;
}

function randomFirstName() {
  const names = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'David', 'Eva', 'Frank', 'Grace', 'Hannah'];
  return names[Math.floor(Math.random() * names.length)];
}

function randomLastName() {
  const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];
  return names[Math.floor(Math.random() * names.length)];
}

async function createPatient() {
  const firstName = randomFirstName();
  const lastName = randomLastName();
  const email = generateRandomEmail(firstName, lastName);
  const phone = generateRandomPhone();
  const dob = getRandomDOB();
  const gender = getRandomGender();
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      password: hashedPassword,
      firstName,
      lastName,
      dob,
      gender,
      role: UserRole.USER,
      patientProfile: {
        create: {
          bloodGroup: getRandomBloodGroup(),
          address: '123, Dummy Street, City',
          height: Math.random() * (200 - 150) + 150, // 150cm to 200cm
          weight: Math.random() * (100 - 50) + 50,  // 50kg to 100kg
          allergies: ['Pollen', 'Dust'],
          diseases: ['Diabetes', 'Hypertension'],
        }
      }
    }
  });

  console.log(`Created Patient: ${user.email}`);
}

async function createDoctor(status: ApprovalStatus) {
  const firstName = randomFirstName();
  const lastName = randomLastName();
  const email = generateRandomEmail(firstName, lastName);
  const phone = generateRandomPhone();
  const dob = getRandomDOB();
  const gender = getRandomGender();
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      password: hashedPassword,
      firstName,
      lastName,
      dob,
      gender,
      role: UserRole.DOCTOR,
      doctorProfile: {
        create: {
          specialization: 'General Physician',
          clinicAddress: '456, Health Street, City',
          consultationFee: Math.floor(Math.random() * (1000 - 300) + 300), // 300 to 1000
          status,
          startedPracticeOn: new Date(2010, 0, 1),
          licenseNumber: 'LIC' + Math.floor(Math.random() * 1000000),
          licenseIssuedBy: 'Medical Council',
          licenseDocumentUrl: null,
        }
      }
    }
  });

  console.log(`Created Doctor (${status}): ${user.email}`);
}

async function createHospital(status: ApprovalStatus) {
  const firstName = randomFirstName();
  const lastName = randomLastName();
  const email = generateRandomEmail(firstName, lastName);
  const phone = generateRandomPhone();
  const dob = getRandomDOB();
  const gender = getRandomGender();
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      password: hashedPassword,
      firstName,
      lastName,
      dob,
      gender,
      role: UserRole.HOSPITAL,
      hospitalProfile: {
        create: {
          hospitalName: `${firstName} ${lastName} Hospital`,
          location: '789, Care Avenue, City',
          services: 'Emergency, Surgery, Pediatrics',
          status,
        }
      }
    }
  });

  console.log(`Created Hospital (${status}): ${user.email}`);
}

async function main() {
  console.log('Starting Seeding Script...');

  // Create Patients
  for (let i = 0; i < 15; i++) {
    await createPatient();
  }

  // Create Doctors
  for (let i = 0; i < 15; i++) {
    await createDoctor(ApprovalStatus.PENDING);
  }
  for (let i = 0; i < 15; i++) {
    await createDoctor(ApprovalStatus.APPROVED);
  }
  for (let i = 0; i < 15; i++) {
    await createDoctor(ApprovalStatus.REJECTED);
  }

  // Create Hospitals
  for (let i = 0; i < 15; i++) {
    await createHospital(ApprovalStatus.PENDING);
  }
  for (let i = 0; i < 15; i++) {
    await createHospital(ApprovalStatus.APPROVED);
  }
  for (let i = 0; i < 15; i++) {
    await createHospital(ApprovalStatus.REJECTED);
  }

  console.log('Seeding Complete.');
}

main()
  .catch((e) => {
    console.error('Error in seeding', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

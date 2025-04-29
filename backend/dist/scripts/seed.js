"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const password = 'Test@123'; // Dummy password
const SALT_ROUNDS = 10;
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.hash(password, SALT_ROUNDS);
    });
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
    const groups = Object.values(client_1.BloodGroup);
    return groups[Math.floor(Math.random() * groups.length)];
}
function generateRandomPhone() {
    return '9' + Math.floor(100000000 + Math.random() * 900000000).toString();
}
function generateRandomEmail(firstName, lastName) {
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
function createPatient() {
    return __awaiter(this, void 0, void 0, function* () {
        const firstName = randomFirstName();
        const lastName = randomLastName();
        const email = generateRandomEmail(firstName, lastName);
        const phone = generateRandomPhone();
        const dob = getRandomDOB();
        const gender = getRandomGender();
        const hashedPassword = yield hashPassword(password);
        const user = yield prisma.user.create({
            data: {
                email,
                phone,
                password: hashedPassword,
                firstName,
                lastName,
                dob,
                gender,
                role: client_1.UserRole.USER,
                patientProfile: {
                    create: {
                        bloodGroup: getRandomBloodGroup(),
                        address: '123, Dummy Street, City',
                        height: Math.random() * (200 - 150) + 150,
                        weight: Math.random() * (100 - 50) + 50,
                        allergies: ['Pollen', 'Dust'],
                        diseases: ['Diabetes', 'Hypertension'],
                    }
                }
            }
        });
        console.log(`Created Patient: ${user.email}`);
    });
}
function createDoctor(status) {
    return __awaiter(this, void 0, void 0, function* () {
        const firstName = randomFirstName();
        const lastName = randomLastName();
        const email = generateRandomEmail(firstName, lastName);
        const phone = generateRandomPhone();
        const dob = getRandomDOB();
        const gender = getRandomGender();
        const hashedPassword = yield hashPassword(password);
        const user = yield prisma.user.create({
            data: {
                email,
                phone,
                password: hashedPassword,
                firstName,
                lastName,
                dob,
                gender,
                role: client_1.UserRole.DOCTOR,
                doctorProfile: {
                    create: {
                        specialization: 'General Physician',
                        clinicAddress: '456, Health Street, City',
                        consultationFee: Math.floor(Math.random() * (1000 - 300) + 300),
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
    });
}
function createHospital(status) {
    return __awaiter(this, void 0, void 0, function* () {
        const firstName = randomFirstName();
        const lastName = randomLastName();
        const email = generateRandomEmail(firstName, lastName);
        const phone = generateRandomPhone();
        const dob = getRandomDOB();
        const gender = getRandomGender();
        const hashedPassword = yield hashPassword(password);
        const user = yield prisma.user.create({
            data: {
                email,
                phone,
                password: hashedPassword,
                firstName,
                lastName,
                dob,
                gender,
                role: client_1.UserRole.HOSPITAL,
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
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting Seeding Script...');
        // Create Patients
        for (let i = 0; i < 15; i++) {
            yield createPatient();
        }
        // Create Doctors
        for (let i = 0; i < 15; i++) {
            yield createDoctor(client_1.ApprovalStatus.PENDING);
        }
        for (let i = 0; i < 15; i++) {
            yield createDoctor(client_1.ApprovalStatus.APPROVED);
        }
        for (let i = 0; i < 15; i++) {
            yield createDoctor(client_1.ApprovalStatus.REJECTED);
        }
        // Create Hospitals
        for (let i = 0; i < 15; i++) {
            yield createHospital(client_1.ApprovalStatus.PENDING);
        }
        for (let i = 0; i < 15; i++) {
            yield createHospital(client_1.ApprovalStatus.APPROVED);
        }
        for (let i = 0; i < 15; i++) {
            yield createHospital(client_1.ApprovalStatus.REJECTED);
        }
        console.log('Seeding Complete.');
    });
}
main()
    .catch((e) => {
    console.error('Error in seeding', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));

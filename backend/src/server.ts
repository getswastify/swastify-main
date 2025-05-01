import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes';
import morgan from  'morgan'
import cookieParser from "cookie-parser";
import { profileRoutes } from './routes/profile.route';
import { dashboardRoutes } from './routes/dashboard.route';
import { availabilityRoutes } from './routes/availability.route';
import { patientAppointmentRoutes } from './routes/patient-appointment.route';
import { doctorAppointmentRoutes } from './routes/doctor-appointment.route';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
app.use(morgan('dev'));
app.use(cookieParser());

// CORS setup
app.use(cors({
  origin: ['http://localhost:3000','https://app.swastify.life'], 
  credentials: true 
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Running",
    IP: req.ip
  });
});

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/patient", patientAppointmentRoutes);
app.use("/availability", availabilityRoutes);
app.use("/doctor", doctorAppointmentRoutes);



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

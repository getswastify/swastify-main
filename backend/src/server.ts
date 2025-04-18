import express, { NextFunction, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes';
import morgan from  'morgan'

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
app.use(morgan('combined'));

// CORS setup
app.use(cors({
  origin: ['http://localhost:3000','https://app.swastify.life/'], 
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup
app.use(cors({
  origin: 'http://localhost:3000', // 👈 allow frontend running at this origin
  credentials: true // if you're using cookies or auth headers
}));

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Running"
  });
});

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express from 'express';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth.routes';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (_req, res)=> {
  res.json({
    message:"Running"
  })
})

app.use("/auth", authRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

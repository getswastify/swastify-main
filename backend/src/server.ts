import express from 'express';
import {pingRoutes} from './routes/ping';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/ping', pingRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

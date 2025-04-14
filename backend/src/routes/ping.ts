import { Router } from 'express';
const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: "success",
    message: "pong"
  })
});

export const pingRoutes =  router;

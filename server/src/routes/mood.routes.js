import { Router } from "express";
import {
  addMoodLog,
  getMoodHistory,
  getMoodAnalytics,
} from "../controllers/mood.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { moodLogSchema } from "../utils/validators.js";

const router = Router();

router.post("/log", authMiddleware, validate(moodLogSchema), addMoodLog);
router.get("/history", authMiddleware, getMoodHistory);
router.get("/analytics", authMiddleware, getMoodAnalytics);

export default router;

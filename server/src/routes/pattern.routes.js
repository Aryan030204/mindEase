import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import {
  getMoodForecast,
  getPatternSummary,
  refreshPatterns,
} from "../controllers/pattern.controller.js";

const router = Router();

router.get("/", authMiddleware, getPatternSummary);
router.post("/refresh", authMiddleware, refreshPatterns);
router.get("/forecast", authMiddleware, getMoodForecast);

export default router;

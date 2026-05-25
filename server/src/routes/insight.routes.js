import express from "express";
import {
  getInsightsProfile,
  getPatterns,
  getForecast,
  getCollectiveSummary,
} from "../controllers/insight.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, getInsightsProfile);
router.get("/patterns", authMiddleware, getPatterns);
router.get("/forecast", authMiddleware, getForecast);
router.get("/collective-summary", authMiddleware, getCollectiveSummary);

export default router;

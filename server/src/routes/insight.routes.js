import express from "express";
import { getInsightsProfile, getPatterns, getForecast } from "../controllers/insight.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, getInsightsProfile);
router.get("/patterns", authMiddleware, getPatterns);
router.get("/forecast", authMiddleware, getForecast);

export default router;

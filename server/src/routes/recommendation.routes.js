import { Router } from "express";
import {
  getPersonalizedRecommendations,
  getGeneralWellness,
} from "../controllers/recommendation.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/personalized", authMiddleware, getPersonalizedRecommendations);
router.get("/general", getGeneralWellness);

export default router;

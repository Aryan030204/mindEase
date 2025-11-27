import { Router } from "express";
import {
  getPersonalizedRecommendations,
  getGeneralWellness,
  updateRecommendationStatus,
} from "../controllers/recommendation.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { updateRecommendationStatusSchema } from "../utils/validators.js";

const router = Router();

router.get("/personalized", authMiddleware, getPersonalizedRecommendations);
router.get("/general", getGeneralWellness);
router.patch("/:recommendationId/status", authMiddleware, validate(updateRecommendationStatusSchema), updateRecommendationStatus);

export default router;

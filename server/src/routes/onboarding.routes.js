import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  start,
  answer,
  next,
  complete,
  profile,
  createQuestionHandler,
  updateQuestionHandler,
  listQuestionsHandler,
} from "../controllers/onboarding.controller.js";
import {
  onboardingQuestionSchema,
  onboardingQuestionUpdateSchema,
  onboardingAnswerSchema,
  onboardingCompleteSchema,
} from "../utils/validators.js";

const router = Router();

router.get("/start", authMiddleware, start);
router.post("/answer", authMiddleware, validate(onboardingAnswerSchema), answer);
router.get("/next", authMiddleware, next);
router.post(
  "/complete",
  authMiddleware,
  validate(onboardingCompleteSchema),
  complete
);
router.get("/profile", authMiddleware, profile);

router.get(
  "/questions",
  authMiddleware,
  roleMiddleware("admin"),
  listQuestionsHandler
);
router.post(
  "/questions",
  authMiddleware,
  roleMiddleware("admin"),
  validate(onboardingQuestionSchema),
  createQuestionHandler
);
router.put(
  "/questions/:id",
  authMiddleware,
  roleMiddleware("admin"),
  validate(onboardingQuestionUpdateSchema),
  updateQuestionHandler
);

export default router;

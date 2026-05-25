import { Router } from "express";
import {
  sendChatQuery,
  getChatHistory,
} from "../controllers/chat.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import { chatbotRateLimit } from "../middlewares/rateLimit.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { chatContextSchema } from "../utils/validators.js";

const router = Router();

router.post(
  "/query",
  authMiddleware,
  chatbotRateLimit(),
  validate(chatContextSchema),
  sendChatQuery
);
router.get("/history", authMiddleware, getChatHistory);

export default router;

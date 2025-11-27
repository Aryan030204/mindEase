import { Router } from "express";
import {
  sendChatQuery,
  getChatHistory,
} from "../controllers/chat.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { chatMessageSchema } from "../utils/validators.js";

const router = Router();

router.post(
  "/query",
  authMiddleware,
  validate(chatMessageSchema),
  sendChatQuery
);
router.get("/history", authMiddleware, getChatHistory);

export default router;

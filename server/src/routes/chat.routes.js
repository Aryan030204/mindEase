import { Router } from "express";
import {
  sendChatQuery,
  getChatHistory,
} from "../controllers/chat.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/query", authMiddleware, sendChatQuery);
router.get("/history", authMiddleware, getChatHistory);

export default router;

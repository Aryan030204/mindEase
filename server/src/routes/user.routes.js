import { Router } from "express";
import {
  getProfile,
  updateProfile,
  deleteAccount,
} from "../controllers/user.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { updateProfileSchema } from "../utils/validators.js";

const router = Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, validate(updateProfileSchema), updateProfile);
router.delete("/profile", authMiddleware, deleteAccount);

export default router;

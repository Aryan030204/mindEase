import { Router } from "express";
import {
  getAllResources,
  getResourcesByCategory,
  addResource,
} from "../controllers/resource.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import { resourceAddSchema } from "../utils/validators.js";

const router = Router();

// PUBLIC - Must be before /:category to avoid route conflicts
router.get("/all", getAllResources);
router.get("/:category", getResourcesByCategory);

// ADMIN ONLY
router.post("/add", authMiddleware, roleMiddleware("admin"), validate(resourceAddSchema), addResource);

export default router;

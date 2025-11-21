import { Router } from "express";
import {
  getAllResources,
  getResourcesByCategory,
  addResource,
} from "../controllers/resource.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = Router();

// PUBLIC
router.get("/all", getAllResources);
router.get("/:category", getResourcesByCategory);

// ADMIN ONLY
router.post("/add", authMiddleware, roleMiddleware("admin"), addResource);

export default router;

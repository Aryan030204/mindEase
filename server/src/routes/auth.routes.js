import { Router } from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import { signupSchema, loginSchema } from "../utils/validators.js";

const router = Router();

// AUTH ROUTES
router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);

export default router;

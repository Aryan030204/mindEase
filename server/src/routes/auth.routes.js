import { Router } from "express";
import {
	signup,
	login,
	logout,
	sendPasswordResetCode,
	resetPasswordWithCode,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
	signupSchema,
	loginSchema,
	forgotPasswordRequestSchema,
	forgotPasswordResetSchema,
} from "../utils/validators.js";

const router = Router();

// AUTH ROUTES
router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post(
	"/forgot-password/send-code",
	validate(forgotPasswordRequestSchema),
	sendPasswordResetCode
);
router.post(
	"/forgot-password/reset",
	validate(forgotPasswordResetSchema),
	resetPasswordWithCode
);

export default router;

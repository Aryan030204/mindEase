import User from "../models/User.model.js";
import { hashPassword, comparePassword } from "../services/password.service.js";
import { generateToken } from "../services/jwt.service.js";
import { sendPasswordResetOtpEmail } from "../services/email.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import crypto from "crypto";

const OTP_EXPIRY_MINUTES = 5;
const OTP_WINDOW_MS = OTP_EXPIRY_MINUTES * 60 * 1000;

const buildOtpHash = (userId, otp) => {
  const otpSecret = process.env.OTP_SECRET || process.env.JWT_SECRET || "mindease-otp-secret";
  return crypto
    .createHash("sha256")
    .update(`${userId}:${otp}:${otpSecret}`)
    .digest("hex");
};

const generateSixDigitOtp = () => String(crypto.randomInt(100000, 1000000));

// ----------------------
// Signup
// ----------------------
export const signup = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Check MongoDB connection
  const mongoose = (await import("mongoose")).default;
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database not connected. Please try again in a moment.",
    });
  }

  // Check if user exists
  const existing = await User.findOne({ email }).maxTimeMS(5000);
  if (existing) {
    return res.status(400).json({ message: "Email already registered" });
  }

  // Hash password
  const hashed = await hashPassword(password);

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashed,
  });

  // Generate token
  const token = generateToken(user._id);

  return res.status(201).json({
    message: "Signup successful",
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
});

// ----------------------
// Login
// ----------------------
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check MongoDB connection
  const mongoose = (await import("mongoose")).default;
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database not connected. Please try again in a moment.",
    });
  }

  // Select +password explicitly
  const user = await User.findOne({ email })
    .select("+password")
    .maxTimeMS(5000);

  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const match = await comparePassword(password, user.password);
  if (!match) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = generateToken(user._id);

  return res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
});

// ----------------------
// Logout (Client can just delete token)
// ----------------------
export const logout = asyncHandler(async (req, res) => {
  return res.status(200).json({ message: "Logged out successfully" });
});

// ----------------------
// Send password reset OTP
// ----------------------
export const sendPasswordResetCode = asyncHandler(async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const user = await User.findOne({ email })
    .select("+passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpAvailableAt")
    .maxTimeMS(5000);

  if (!user) {
    return res.status(404).json({ message: "No account found for this email" });
  }

  const now = new Date();
  if (user.passwordResetOtpAvailableAt && user.passwordResetOtpAvailableAt > now) {
    const retryAfterSeconds = Math.ceil(
      (user.passwordResetOtpAvailableAt.getTime() - now.getTime()) / 1000
    );

    return res.status(429).json({
      message: "You can request a new code after the cooldown ends",
      retryAfterSeconds,
    });
  }

  const otp = generateSixDigitOtp();
  const otpHash = buildOtpHash(user._id, otp);
  const otpExpiresAt = new Date(now.getTime() + OTP_WINDOW_MS);

  user.passwordResetOtpHash = otpHash;
  user.passwordResetOtpExpiresAt = otpExpiresAt;
  user.passwordResetOtpAvailableAt = otpExpiresAt;
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetOtpEmail({
      to: user.email,
      firstName: user.firstName,
      otp,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (error) {
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpiresAt = undefined;
    user.passwordResetOtpAvailableAt = undefined;
    await user.save({ validateBeforeSave: false });
    throw error;
  }

  return res.status(200).json({
    message: "Recovery code sent to your email",
    expiresInSeconds: OTP_WINDOW_MS / 1000,
    retryAfterSeconds: OTP_WINDOW_MS / 1000,
  });
});

// ----------------------
// Reset password using OTP
// ----------------------
export const resetPasswordWithCode = asyncHandler(async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const otp = req.body.otp.trim();
  const { newPassword } = req.body;

  const user = await User.findOne({ email })
    .select("+password +passwordResetOtpHash +passwordResetOtpExpiresAt +passwordResetOtpAvailableAt")
    .maxTimeMS(5000);

  if (!user) {
    return res.status(404).json({ message: "No account found for this email" });
  }

  if (!user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
    return res.status(400).json({ message: "Please request a new recovery code" });
  }

  const now = new Date();
  if (user.passwordResetOtpExpiresAt <= now) {
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(400).json({ message: "Code expired. Please request a new recovery code" });
  }

  const submittedOtpHash = buildOtpHash(user._id, otp);
  if (submittedOtpHash !== user.passwordResetOtpHash) {
    return res.status(400).json({ message: "Invalid recovery code" });
  }

  user.password = await hashPassword(newPassword);
  user.passwordResetOtpHash = undefined;
  user.passwordResetOtpExpiresAt = undefined;
  user.passwordResetOtpAvailableAt = undefined;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json({ message: "Password reset successful. Please login with your new password" });
});

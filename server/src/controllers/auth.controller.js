import User from "../models/User.model.js";
import { hashPassword, comparePassword } from "../services/password.service.js";
import { generateToken } from "../services/jwt.service.js";
import asyncHandler from "../utils/asyncHandler.js";

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

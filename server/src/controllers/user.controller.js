import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { hashPassword } from "../services/password.service.js";

// ----------------------
// Get Profile
// ----------------------
export const getProfile = asyncHandler(async (req, res) => {
  const mongoose = (await import("mongoose")).default;
  const userId = mongoose.Types.ObjectId.isValid(req.user.id)
    ? new mongoose.Types.ObjectId(req.user.id)
    : req.user.id;

  const user = await User.findById(userId).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({ user });
});

// ----------------------
// Update Profile
// ----------------------
export const updateProfile = asyncHandler(async (req, res) => {
  const mongoose = (await import("mongoose")).default;
  const userId = mongoose.Types.ObjectId.isValid(req.user.id)
    ? new mongoose.Types.ObjectId(req.user.id)
    : req.user.id;

  const allowedUpdates = ["firstName", "lastName", "preferences", "password"];
  const updates = {};

  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // If password is being updated → hash it
  if (updates.password) {
    updates.password = await hashPassword(updates.password);
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-password");

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
});

// ----------------------
// Delete Account
// ----------------------
export const deleteAccount = asyncHandler(async (req, res) => {
  const mongoose = (await import("mongoose")).default;
  const userId = mongoose.Types.ObjectId.isValid(req.user.id)
    ? new mongoose.Types.ObjectId(req.user.id)
    : req.user.id;

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // TODO: Optionally delete related data (mood logs, conversations, etc.)
  // This could be handled with MongoDB cascading deletes or manual cleanup

  return res.status(200).json({
    message: "Account deleted successfully",
  });
});

import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { hashPassword } from "../services/password.service.js";

// ----------------------
// Get Profile
// ----------------------
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({ user });
});

// ----------------------
// Update Profile
// ----------------------
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedUpdates = ["firstName", "lastName", "preferences", "pas];
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
    req.user.id,
    { $set: updates },
    { new: true, runValidators: true }
  ).select("-password");

  return res.status(200).json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
});

// ----------------------
// Delete Account
// ----------------------
export const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user.id);

  return res.status(200).json({
    message: "Account deleted successfully",
  });
});

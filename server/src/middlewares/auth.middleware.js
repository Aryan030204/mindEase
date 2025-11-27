import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  // Token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  // Convert to ObjectId if needed
  const userId = mongoose.Types.ObjectId.isValid(decoded.id)
    ? new mongoose.Types.ObjectId(decoded.id)
    : decoded.id;

  // Attach user to req
  const user = await User.findById(userId).select("-password");

  if (!user) {
    return res.status(401).json({ message: "User no longer exists" });
  }

  req.user = user;
  req.user.id = user._id.toString(); // Ensure id is available as string

  next();
});

export default authMiddleware;

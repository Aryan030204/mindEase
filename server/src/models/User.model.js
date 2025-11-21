import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email format",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // never return password in queries
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    preferences: {
      exercise: { type: Boolean, default: true },
      music: { type: Boolean, default: true },
      meditation: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Index for email lookups
userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);
export default User;

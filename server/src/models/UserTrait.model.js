import mongoose from "mongoose";

const userTraitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    traits: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    confidenceScores: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    onboardingVersion: {
      type: Number,
      default: 0,
    },
    needsOnboardingUpgrade: {
      type: Boolean,
      default: false,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserTrait", userTraitSchema);

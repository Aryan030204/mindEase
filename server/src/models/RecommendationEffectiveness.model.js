import mongoose from "mongoose";

const recommendationEffectivenessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      required: true,
      trim: true,
    },
    totalShown: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAccepted: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalIgnored: {
      type: Number,
      default: 0,
      min: 0,
    },
    effectivenessWeight: {
      type: Number,
      default: 1,
      min: 0.2,
      max: 3,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

recommendationEffectivenessSchema.index(
  { userId: 1, activityType: 1 },
  { unique: true }
);

export default mongoose.model(
  "RecommendationEffectiveness",
  recommendationEffectivenessSchema
);

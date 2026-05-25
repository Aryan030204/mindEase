import mongoose from "mongoose";

const recommendationGlobalWeightSchema = new mongoose.Schema(
  {
    targetKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    activityType: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    targetTraits: {
      type: [String],
      default: [],
    },
    targetPatterns: {
      type: [String],
      default: [],
    },
    globalEffectivenessScore: {
      type: Number,
      required: true,
      min: 0,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "RecommendationGlobalWeight",
  recommendationGlobalWeightSchema
);

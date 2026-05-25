import mongoose from "mongoose";

const interventionSuccessRateSchema = new mongoose.Schema(
  {
    activityType: {
      type: String,
      required: true,
      trim: true,
    },
    successRate: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  { _id: false }
);

const emotionalTrendAnalyticsSchema = new mongoose.Schema(
  {
    emotionalPattern: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    correlatedFactors: {
      type: [String],
      default: [],
    },
    interventionSuccessRates: {
      type: [interventionSuccessRateSchema],
      default: [],
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "EmotionalTrendAnalytics",
  emotionalTrendAnalyticsSchema
);

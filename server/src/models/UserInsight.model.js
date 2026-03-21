import mongoose from "mongoose";

const userInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    emotionalBaseline: {
      type: Number,
      required: true,
      default: 5,
    },
    stressLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
      default: "medium",
    },
    recoveryRate: {
      type: String,
      enum: ["slow", "medium", "fast"],
      required: true,
      default: "medium",
    },
    dominantEmotion: {
      type: String,
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("UserInsight", userInsightSchema);

import mongoose from "mongoose";

const personalityClusterSchema = new mongoose.Schema(
  {
    clusterId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    dominantTraits: {
      type: [String],
      default: [],
    },
    commonPatterns: {
      type: [String],
      default: [],
    },
    commonInterventions: {
      type: [String],
      default: [],
    },
    tonePreferences: {
      preferredTone: {
        type: String,
        trim: true,
        default: "gentle_reassurance",
      },
      avoidTone: {
        type: [String],
        default: [],
      },
    },
    userCount: {
      type: Number,
      required: true,
      min: 0,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PersonalityCluster", personalityClusterSchema);

import mongoose from "mongoose";

const interventionInsightSchema = new mongoose.Schema(
  {
    activityType: {
      type: String,
      required: true,
      trim: true,
    },
    effectivenessWeight: {
      type: Number,
      required: true,
      min: 0,
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

const collectiveInsightSchema = new mongoose.Schema(
  {
    traitCluster: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    emotionalPattern: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    effectiveInterventions: {
      type: [interventionInsightSchema],
      default: [],
    },
    ineffectiveInterventions: {
      type: [interventionInsightSchema],
      default: [],
    },
    emotionalStrategy: {
      preferredTone: {
        type: String,
        trim: true,
        default: "gentle_reassurance",
      },
      avoidTone: {
        type: [String],
        default: [],
      },
      supportFocus: {
        type: [String],
        default: [],
      },
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    sampleSize: {
      type: Number,
      required: true,
      min: 0,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

collectiveInsightSchema.index(
  { traitCluster: 1, emotionalPattern: 1 },
  { unique: true }
);

export default mongoose.model("CollectiveInsight", collectiveInsightSchema);

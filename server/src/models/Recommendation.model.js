import mongoose from "mongoose";

const recommendationActivitySchema = new mongoose.Schema(
  {
    activityType: {
      type: String,
      required: true,
      trim: true,
    },
    recommendationScore: {
      type: Number,
      required: true,
      min: 0,
    },
    personalizedTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    personalizedDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280,
    },
    relevanceContext: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    accepted: {
      type: Boolean,
      default: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    ignored: {
      type: Boolean,
      default: false,
    },
    actedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: true }
);

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    activities: {
      type: [recommendationActivitySchema],
      default: [],
    },
    recommendationContext: {
      moodScore: {
        type: Number,
        min: 1,
        max: 10,
      },
      emotionTag: {
        type: String,
        trim: true,
      },
      dominantPatterns: {
        type: [String],
        default: [],
      },
      daySegment: {
        type: String,
        trim: true,
      },
      generatedFromMoodLogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MoodLog",
      },
      forecastTrend: {
        type: String,
        trim: true,
      },
      forecastMood: {
        type: Number,
        min: 1,
        max: 10,
      },
      contextReasons: {
        type: [String],
        default: [],
      },
    },
    source: {
      type: String,
      enum: ["deterministic_engine", "cached_engine"],
      default: "deterministic_engine",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "ignored"],
      default: "pending",
    },
    effectivenessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },
  },
  { timestamps: true }
);

const Recommendation = mongoose.model("Recommendation", recommendationSchema);
export default Recommendation;

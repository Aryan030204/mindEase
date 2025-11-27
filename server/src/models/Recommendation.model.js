import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    moodLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MoodLog",
      required: true,
    },
    suggestedActivities: {
      type: [String],
      enum: [
        "meditation",
        "journaling",
        "music",
        "workout",
        "breathing",
        "walk",
        "yoga",
        "stretching",
        "nature_walk",
        "digital_detox",
        "gratitude",
        "creative",
        "social_check_in",
        "therapy_check_in",
        "hydration_break",
        "mindful_eating",
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ["accepted", "ignored", "completed", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Recommendation = mongoose.model("Recommendation", recommendationSchema);
export default Recommendation;

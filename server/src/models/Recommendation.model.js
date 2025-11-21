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

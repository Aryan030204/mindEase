import mongoose from "mongoose";

const moodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    moodScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    emotionTag: {
      type: String,
      enum: ["happy", "sad", "anxious", "calm", "neutral", "angry", "excited"],
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    activityDone: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

moodLogSchema.index({ userId: 1, date: -1 });

const MoodLog = mongoose.model("MoodLog", moodLogSchema);
export default MoodLog;

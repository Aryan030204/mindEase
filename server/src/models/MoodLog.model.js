import mongoose from "mongoose";

const moodLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    timestamp: {
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
      enum: [
        "happy",
        "sad",
        "anxious",
        "calm",
        "neutral",
        "angry",
        "excited",
        "tired",
        "stressed",
        "overwhelmed",
      ],
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
    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
      default: null,
    },
    screenTime: {
      type: Number,
      min: 0,
      max: 24,
      default: null,
    },
    socialInteractionLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    stressLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: null,
    },
  },
  { timestamps: true }
);

moodLogSchema.index({ userId: 1, timestamp: -1 });

moodLogSchema.virtual("date").get(function getDate() {
  return this.timestamp;
});

moodLogSchema.set("toJSON", { virtuals: true });
moodLogSchema.set("toObject", { virtuals: true });

const MoodLog = mongoose.model("MoodLog", moodLogSchema);
export default MoodLog;

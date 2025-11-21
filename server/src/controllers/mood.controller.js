import MoodLog from "../models/MoodLog.model.js";
import asyncHandler from "../utils/asyncHandler.js";

// -----------------------------------------------------
// Add Daily Mood Log
// -----------------------------------------------------
export const addMoodLog = asyncHandler(async (req, res) => {
  const { moodScore, emotionTag, notes, activityDone } = req.body;

  const moodLog = await MoodLog.create({
    userId: req.user.id,
    moodScore,
    emotionTag,
    notes,
    activityDone,
  });

  return res.status(201).json({
    message: "Mood logged successfully",
    log: moodLog,
  });
});

// -----------------------------------------------------
// Fetch Mood History
// -----------------------------------------------------
export const getMoodHistory = asyncHandler(async (req, res) => {
  const logs = await MoodLog.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });

  return res.status(200).json({ logs });
});

// -----------------------------------------------------
// Basic Mood Analytics (weekly/monthly trends)
// -----------------------------------------------------
export const getMoodAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Aggregate pipeline for analytics
  const analytics = await MoodLog.aggregate([
    { $match: { userId } },

    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          week: { $week: "$createdAt" },
        },
        avgMoodScore: { $avg: "$moodScore" },
        count: { $sum: 1 },
      },
    },

    { $sort: { "_id.year": -1, "_id.week": -1 } },
  ]);

  return res.status(200).json({
    message: "Mood analytics fetched",
    analytics,
  });
});

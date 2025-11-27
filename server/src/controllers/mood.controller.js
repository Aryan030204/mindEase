import MoodLog from "../models/MoodLog.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// -----------------------------------------------------
// Add Daily Mood Log
// -----------------------------------------------------
export const addMoodLog = asyncHandler(async (req, res) => {
  const { moodScore, emotionTag, notes, activityDone, date } = req.body;
  const userId = req.user.id;

  // Convert to ObjectId if needed
  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  // Use provided date or current date, normalize to start of day
  const logDate = date ? new Date(date) : new Date();
  logDate.setHours(0, 0, 0, 0);

  // Check if user already logged mood for this date
  const existingLog = await MoodLog.findOne({
    userId: userObjectId,
    date: {
      $gte: new Date(logDate),
      $lt: new Date(logDate.getTime() + 24 * 60 * 60 * 1000),
    },
  });

  if (existingLog) {
    // Update existing log instead of creating duplicate
    existingLog.moodScore = moodScore;
    existingLog.emotionTag = emotionTag;
    existingLog.notes = notes;
    existingLog.activityDone = activityDone;
    await existingLog.save();

    return res.status(200).json({
      message: "Mood log updated successfully",
      log: existingLog,
    });
  }

  const moodLog = await MoodLog.create({
    userId: userObjectId,
    date: logDate,
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
  const userId = req.user.id;
  const { limit = 50, skip = 0, startDate, endDate } = req.query;

  // Convert to ObjectId if needed
  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  const query = { userId: userObjectId };

  // Add date range filter if provided
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }

  const logs = await MoodLog.find(query)
    .sort({ date: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const total = await MoodLog.countDocuments(query);

  return res.status(200).json({
    logs,
    pagination: {
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      hasMore: parseInt(skip) + logs.length < total,
    },
  });
});

// -----------------------------------------------------
// Basic Mood Analytics (weekly/monthly trends)
// -----------------------------------------------------
export const getMoodAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { period = "week" } = req.query; // week or month

  // Convert userId to ObjectId if it's a string
  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  let groupBy;
  if (period === "month") {
    groupBy = {
      year: { $year: "$date" },
      month: { $month: "$date" },
    };
  } else {
    // Week grouping - group by year and week number
    // Using a simpler calculation: week = ceil(dayOfYear / 7)
    groupBy = {
      year: { $year: "$date" },
      week: {
        $ceil: { $divide: [{ $dayOfYear: "$date" }, 7] },
      },
    };
  }

  // Build project stage with conditional fields
  const projectStage = {
    _id: 1,
    avgMoodScore: { $round: ["$avgMoodScore", 2] },
    count: 1,
    emotionTags: 1,
    dates: 1,
    year: "$_id.year",
  };
  
  if (period === "month") {
    projectStage.month = "$_id.month";
  } else {
    projectStage.week = "$_id.week";
  }

  // Build sort stage
  const sortStage = period === "month"
    ? { $sort: { year: -1, month: -1 } }
    : { $sort: { year: -1, week: -1 } };

  // Aggregate pipeline for analytics
  const analytics = await MoodLog.aggregate([
    { $match: { userId: userObjectId } },
    {
      $group: {
        _id: groupBy,
        avgMoodScore: { $avg: "$moodScore" },
        count: { $sum: 1 },
        emotionTags: { $push: "$emotionTag" },
        dates: { $push: "$date" },
      },
    },
    { $project: projectStage },
    sortStage,
  ]);

  // Get emotion tag distribution
  const emotionDistribution = await MoodLog.aggregate([
    { $match: { userId: userObjectId } },
    {
      $group: {
        _id: "$emotionTag",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  // Get overall stats
  const overallStats = await MoodLog.aggregate([
    { $match: { userId: userObjectId } },
    {
      $group: {
        _id: null,
        avgMoodScore: { $avg: "$moodScore" },
        minMoodScore: { $min: "$moodScore" },
        maxMoodScore: { $max: "$moodScore" },
        totalLogs: { $sum: 1 },
      },
    },
  ]);

  return res.status(200).json({
    message: "Mood analytics fetched",
    analytics,
    emotionDistribution,
    overallStats: overallStats[0] || null,
  });
});

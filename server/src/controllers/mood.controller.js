import mongoose from "mongoose";
import MoodLog from "../models/MoodLog.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sanitizeText } from "../utils/sanitize.js";
import { detectUserPatterns } from "../services/patternDetection.service.js";
import { generatePersonalizedRecommendation } from "../services/recommendationEngine.service.js";
import { setJson } from "../services/redis.service.js";

const EMOTIONAL_STATE_TTL = 60 * 60 * 12;

const toObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : value;

export const addMoodLog = asyncHandler(async (req, res) => {
  const {
    moodScore,
    emotionTag,
    notes,
    activityDone,
    sleepHours,
    screenTime,
    socialInteractionLevel,
    stressLevel,
    timestamp,
  } = req.body;
  const userId = req.user.id;
  const userObjectId = toObjectId(userId);

  const logTimestamp = timestamp ? new Date(timestamp) : new Date();
  const dayStart = new Date(logTimestamp);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const payload = {
    moodScore,
    emotionTag,
    notes: sanitizeText(notes, 500),
    activityDone,
    sleepHours,
    screenTime,
    socialInteractionLevel,
    stressLevel,
    timestamp: logTimestamp,
  };

  let moodLog = await MoodLog.findOne({
    userId: userObjectId,
    timestamp: {
      $gte: dayStart,
      $lt: dayEnd,
    },
  });

  const isUpdate = Boolean(moodLog);

  if (moodLog) {
    Object.assign(moodLog, payload);
    await moodLog.save();
  } else {
    moodLog = await MoodLog.create({
      userId: userObjectId,
      ...payload,
    });
  }

  const [patterns, recommendation] = await Promise.all([
    detectUserPatterns(userObjectId),
    generatePersonalizedRecommendation(userObjectId, { forceRefresh: true }),
    setJson(
      `emotional-state:${userId}`,
      {
        moodScore: moodLog.moodScore,
        emotionTag: moodLog.emotionTag,
        stressLevel: moodLog.stressLevel,
        sleepHours: moodLog.sleepHours,
        socialInteractionLevel: moodLog.socialInteractionLevel,
        timestamp: moodLog.timestamp,
      },
      EMOTIONAL_STATE_TTL
    ),
  ]);

  return res.status(isUpdate ? 200 : 201).json({
    message: isUpdate ? "Mood log updated successfully" : "Mood logged successfully",
    log: moodLog,
    patterns,
    recommendation,
  });
});

export const getMoodHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 50, skip = 0, startDate, endDate } = req.query;
  const userObjectId = toObjectId(userId);

  const query = { userId: userObjectId };

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  const logs = await MoodLog.find(query)
    .sort({ timestamp: -1, createdAt: -1 })
    .limit(parseInt(limit, 10))
    .skip(parseInt(skip, 10));

  const total = await MoodLog.countDocuments(query);

  return res.status(200).json({
    logs,
    pagination: {
      total,
      limit: parseInt(limit, 10),
      skip: parseInt(skip, 10),
      hasMore: parseInt(skip, 10) + logs.length < total,
    },
  });
});

export const getMoodAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { period = "week" } = req.query;
  const userObjectId = toObjectId(userId);

  const groupBy =
    period === "month"
      ? {
          year: { $year: "$timestamp" },
          month: { $month: "$timestamp" },
        }
      : {
          year: { $year: "$timestamp" },
          week: {
            $ceil: { $divide: [{ $dayOfYear: "$timestamp" }, 7] },
          },
        };

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

  const sortStage =
    period === "month"
      ? { $sort: { year: -1, month: -1 } }
      : { $sort: { year: -1, week: -1 } };

  const analytics = await MoodLog.aggregate([
    { $match: { userId: userObjectId } },
    {
      $group: {
        _id: groupBy,
        avgMoodScore: { $avg: "$moodScore" },
        count: { $sum: 1 },
        emotionTags: { $push: "$emotionTag" },
        dates: { $push: "$timestamp" },
      },
    },
    { $project: projectStage },
    sortStage,
  ]);

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

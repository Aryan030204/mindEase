import MoodLog from "../models/MoodLog.model.js";
import RecommendationEffectiveness from "../models/RecommendationEffectiveness.model.js";
import UserPattern from "../models/UserPattern.model.js";
import UserTrait from "../models/UserTrait.model.js";
import {
  deriveBehavioralArchetype,
  deriveEmotionalPatternKey,
} from "./behaviorProfile.service.js";
import { getJson, setJson } from "./redis.service.js";

const AGGREGATION_CACHE_KEY = "collective:aggregation:snapshot";
const AGGREGATION_CACHE_TTL = 60 * 30;

const buildMoodAggregationMap = async () => {
  const moods = await MoodLog.aggregate([
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: "$userId",
        averageMood: { $avg: "$moodScore" },
        averageStress: { $avg: "$stressLevel" },
        averageSleep: { $avg: "$sleepHours" },
        dominantEmotion: { $first: "$emotionTag" },
        lowSocialCount: {
          $sum: {
            $cond: [{ $eq: ["$socialInteractionLevel", "low"] }, 1, 0],
          },
        },
        totalLogs: { $sum: 1 },
      },
    },
  ]);

  return new Map(
    moods.map((item) => [
      String(item._id),
      {
        averageMood: Number((item.averageMood || 0).toFixed(2)),
        averageStress: Number((item.averageStress || 0).toFixed(2)),
        averageSleep: Number((item.averageSleep || 0).toFixed(2)),
        dominantEmotion: item.dominantEmotion || "neutral",
        lowSocialRate: item.totalLogs ? item.lowSocialCount / item.totalLogs : 0,
        totalLogs: item.totalLogs || 0,
      },
    ])
  );
};

const buildEffectivenessMap = async () => {
  const rows = await RecommendationEffectiveness.find({ totalShown: { $gte: 1 } }).lean();
  const map = new Map();

  rows.forEach((row) => {
    const key = String(row.userId);
    const list = map.get(key) || [];
    list.push(row);
    map.set(key, list);
  });

  return map;
};

const buildPatternMap = async () => {
  const rows = await UserPattern.find({}).lean();
  return new Map(rows.map((row) => [String(row.userId), row.patterns || []]));
};

export const collectAnonymizedBehaviorProfiles = async ({ forceRefresh = false } = {}) => {
  if (!forceRefresh) {
    const cached = await getJson(AGGREGATION_CACHE_KEY);
    if (cached) {
      return cached;
    }
  }

  const [traits, moodMap, effectivenessMap, patternMap] = await Promise.all([
    UserTrait.find({ onboardingCompleted: true }).lean(),
    buildMoodAggregationMap(),
    buildEffectivenessMap(),
    buildPatternMap(),
  ]);

  const profiles = traits
    .map((userTrait) => {
      const userId = String(userTrait.userId);
      const userPatterns = patternMap.get(userId) || [];
      const effectivenessRows = effectivenessMap.get(userId) || [];
      const moodSummary = moodMap.get(userId) || {};

      if (!effectivenessRows.length && !userPatterns.length && !moodSummary.totalLogs) {
        return null;
      }

      const archetype = deriveBehavioralArchetype({
        userTrait,
        userPatterns,
        effectivenessRows,
      });

      const interventionStats = effectivenessRows.map((row) => {
        const successRate = row.totalShown
          ? (row.totalAccepted + row.totalCompleted * 1.2) / (row.totalShown * 2.2)
          : 0;
        return {
          activityType: row.activityType,
          totalShown: row.totalShown,
          totalAccepted: row.totalAccepted,
          totalCompleted: row.totalCompleted,
          totalIgnored: row.totalIgnored,
          effectivenessWeight: row.effectivenessWeight,
          successRate: Number(Math.max(0, Math.min(1, successRate)).toFixed(3)),
          ignoreRate: row.totalShown ? Number((row.totalIgnored / row.totalShown).toFixed(3)) : 0,
        };
      });

      return {
        traitCluster: archetype.clusterId,
        dominantTraits: archetype.dominantTraits,
        commonPatterns: archetype.commonPatterns,
        commonInterventions: archetype.commonInterventions,
        tonePreferences: archetype.tonePreferences,
        emotionalPattern: deriveEmotionalPatternKey({
          userPatterns,
          moodSummary,
        }),
        moodSummary,
        interventionStats,
      };
    })
    .filter(Boolean);

  await setJson(AGGREGATION_CACHE_KEY, profiles, AGGREGATION_CACHE_TTL);
  return profiles;
};

export const buildUserAnonymizedProfile = async (userId) => {
  const [userTrait, userPattern, effectivenessRows, moodSummary] = await Promise.all([
    UserTrait.findOne({ userId }).lean(),
    UserPattern.findOne({ userId }).lean(),
    RecommendationEffectiveness.find({ userId, totalShown: { $gte: 1 } }).lean(),
    MoodLog.aggregate([
      { $match: { userId } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$userId",
          averageMood: { $avg: "$moodScore" },
          averageStress: { $avg: "$stressLevel" },
          averageSleep: { $avg: "$sleepHours" },
          dominantEmotion: { $first: "$emotionTag" },
          lowSocialCount: {
            $sum: {
              $cond: [{ $eq: ["$socialInteractionLevel", "low"] }, 1, 0],
            },
          },
          totalLogs: { $sum: 1 },
        },
      },
    ]),
  ]);

  const summaryRow = moodSummary[0] || {};
  const moodStats = {
    averageMood: Number((summaryRow.averageMood || 0).toFixed?.(2) || 0),
    averageStress: Number((summaryRow.averageStress || 0).toFixed?.(2) || 0),
    averageSleep: Number((summaryRow.averageSleep || 0).toFixed?.(2) || 0),
    dominantEmotion: summaryRow.dominantEmotion || "neutral",
    lowSocialRate: summaryRow.totalLogs ? summaryRow.lowSocialCount / summaryRow.totalLogs : 0,
    totalLogs: summaryRow.totalLogs || 0,
  };

  const archetype = deriveBehavioralArchetype({
    userTrait,
    userPatterns: userPattern?.patterns || [],
    effectivenessRows,
  });

  return {
    traitCluster: archetype.clusterId,
    dominantTraits: archetype.dominantTraits,
    commonPatterns: archetype.commonPatterns,
    commonInterventions: archetype.commonInterventions,
    tonePreferences: archetype.tonePreferences,
    emotionalPattern: deriveEmotionalPatternKey({
      userPatterns: userPattern?.patterns || [],
      moodSummary: moodStats,
    }),
    moodSummary: moodStats,
    interventionStats: effectivenessRows.map((row) => ({
      activityType: row.activityType,
      totalShown: row.totalShown,
      totalAccepted: row.totalAccepted,
      totalCompleted: row.totalCompleted,
      totalIgnored: row.totalIgnored,
      effectivenessWeight: row.effectivenessWeight,
      successRate: row.totalShown
        ? Number(
            Math.max(
              0,
              Math.min(1, (row.totalAccepted + row.totalCompleted * 1.2) / (row.totalShown * 2.2))
            ).toFixed(3)
          )
        : 0,
      ignoreRate: row.totalShown ? Number((row.totalIgnored / row.totalShown).toFixed(3)) : 0,
    })),
  };
};

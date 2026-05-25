import MoodLog from "../models/MoodLog.model.js";
import RecommendationEffectiveness from "../models/RecommendationEffectiveness.model.js";
import UserTrait from "../models/UserTrait.model.js";
import { getGlobalRecommendationModifiers } from "./recommendationOptimization.service.js";
import { forecastMood } from "./forecasting.service.js";
import { getUserPatterns } from "./patternDetection.service.js";
import { getJson, getList } from "./redis.service.js";

const EMOTIONAL_STATE_KEY = (userId) => `emotional-state:${userId}`;
const CHAT_CONTEXT_KEY = (userId) => `chat-context:${userId}`;

const normalizeTraits = (traitsMap) => {
  if (traitsMap instanceof Map) {
    return Object.fromEntries(traitsMap.entries());
  }
  return traitsMap || {};
};

export const buildChatContext = async (userId) => {
  const [traits, moods, patterns, successfulInterventions, recentState, recentChat, forecast] =
    await Promise.all([
      UserTrait.findOne({ userId }).lean(),
      MoodLog.find({ userId }).sort({ timestamp: -1 }).limit(5).lean(),
      getUserPatterns(userId),
      RecommendationEffectiveness.find({
        userId,
        totalCompleted: { $gte: 1 },
      })
        .sort({ effectivenessWeight: -1, totalCompleted: -1 })
        .limit(4)
        .lean(),
      getJson(EMOTIONAL_STATE_KEY(userId)),
      getList(CHAT_CONTEXT_KEY(userId)),
      forecastMood(userId),
    ]);

  const collectiveAdaptation = await getGlobalRecommendationModifiers({
    userTrait: traits,
    userPatterns: patterns?.patterns || [],
  });

  return {
    userTraits: normalizeTraits(traits?.traits),
    recentMoodHistory: moods.map((log) => ({
      moodScore: log.moodScore,
      emotionTag: log.emotionTag,
      stressLevel: log.stressLevel,
      sleepHours: log.sleepHours,
      socialInteractionLevel: log.socialInteractionLevel,
      timestamp: log.timestamp,
    })),
    detectedPatterns: (patterns?.patterns || []).map((pattern) => ({
      type: pattern.type,
      description: pattern.description,
      confidence: pattern.confidence,
    })),
    successfulInterventions: successfulInterventions.map((item) => ({
      activityType: item.activityType,
      effectivenessWeight: item.effectivenessWeight,
      completions: item.totalCompleted,
    })),
    collectiveAdaptation: collectiveAdaptation.adaptationMetadata,
    recentEmotionalState: recentState,
    recentChatContext: recentChat,
    forecast,
  };
};

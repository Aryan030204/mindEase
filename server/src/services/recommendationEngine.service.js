import MoodLog from "../models/MoodLog.model.js";
import Recommendation from "../models/Recommendation.model.js";
import RecommendationEffectiveness from "../models/RecommendationEffectiveness.model.js";
import UserTrait from "../models/UserTrait.model.js";
import recommendationDataset from "../data/recommendationDataset.js";
import { inferPersonalityTags } from "./behaviorProfile.service.js";
import { forecastMood } from "./forecasting.service.js";
import { getUserPatterns } from "./patternDetection.service.js";
import { getGlobalRecommendationModifiers } from "./recommendationOptimization.service.js";
import { getJson, setJson } from "./redis.service.js";
import { rephraseRecommendations } from "./ai.service.js";

const RECOMMENDATION_CACHE_TTL = 60 * 60 * 3;

const getDaySegment = (timestamp = new Date()) => {
  const hour = new Date(timestamp).getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
};

const getContextSignals = (latestMood) => {
  const signals = [];

  if ((latestMood.sleepHours || 0) < 6) {
    signals.push("low_sleep");
  }
  if ((latestMood.screenTime || 0) >= 7) {
    signals.push("high_screen_time");
  }
  if ((latestMood.stressLevel || 0) >= 7) {
    signals.push("high_stress");
  }
  if (latestMood.socialInteractionLevel === "low") {
    signals.push("low_social_energy");
  }
  if (latestMood.activityDone) {
    signals.push("already_active_today");
  }

  return signals;
};

const buildReasons = ({
  moodMatch,
  personalityMatch,
  patternMatch,
  effectivenessWeight,
  daySegment,
  globalModifier,
}) => {
  const reasons = [];
  if (moodMatch) reasons.push(`matched to your ${moodMatch} mood state`);
  if (personalityMatch) reasons.push(`fits your ${personalityMatch.replace(/_/g, " ")} style`);
  if (patternMatch) reasons.push(`aligned with a recent ${patternMatch.replace(/_/g, " ")} pattern`);
  if (effectivenessWeight > 1.15) reasons.push("has worked well for you before");
  if (globalModifier > 1.08) reasons.push("has shown steady value in similar situations");
  reasons.push(`works well during the ${daySegment}`);
  return reasons;
};

const updateEffectivenessWeight = (record) => {
  const acceptanceRate = record.totalShown ? record.totalAccepted / record.totalShown : 0;
  const completionRate = record.totalShown ? record.totalCompleted / record.totalShown : 0;
  const ignoreRate = record.totalShown ? record.totalIgnored / record.totalShown : 0;

  const weight = 1 + acceptanceRate * 0.35 + completionRate * 0.65 - ignoreRate * 0.45;
  return Math.max(0.5, Math.min(2.2, Number(weight.toFixed(2))));
};

export const recordRecommendationExposure = async (userId, activities) => {
  await Promise.all(
    activities.map(async (activity) => {
      const record =
        (await RecommendationEffectiveness.findOne({ userId, activityType: activity.activityType })) ||
        new RecommendationEffectiveness({ userId, activityType: activity.activityType });

      record.totalShown += 1;
      record.effectivenessWeight = updateEffectivenessWeight(record);
      record.updatedAt = new Date();
      await record.save();
    })
  );
};

export const scoreActivitiesForUser = async (userId, latestMood, options = {}) => {
  const [userTrait, effectivenessRows, userPatterns, recentRecommendations, forecast] = await Promise.all([
    UserTrait.findOne({ userId }).lean(),
    RecommendationEffectiveness.find({ userId }).lean(),
    getUserPatterns(userId),
    Recommendation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean(),
    forecastMood(userId),
  ]);

  const personalityTags = inferPersonalityTags(userTrait);
  const daySegment = getDaySegment(latestMood.timestamp);
  const contextSignals = getContextSignals(latestMood);
  const globalOptimization = await getGlobalRecommendationModifiers({
    userTrait,
    userPatterns: userPatterns?.patterns || [],
  });

  const effectivenessMap = new Map(
    effectivenessRows.map((row) => [row.activityType, row])
  );

  const recentActivityCounts = new Map();
  recentRecommendations.forEach((recommendation) => {
    (recommendation.activities || []).forEach((activity) => {
      recentActivityCounts.set(
        activity.activityType,
        (recentActivityCounts.get(activity.activityType) || 0) + 1
      );
    });
  });

  const activePatterns = (userPatterns?.patterns || []).map((pattern) => pattern.type);

  const scored = recommendationDataset.map((activity) => {
    const effectiveness = effectivenessMap.get(activity.activityType);
    const recentCount = recentActivityCounts.get(activity.activityType) || 0;
    const globalModifier = globalOptimization.modifierMap.get(activity.activityType)?.weight || 1;

    const personalityMatch = activity.personalityTags.find((tag) => personalityTags.includes(tag));
    const moodMatch = activity.emotionalTags.includes(latestMood.emotionTag)
      ? latestMood.emotionTag
      : null;
    const patternMatch = activePatterns.find((pattern) => {
      if (pattern === "night_anxiety") return activity.timeTags.includes("night");
      if (pattern === "sleep_related_mood_decline") return ["sleep_winddown", "breathing_reset", "sunlight_walk"].includes(activity.activityType);
      if (pattern === "social_isolation_pattern") return ["family_check_in", "friend_voice_note"].includes(activity.activityType);
      if (pattern === "monday_stress") return ["breathing_reset", "stretch_break", "mindful_meal"].includes(activity.activityType);
      return false;
    });

    const personalityFactor = personalityMatch ? 1.28 : 0.96;
    const moodFactor = moodMatch ? 1.35 : latestMood.moodScore <= 4 && activity.intensityLevel === "low" ? 1.18 : 0.95;
    const effectivenessWeight = effectiveness?.effectivenessWeight || 1;
    const patternFactor = patternMatch ? 1.18 : 1;
    const contextFactor =
      contextSignals.includes("low_sleep") && ["sleep_winddown", "sunlight_walk", "breathing_reset"].includes(activity.activityType)
        ? 1.2
        : contextSignals.includes("high_screen_time") && ["digital_detox", "stretch_break"].includes(activity.activityType)
          ? 1.18
          : contextSignals.includes("low_social_energy") && ["family_check_in", "friend_voice_note"].includes(activity.activityType)
            ? 1.16
            : 1;
    const timeFactor = activity.timeTags.includes(daySegment) ? 1.16 : 0.92;
    const forecastFactor =
      forecast.predictedTrend === "declining" && activity.intensityLevel === "low"
        ? 1.08
        : forecast.predictedTrend === "improving" && activity.intensityLevel === "medium"
          ? 1.04
          : 1;

    const repetitionPenalty = recentCount >= 2 ? 0.55 : recentCount === 1 ? 0.82 : 1;
    const ignorePenalty =
      effectiveness?.totalIgnored && effectiveness.totalIgnored > effectiveness.totalAccepted + effectiveness.totalCompleted
        ? 0.72
        : 1;
    const completedBoost = effectiveness?.totalCompleted >= 2 ? 1.08 : 1;

    const score =
      personalityFactor *
      moodFactor *
      effectivenessWeight *
      patternFactor *
      contextFactor *
      timeFactor *
      forecastFactor *
      globalModifier *
      repetitionPenalty *
      ignorePenalty *
      completedBoost;

    return {
      ...activity,
      score: Number((score * 100).toFixed(2)),
      relevanceContext: buildReasons({
        moodMatch,
        personalityMatch,
        patternMatch,
        effectivenessWeight,
        daySegment,
        globalModifier,
      }).join(", "),
    };
  });

  return {
    scored,
    daySegment,
    personalityTags,
    userPatterns,
    forecast,
    contextSignals,
    adaptationMetadata: globalOptimization.adaptationMetadata,
    collectiveLearningReady: true,
    forceRefresh: Boolean(options.forceRefresh),
  };
};

export const generatePersonalizedRecommendation = async (userId, options = {}) => {
  const latestMood = await MoodLog.findOne({ userId }).sort({ timestamp: -1, createdAt: -1 }).lean();

  if (!latestMood) {
    return null;
  }

  const cacheKey = `recommendations:${userId}:${latestMood._id}`;
  if (!options.forceRefresh) {
    const cached = await getJson(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const existingRecommendation = await Recommendation.findOne({
    userId,
    "recommendationContext.generatedFromMoodLogId": latestMood._id,
  }).sort({ createdAt: -1 });

  if (existingRecommendation && !options.forceRefresh) {
    await setJson(cacheKey, existingRecommendation.toObject(), RECOMMENDATION_CACHE_TTL);
    return existingRecommendation.toObject();
  }

  const scoring = await scoreActivitiesForUser(userId, latestMood, options);
  const selectedActivities = scoring.scored.slice(0, 4);

  const phrasedActivities = await rephraseRecommendations(
    {
      moodScore: latestMood.moodScore,
      emotionTag: latestMood.emotionTag,
      timeOfDay: scoring.daySegment,
      personalityTags: scoring.personalityTags,
      patterns: (scoring.userPatterns?.patterns || []).map((pattern) => pattern.type),
      forecast: scoring.forecast,
    },
    selectedActivities.map((activity) => ({
      activityType: activity.activityType,
      title: activity.title,
      description: activity.description,
      relevanceContext: activity.relevanceContext,
    }))
  );

  const activities = selectedActivities.map((activity, index) => ({
    activityType: activity.activityType,
    recommendationScore: activity.score,
    personalizedTitle: phrasedActivities[index]?.title || activity.title,
    personalizedDescription: phrasedActivities[index]?.description || activity.description,
    relevanceContext: activity.relevanceContext,
  }));

  let recommendation = existingRecommendation;

  if (recommendation) {
    recommendation.activities = activities;
    recommendation.recommendationContext = {
      moodScore: latestMood.moodScore,
      emotionTag: latestMood.emotionTag,
      dominantPatterns: (scoring.userPatterns?.patterns || []).map((pattern) => pattern.type),
      daySegment: scoring.daySegment,
      generatedFromMoodLogId: latestMood._id,
      forecastTrend: scoring.forecast.predictedTrend,
      forecastMood: scoring.forecast.predictedMood,
      contextReasons: scoring.contextSignals,
    };
    recommendation.source = "deterministic_engine";
    recommendation.status = "pending";
    recommendation.effectivenessScore = 0;
    await recommendation.save();
  } else {
    recommendation = await Recommendation.create({
      userId,
      activities,
      recommendationContext: {
        moodScore: latestMood.moodScore,
        emotionTag: latestMood.emotionTag,
        dominantPatterns: (scoring.userPatterns?.patterns || []).map((pattern) => pattern.type),
        daySegment: scoring.daySegment,
        generatedFromMoodLogId: latestMood._id,
        forecastTrend: scoring.forecast.predictedTrend,
        forecastMood: scoring.forecast.predictedMood,
        contextReasons: scoring.contextSignals,
      },
      source: "deterministic_engine",
      status: "pending",
      effectivenessScore: 0,
    });

    await recordRecommendationExposure(userId, activities);
  }

  const finalRecommendation = recommendation.toObject();
  await setJson(cacheKey, finalRecommendation, RECOMMENDATION_CACHE_TTL);
  return finalRecommendation;
};

export const updateRecommendationFeedback = async ({
  userId,
  recommendationId,
  activityId,
  action,
}) => {
  const recommendation = await Recommendation.findOne({
    _id: recommendationId,
    userId,
  });

  if (!recommendation) {
    const error = new Error("Recommendation not found");
    error.statusCode = 404;
    throw error;
  }

  const activity = recommendation.activities.id(activityId);
  if (!activity) {
    const error = new Error("Recommendation activity not found");
    error.statusCode = 404;
    throw error;
  }

  activity.accepted = action === "accepted" || action === "completed";
  activity.completed = action === "completed";
  activity.ignored = action === "ignored";
  activity.actedAt = new Date();

  recommendation.status =
    action === "completed" ? "completed" : action === "ignored" ? "ignored" : "accepted";

  const completedCount = recommendation.activities.filter((item) => item.completed).length;
  const acceptedCount = recommendation.activities.filter((item) => item.accepted).length;
  const ignoredCount = recommendation.activities.filter((item) => item.ignored).length;
  recommendation.effectivenessScore = Number(
    (
      (acceptedCount * 0.5 + completedCount * 1 - ignoredCount * 0.25) /
      Math.max(1, recommendation.activities.length)
    ).toFixed(2)
  );

  await recommendation.save();

  const record =
    (await RecommendationEffectiveness.findOne({
      userId,
      activityType: activity.activityType,
    })) ||
    new RecommendationEffectiveness({
      userId,
      activityType: activity.activityType,
    });

  if (action === "accepted") {
    record.totalAccepted += 1;
  }
  if (action === "completed") {
    record.totalCompleted += 1;
  }
  if (action === "ignored") {
    record.totalIgnored += 1;
  }

  record.effectivenessWeight = updateEffectivenessWeight(record);
  record.updatedAt = new Date();
  await record.save();

  const recommendationObject = recommendation.toObject();
  const moodLogId = recommendation.recommendationContext?.generatedFromMoodLogId;
  if (moodLogId) {
    const cacheKey = `recommendations:${userId}:${moodLogId}`;
    await setJson(cacheKey, recommendationObject, RECOMMENDATION_CACHE_TTL);
  }

  return recommendationObject;
};

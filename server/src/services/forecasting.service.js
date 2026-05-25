import MoodLog from "../models/MoodLog.model.js";
import { getUserPatterns } from "./patternDetection.service.js";

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const forecastMood = async (userId) => {
  const logs = await MoodLog.find({ userId }).sort({ timestamp: -1 }).limit(10).lean();
  const patternState = await getUserPatterns(userId);

  if (!logs.length) {
    return {
      predictedMood: 5,
      confidence: 0.2,
      predictedTrend: "stable",
    };
  }

  const orderedLogs = [...logs].reverse();
  const weights = orderedLogs.map((_, index) => index + 1);
  const weightTotal = weights.reduce((sum, value) => sum + value, 0);
  const weightedMood =
    orderedLogs.reduce((sum, log, index) => sum + log.moodScore * weights[index], 0) / weightTotal;

  const firstMood = orderedLogs[0].moodScore;
  const lastMood = orderedLogs[orderedLogs.length - 1].moodScore;
  const rawTrend = lastMood - firstMood;

  let trendAdjustment = 0;
  const recentStress = logs
    .filter((log) => typeof log.stressLevel === "number")
    .slice(0, 4);
  if (recentStress.length) {
    const averageStress =
      recentStress.reduce((sum, log) => sum + log.stressLevel, 0) / recentStress.length;
    trendAdjustment -= Math.max(0, averageStress - 5) * 0.12;
  }

  const recentSleep = logs
    .filter((log) => typeof log.sleepHours === "number")
    .slice(0, 4);
  if (recentSleep.length) {
    const averageSleep =
      recentSleep.reduce((sum, log) => sum + log.sleepHours, 0) / recentSleep.length;
    trendAdjustment += (averageSleep - 6.5) * 0.15;
  }

  const patternAdjustments = {
    monday_stress: -0.35,
    sleep_related_mood_decline: -0.25,
    social_isolation_pattern: -0.2,
    night_anxiety: -0.15,
    recommendation_effectiveness_positive: 0.25,
  };

  const patternAdjustment =
    (patternState?.patterns || []).reduce(
      (sum, pattern) => sum + (patternAdjustments[pattern.type] || 0) * pattern.confidence,
      0
    ) || 0;

  const predictedMood = clamp(
    Number((weightedMood + rawTrend * 0.25 + trendAdjustment + patternAdjustment).toFixed(1)),
    1,
    10
  );

  const predictedTrend =
    predictedMood - lastMood > 0.35 ? "improving" : lastMood - predictedMood > 0.35 ? "declining" : "stable";

  const confidenceBase = Math.min(0.9, 0.35 + logs.length * 0.05);
  const volatility =
    orderedLogs.length > 1
      ? orderedLogs
          .slice(1)
          .reduce((sum, log, index) => sum + Math.abs(log.moodScore - orderedLogs[index].moodScore), 0) /
        (orderedLogs.length - 1)
      : 0;
  const confidence = clamp(Number((confidenceBase - volatility * 0.04).toFixed(2)), 0.2, 0.9);

  return {
    predictedMood,
    confidence,
    predictedTrend,
  };
};

import MoodLog from "../models/MoodLog.model.js";
import RecommendationEffectiveness from "../models/RecommendationEffectiveness.model.js";
import UserPattern from "../models/UserPattern.model.js";

const clampConfidence = (value) =>
  Math.max(0.1, Math.min(0.95, Number(value.toFixed(2))));

export const detectUserPatterns = async (userId) => {
  const logs = await MoodLog.find({ userId }).sort({ timestamp: -1 }).limit(45).lean();
  const effectiveness = await RecommendationEffectiveness.find({ userId }).lean();

  if (!logs.length) {
    const emptyState = await UserPattern.findOneAndUpdate(
      { userId },
      { patterns: [], confidenceScores: {}, generatedAt: new Date() },
      { upsert: true, new: true }
    );
    return emptyState;
  }

  const patterns = [];
  const confidenceScores = {};

  const mondayLogs = logs.filter((log) => new Date(log.timestamp).getDay() === 1);
  if (mondayLogs.length >= 2) {
    const mondayStress = mondayLogs.reduce((sum, log) => sum + (log.stressLevel || 5), 0) / mondayLogs.length;
    const mondayMood = mondayLogs.reduce((sum, log) => sum + log.moodScore, 0) / mondayLogs.length;
    if (mondayStress >= 6.5 || mondayMood <= 4.5) {
      const confidence = clampConfidence(
        Math.min(1, mondayLogs.length / 6) * (mondayStress >= 6.5 ? 0.7 : 0.55)
      );
      patterns.push({
        type: "monday_stress",
        description: "Your Mondays tend to carry higher stress or lower mood than the rest of the week.",
        confidence,
      });
      confidenceScores.monday_stress = confidence;
    }
  }

  const sleepRelevant = logs.filter((log) => typeof log.sleepHours === "number");
  if (sleepRelevant.length >= 4) {
    const lowSleepLogs = sleepRelevant.filter((log) => log.sleepHours < 6);
    const restedLogs = sleepRelevant.filter((log) => log.sleepHours >= 7);

    if (lowSleepLogs.length >= 2 && restedLogs.length >= 2) {
      const lowSleepMood =
        lowSleepLogs.reduce((sum, log) => sum + log.moodScore, 0) / lowSleepLogs.length;
      const restedMood =
        restedLogs.reduce((sum, log) => sum + log.moodScore, 0) / restedLogs.length;

      if (restedMood - lowSleepMood >= 1) {
        const confidence = clampConfidence(
          Math.min(1, lowSleepLogs.length / 5) * Math.min(1, (restedMood - lowSleepMood) / 2.5)
        );
        patterns.push({
          type: "sleep_related_mood_decline",
          description: "Your mood tends to dip after shorter sleep nights.",
          confidence,
        });
        confidenceScores.sleep_related_mood_decline = confidence;
      }
    }
  }

  const lowSocialLogs = logs.filter((log) => log.socialInteractionLevel === "low");
  if (lowSocialLogs.length >= 3) {
    const lowSocialMood =
      lowSocialLogs.reduce((sum, log) => sum + log.moodScore, 0) / lowSocialLogs.length;
    if (lowSocialMood <= 5) {
      const confidence = clampConfidence(
        Math.min(1, lowSocialLogs.length / 6) * Math.min(1, (6 - lowSocialMood) / 2)
      );
      patterns.push({
        type: "social_isolation_pattern",
        description: "Periods of low social interaction are often followed by lower mood.",
        confidence,
      });
      confidenceScores.social_isolation_pattern = confidence;
    }
  }

  const lateNightLogs = logs.filter((log) => {
    const hour = new Date(log.timestamp).getHours();
    return hour >= 21 || hour < 4;
  });
  if (lateNightLogs.length >= 2) {
    const anxiousNightLogs = lateNightLogs.filter((log) =>
      ["anxious", "stressed", "overwhelmed"].includes(log.emotionTag)
    );
    if (anxiousNightLogs.length / lateNightLogs.length >= 0.5) {
      const confidence = clampConfidence(anxiousNightLogs.length / lateNightLogs.length);
      patterns.push({
        type: "night_anxiety",
        description: "Late-night check-ins often come with anxiety or overload signals.",
        confidence,
      });
      confidenceScores.night_anxiety = confidence;
    }
  }

  const strongActivities = effectiveness.filter(
    (item) => item.totalShown >= 3 && item.effectivenessWeight >= 1.2
  );
  const weakActivities = effectiveness.filter(
    (item) => item.totalShown >= 3 && item.effectivenessWeight <= 0.85
  );

  if (strongActivities.length) {
    const confidence = clampConfidence(
      Math.min(0.9, strongActivities.length / Math.max(1, effectiveness.length || 1))
    );
    patterns.push({
      type: "recommendation_effectiveness_positive",
      description: `You respond well to ${strongActivities
        .slice(0, 3)
        .map((item) => item.activityType.replace(/_/g, " "))
        .join(", ")} activities.`,
      confidence,
    });
    confidenceScores.recommendation_effectiveness_positive = confidence;
  }

  if (weakActivities.length) {
    const confidence = clampConfidence(
      Math.min(0.85, weakActivities.length / Math.max(1, effectiveness.length || 1))
    );
    patterns.push({
      type: "recommendation_effectiveness_negative",
      description: `Some activity types are repeatedly skipped, especially ${weakActivities
        .slice(0, 3)
        .map((item) => item.activityType.replace(/_/g, " "))
        .join(", ")}.`,
      confidence,
    });
    confidenceScores.recommendation_effectiveness_negative = confidence;
  }

  const userPatterns = await UserPattern.findOneAndUpdate(
    { userId },
    {
      patterns,
      confidenceScores,
      generatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return userPatterns;
};

export const getUserPatterns = async (userId) => {
  const existing = await UserPattern.findOne({ userId }).lean();
  if (existing) {
    return existing;
  }
  return detectUserPatterns(userId);
};

import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.model.js";
import UserTrait from "../models/UserTrait.model.js";
import UserPattern from "../models/UserPattern.model.js";
import UserInsight from "../models/UserInsight.model.js";
import MoodLog from "../models/MoodLog.model.js";
import Recommendation from "../models/Recommendation.model.js";
import RecommendationEffectiveness from "../models/RecommendationEffectiveness.model.js";
import Resource from "../models/Resource.model.js";
import recommendationDataset from "../data/recommendationDataset.js";
import { hashPassword } from "../services/password.service.js";
import { detectUserPatterns } from "../services/patternDetection.service.js";
import { generateUserInsight } from "../services/insight.service.js";
import { forecastMood } from "../services/forecasting.service.js";

const EMAIL = "raj.demo@mindease.app";
const PASSWORD = "Raj@MindEase2026";

const resourceTemplates = [
  {
    title: "A quiet start breathing guide",
    category: "meditation",
    contentURL: "https://mindease.app/demo/breathing-guide",
    description: "A short guided breathing routine for tense mornings and busy afternoons.",
  },
  {
    title: "Journaling prompts for heavy days",
    category: "journaling",
    contentURL: "https://mindease.app/demo/journaling-prompts",
    description: "Gentle prompts for days that feel noisy, flat, or emotionally overloaded.",
  },
  {
    title: "Walking for emotional reset",
    category: "exercise",
    contentURL: "https://mindease.app/demo/mindful-walk",
    description: "A mindful walking resource focused on calm pacing and sensory grounding.",
  },
  {
    title: "What to do when nights feel restless",
    category: "articles",
    contentURL: "https://mindease.app/demo/night-restlessness",
    description: "A simple article on late-night worry, overstimulation, and calming routines.",
  },
  {
    title: "FAQ: why mood changes through the week",
    category: "faqs",
    contentURL: "https://mindease.app/demo/mood-faq",
    description: "An easy explanation of routine stress, sleep, and emotional variability.",
  },
  {
    title: "Soft music ritual for anxious evenings",
    category: "meditation",
    contentURL: "https://mindease.app/demo/music-ritual",
    description: "A grounding audio ritual using calm music and low-pressure breathing.",
  },
  {
    title: "Reflection after social burnout",
    category: "journaling",
    contentURL: "https://mindease.app/demo/social-burnout-reflection",
    description: "A resource for naming exhaustion after long days of people and noise.",
  },
  {
    title: "Reset stretches between screen-heavy sessions",
    category: "exercise",
    contentURL: "https://mindease.app/demo/stretch-break",
    description: "Five easy movements to reduce body tension and mental fatigue.",
  },
];

const activityBias = {
  anxious: ["breathing_reset", "grounding_music", "sleep_winddown", "digital_detox"],
  sad: ["chai_reflection", "gratitude_journaling", "terrace_walk", "family_check_in"],
  angry: ["stretch_break", "terrace_walk", "grounding_music", "creative_reset"],
  calm: ["gratitude_journaling", "mindful_meal", "yoga_flow", "sunlight_walk"],
  happy: ["sunlight_walk", "yoga_flow", "family_check_in", "creative_reset"],
  excited: ["creative_reset", "friend_voice_note", "sunlight_walk", "yoga_flow"],
  neutral: ["mindful_meal", "chai_reflection", "stretch_break", "terrace_walk"],
  tired: ["sleep_winddown", "breathing_reset", "hydration_pause", "digital_detox"],
  stressed: ["breathing_reset", "stretch_break", "digital_detox", "mindful_meal"],
  overwhelmed: ["breathing_reset", "sleep_winddown", "grounding_music", "digital_detox"],
};

const emotions = ["happy", "sad", "anxious", "calm", "neutral", "angry", "excited", "tired", "stressed", "overwhelmed"];
const socialLevels = ["low", "medium", "high"];

const mulberry32 = (seed) => {
  let t = seed;
  return () => {
    t += 0x6D2B79F5;
    let value = Math.imul(t ^ (t >>> 15), t | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const pickFrom = (items, random) => items[Math.floor(random() * items.length)];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const buildTimestamp = (dayDate, slotIndex, countForDay) => {
  const slotHours = [7, 10, 13, 18, 22];
  const hour = slotHours[Math.min(slotIndex, slotHours.length - 1)];
  const timestamp = new Date(dayDate);
  timestamp.setHours(hour, 10 + slotIndex * 7 + (countForDay % 5), 0, 0);
  return timestamp;
};

const buildMoodLogPayload = ({ dayIndex, slotIndex, dayDate, random }) => {
  const dayOfWeek = dayDate.getDay();
  const cycle = dayIndex % 14;

  let moodScore;
  if (dayOfWeek === 1) {
    moodScore = 3 + Math.floor(random() * 4);
  } else if (cycle < 3) {
    moodScore = 2 + Math.floor(random() * 4);
  } else if (cycle < 7) {
    moodScore = 4 + Math.floor(random() * 4);
  } else if (cycle < 11) {
    moodScore = 5 + Math.floor(random() * 4);
  } else {
    moodScore = 3 + Math.floor(random() * 6);
  }

  if (slotIndex >= 3 && moodScore <= 6 && random() > 0.5) {
    moodScore += 1;
  }
  moodScore = clamp(moodScore, 1, 10);

  let emotionTag;
  if (moodScore <= 2) {
    emotionTag = pickFrom(["overwhelmed", "sad", "anxious"], random);
  } else if (moodScore <= 4) {
    emotionTag = pickFrom(["anxious", "stressed", "sad", "angry", "tired"], random);
  } else if (moodScore <= 6) {
    emotionTag = pickFrom(["neutral", "calm", "tired", "stressed"], random);
  } else if (moodScore <= 8) {
    emotionTag = pickFrom(["calm", "happy", "neutral", "excited"], random);
  } else {
    emotionTag = pickFrom(["happy", "excited", "calm"], random);
  }

  const sleepHours = clamp(
    Number(
      (
        5.2 +
        (moodScore >= 7 ? 1.8 : 0.8) +
        (dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 0) +
        (random() * 1.9 - 0.7)
      ).toFixed(1)
    ),
    3.5,
    9.5
  );

  const stressLevel = clamp(
    Math.round(9 - moodScore + (dayOfWeek === 1 ? 1 : 0) + (random() * 2 - 1)),
    1,
    10
  );

  const screenTime = clamp(
    Number(
      (
        3.5 +
        (dayOfWeek >= 1 && dayOfWeek <= 5 ? 2.7 : 1.5) +
        (stressLevel >= 7 ? 1.1 : 0.4) +
        (random() * 2.2 - 0.9)
      ).toFixed(1)
    ),
    1,
    10
  );

  const socialInteractionLevel =
    moodScore <= 3
      ? pickFrom(["low", "low", "medium"], random)
      : moodScore >= 8
        ? pickFrom(["medium", "high", "high"], random)
        : pickFrom(socialLevels, random);

  const notes = [
    `Check-in ${slotIndex + 1}: ${emotionTag} mood after a ${dayOfWeek === 1 ? "busy Monday" : "regular"} routine.`,
    moodScore <= 4
      ? "Needed a calmer pace today and responded better to low-pressure activities."
      : moodScore >= 8
        ? "Felt open to movement, structure, and light social connection."
        : "Mood stayed mixed but manageable with short resets during the day.",
  ].join(" ");

  return {
    timestamp: buildTimestamp(dayDate, slotIndex, 1),
    moodScore,
    emotionTag,
    notes,
    activityDone: true,
    sleepHours,
    screenTime,
    socialInteractionLevel,
    stressLevel,
  };
};

const buildActivitiesForEmotion = (emotionTag, random) => {
  const preferred = activityBias[emotionTag] || ["breathing_reset", "terrace_walk", "mindful_meal"];
  const activityTypes = [...new Set([...preferred, ...recommendationDataset.map((item) => item.activityType)])]
    .slice(0);

  const chosen = [];
  for (const activityType of activityTypes) {
    if (chosen.length >= 4) break;
    if (preferred.includes(activityType) || random() > 0.65) {
      chosen.push(activityType);
    }
  }

  return chosen.slice(0, 4).map((activityType, index) => {
    const datasetItem = recommendationDataset.find((item) => item.activityType === activityType);
    return {
      activityType,
      recommendationScore: Number((145 - index * 12 + random() * 25).toFixed(2)),
      personalizedTitle: datasetItem?.title || activityType.replace(/_/g, " "),
      personalizedDescription: datasetItem?.description || "Supportive activity selected from the demo wellness pool.",
      relevanceContext: `worked well for Raj's ${emotionTag} patterns and similar moments`,
      accepted: true,
      completed: true,
      ignored: false,
      actedAt: null,
    };
  });
};

const upsertEffectivenessMap = (effectivenessMap, activities) => {
  activities.forEach((activity) => {
    const existing =
      effectivenessMap.get(activity.activityType) ||
      {
        activityType: activity.activityType,
        totalShown: 0,
        totalAccepted: 0,
        totalCompleted: 0,
        totalIgnored: 0,
      };

    existing.totalShown += 1;
    existing.totalAccepted += 1;
    existing.totalCompleted += 1;
    effectivenessMap.set(activity.activityType, existing);
  });
};

const buildEffectivenessWeight = (row) => {
  const acceptanceRate = row.totalShown ? row.totalAccepted / row.totalShown : 0;
  const completionRate = row.totalShown ? row.totalCompleted / row.totalShown : 0;
  const ignoreRate = row.totalShown ? row.totalIgnored / row.totalShown : 0;
  return clamp(Number((1 + acceptanceRate * 0.35 + completionRate * 0.65 - ignoreRate * 0.45).toFixed(2)), 0.5, 2.2);
};

const main = async () => {
  await connectDB();

  const existingUser = await User.findOne({ email: EMAIL }).select("_id");
  if (existingUser) {
    await Promise.all([
      UserTrait.deleteOne({ userId: existingUser._id }),
      UserPattern.deleteOne({ userId: existingUser._id }),
      UserInsight.deleteOne({ userId: existingUser._id }),
      MoodLog.deleteMany({ userId: existingUser._id }),
      Recommendation.deleteMany({ userId: existingUser._id }),
      RecommendationEffectiveness.deleteMany({ userId: existingUser._id }),
      Resource.deleteMany({ createdBy: existingUser._id }),
      User.deleteOne({ _id: existingUser._id }),
    ]);
  }

  const user = await User.create({
    firstName: "Raj",
    lastName: "Sharma",
    email: EMAIL,
    password: await hashPassword(PASSWORD),
    preferences: {
      exercise: true,
      music: true,
      meditation: true,
    },
  });

  await UserTrait.create({
    userId: user._id,
    traits: {
      socialEnergy: -0.4,
      stressSensitivity: 1.2,
      emotionalExpression: -0.2,
      routinePreference: 1.1,
      creativity: 0.8,
      copingStyle: "reflective",
      connectionPreference: "small_circle",
      personalityStyle: "ambivert_reflective",
    },
    confidenceScores: {
      socialEnergy: 3.1,
      stressSensitivity: 3.5,
      emotionalExpression: 2.8,
      routinePreference: 3.2,
      creativity: 2.7,
      copingStyle: { reflective: 4.1 },
      connectionPreference: { small_circle: 3.9 },
      personalityStyle: { ambivert_reflective: 4.2 },
    },
    onboardingCompleted: true,
    onboardingVersion: Number(process.env.ONBOARDING_VERSION || 1),
    needsOnboardingUpgrade: false,
    lastUpdated: new Date(),
  });

  const random = mulberry32(9172026);
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 59);
  startDate.setHours(0, 0, 0, 0);

  const moodLogs = [];
  const recommendations = [];
  const effectivenessMap = new Map();

  for (let dayIndex = 0; dayIndex < 60; dayIndex += 1) {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + dayIndex);

    const logsToday = 1 + Math.floor(random() * 5);

    for (let slotIndex = 0; slotIndex < logsToday; slotIndex += 1) {
      const payload = buildMoodLogPayload({ dayIndex, slotIndex, dayDate, random });
      payload.timestamp = buildTimestamp(dayDate, slotIndex, logsToday);

      const moodLog = new MoodLog({
        userId: user._id,
        ...payload,
      });

      moodLogs.push(moodLog);

      const activities = buildActivitiesForEmotion(payload.emotionTag, random).map((activity) => ({
        ...activity,
        actedAt: new Date(payload.timestamp.getTime() + 60 * 60 * 1000),
      }));

      upsertEffectivenessMap(effectivenessMap, activities);

      const averageScore = activities.reduce((sum, item) => sum + item.recommendationScore, 0) / activities.length;
      const dominantPatterns = [];
      if (payload.stressLevel >= 7) dominantPatterns.push("high_stress");
      if (payload.sleepHours < 6) dominantPatterns.push("low_sleep");
      if (payload.socialInteractionLevel === "low") dominantPatterns.push("low_social_energy");

      recommendations.push(
        new Recommendation({
          userId: user._id,
          activities,
          recommendationContext: {
            moodScore: payload.moodScore,
            emotionTag: payload.emotionTag,
            dominantPatterns,
            daySegment: payload.timestamp.getHours() >= 18 ? "night" : payload.timestamp.getHours() >= 12 ? "afternoon" : "morning",
            generatedFromMoodLogId: moodLog._id,
            forecastTrend: payload.moodScore >= 6 ? "stable" : "improving",
            forecastMood: clamp(payload.moodScore + 1, 1, 10),
            contextReasons: ["seeded_demo_history", "consistent_app_use", "completed_wellness_actions"],
          },
          source: "deterministic_engine",
          status: "completed",
          effectivenessScore: Number(clamp(0.82 + averageScore / 1000, 0.7, 1).toFixed(2)),
          createdAt: payload.timestamp,
          updatedAt: new Date(payload.timestamp.getTime() + 90 * 60 * 1000),
        })
      );
    }
  }

  await MoodLog.insertMany(moodLogs, { ordered: true });
  await Recommendation.insertMany(recommendations, { ordered: true });

  const effectivenessDocs = [...effectivenessMap.values()].map((row) => ({
    userId: user._id,
    activityType: row.activityType,
    totalShown: row.totalShown,
    totalAccepted: row.totalAccepted,
    totalCompleted: row.totalCompleted,
    totalIgnored: row.totalIgnored,
    effectivenessWeight: buildEffectivenessWeight(row),
    updatedAt: now,
    createdAt: now,
  }));
  await RecommendationEffectiveness.insertMany(effectivenessDocs, { ordered: true });

  await Resource.insertMany(
    resourceTemplates.map((resource, index) => ({
      ...resource,
      createdBy: user._id,
      createdAt: new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000),
      updatedAt: new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000),
    }))
  );

  await detectUserPatterns(user._id);
  await generateUserInsight(user._id);
  const forecast = await forecastMood(user._id);

  console.log(
    JSON.stringify(
      {
        email: EMAIL,
        password: PASSWORD,
        userId: String(user._id),
        moodLogsCreated: moodLogs.length,
        recommendationsCreated: recommendations.length,
        resourcesCreated: resourceTemplates.length,
        forecast,
      },
      null,
      2
    )
  );

  await mongoose.connection.close();
};

main().catch(async (error) => {
  console.error("Failed to create Raj demo user:", error);
  await mongoose.connection.close();
  process.exit(1);
});

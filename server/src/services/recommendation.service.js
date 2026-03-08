import { getActivitySuggestions } from "../ml/apiClient.js";
import {
  generateDynamicRecommendations,
  generateDynamicTips,
} from "./ai.service.js";
import MoodLog from "../models/MoodLog.model.js";
import Recommendation from "../models/Recommendation.model.js";
import User from "../models/User.model.js";

export const generatePersonalizedRecommendation = async (userId) => {
  // Fetch the latest mood log
  const lastLog = await MoodLog.findOne({ userId }).sort({
    date: -1,
    createdAt: -1,
  });

  if (!lastLog) return null;

  // Get user preferences
  const user = await User.findById(userId).select("preferences");
  const preferences = user?.preferences || {
    exercise: true,
    music: true,
    meditation: true,
  };

  const preferenceFilters = {
    exercise: ["workout", "walk", "yoga", "stretching", "nature_walk"],
    music: ["music"],
    meditation: ["meditation", "breathing", "yoga"],
  };

  const calmPool = [
    "breathing",
    "meditation",
    "gratitude",
    "digital_detox",
    "therapy_check_in",
  ];
  const balancedPool = [
    "walk",
    "journaling",
    "music",
    "stretching",
    "mindful_eating",
  ];
  const energizedPool = [
    "workout",
    "yoga",
    "creative",
    "social_check_in",
    "nature_walk",
  ];

  let finalSuggestions = [];

  // Generate dynamic recommendations using Gemini
  try {
    const dynamicRecs = await generateDynamicRecommendations(
      lastLog.moodScore,
      lastLog.emotionTag,
      preferences,
    );

    if (dynamicRecs && Array.isArray(dynamicRecs) && dynamicRecs.length > 0) {
      finalSuggestions = dynamicRecs;
    }
  } catch (err) {
    console.error("Gemini dynamic recommendation error:", err.message);
  }

  // Fallback if AI fails or returns empty
  if (finalSuggestions.length === 0) {
    let baseSuggestions = [];
    if (lastLog.moodScore <= 4) {
      baseSuggestions = calmPool;
    } else if (lastLog.moodScore <= 6) {
      baseSuggestions = balancedPool;
    } else {
      baseSuggestions = energizedPool;
    }
    finalSuggestions = baseSuggestions.slice(0, 6);
  }

  // Check if recommendation already exists for this mood log
  let recommendation = await Recommendation.findOne({
    userId,
    moodLogId: lastLog._id,
  });

  if (recommendation) {
    recommendation.suggestedActivities = finalSuggestions;
    recommendation.status = "pending";
    await recommendation.save();
  } else {
    recommendation = await Recommendation.create({
      userId,
      moodLogId: lastLog._id,
      suggestedActivities: finalSuggestions,
    });
  }

  return recommendation;
};

export const getGeneralRecommendations = async (userId) => {
  const fallbackTips = [
    "Drink a glass of water and stretch for two minutes",
    "Take a mindful nature walk and notice five calming details",
    "Practice a 4-7-8 breathing cycle for five rounds",
    "Write down three thoughts you're grateful for today",
    "Listen to a soothing playlist while focusing on your breath",
    "Do a guided body scan or gentle yoga flow",
    "Schedule a quick check-in with a friend or loved one",
    "Spend five minutes in sunlight to reset your energy",
    "Disconnect from screens for 30 minutes and read something uplifting",
    "Plan a nourishing meal or snack and eat it mindfully",
  ];

  try {
    const lastLog = await MoodLog.findOne({ userId }).sort({
      date: -1,
      createdAt: -1,
    });

    const moodScore = lastLog ? lastLog.moodScore : null;
    const emotionTag = lastLog ? lastLog.emotionTag : null;

    const dynamicTips = await generateDynamicTips(moodScore, emotionTag);
    if (dynamicTips && Array.isArray(dynamicTips) && dynamicTips.length > 0) {
      return dynamicTips;
    }
  } catch (err) {
    console.error("Error fetching dynamic tips:", err.message);
  }

  return fallbackTips;
};

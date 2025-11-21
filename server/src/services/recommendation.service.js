import axios from "axios";
import { getActivitySuggestions } from "../ml/apiClient.js";
import MoodLog from "../models/MoodLog.model.js";
import Recommendation from "../models/Recommendation.model.js";

export const generatePersonalizedRecommendation = async (userId) => {
  // Fetch the latest mood log
  const lastLog = await MoodLog.findOne({ userId }).sort({ createdAt: -1 });

  if (!lastLog) return null;

  const payload = {
    moodScore: lastLog.moodScore,
    emotionTag: lastLog.emotionTag,
  };

  // --------------------------------------------
  // HIT PYTHON/ML API SERVICE (Optional)
  // --------------------------------------------
  let aiSuggestions = [];
  try {
    const data = await getActivitySuggestions(
      lastLog.moodScore,
      lastLog.emotionTag
    );
    aiSuggestions = data?.suggestions || [];
  } catch {
    aiSuggestions = ["breathing", "walk", "journaling"]; // fallback
  }

  // Save recommendation entry
  const recommendation = await Recommendation.create({
    userId,
    moodLogId: lastLog._id,
    suggestedActivities: aiSuggestions,
  });

  return recommendation;
};

export const getGeneralRecommendations = () => {
  return [
    "Drink water",
    "Take a 10-min walk",
    "Practice deep breathing",
    "Write down your thoughts",
    "Listen to calming music",
    "Do a short stretching routine",
    "Take a mindful pause",
  ];
};

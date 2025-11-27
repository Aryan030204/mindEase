import { getActivitySuggestions } from "../ml/apiClient.js";
import MoodLog from "../models/MoodLog.model.js";
import Recommendation from "../models/Recommendation.model.js";
import User from "../models/User.model.js";

export const generatePersonalizedRecommendation = async (userId) => {
  // Fetch the latest mood log
  const lastLog = await MoodLog.findOne({ userId }).sort({ date: -1, createdAt: -1 });

  if (!lastLog) return null;

  // Get user preferences
  const user = await User.findById(userId).select("preferences");
  const preferences = user?.preferences || {
    exercise: true,
    music: true,
    meditation: true,
  };

  // Base recommendations based on mood
  let baseSuggestions = [];
  
  if (lastLog.moodScore <= 4) {
    // Low mood - suggest uplifting activities
    baseSuggestions = ["meditation", "music", "breathing"];
    if (preferences.exercise) baseSuggestions.push("workout");
  } else if (lastLog.moodScore <= 6) {
    // Medium mood - balanced activities
    baseSuggestions = ["walk", "journaling", "breathing"];
    if (preferences.music) baseSuggestions.push("music");
  } else {
    // High mood - maintain positive state
    baseSuggestions = ["workout", "music", "journaling"];
    if (preferences.exercise && !baseSuggestions.includes("workout")) {
      baseSuggestions.push("workout");
    }
  }

  // --------------------------------------------
  // HIT PYTHON/ML API SERVICE (Optional)
  // --------------------------------------------
  let aiSuggestions = [];
  try {
    const data = await getActivitySuggestions(
      lastLog.moodScore,
      lastLog.emotionTag
    );
    if (data?.suggestions && Array.isArray(data.suggestions)) {
      aiSuggestions = data.suggestions;
    } else {
      aiSuggestions = baseSuggestions;
    }
  } catch (err) {
    console.error("ML recommendation error:", err.message);
    aiSuggestions = baseSuggestions; // fallback to base suggestions
  }

  // Filter suggestions based on user preferences
  const filteredSuggestions = aiSuggestions.filter((activity) => {
    if (activity === "workout" || activity === "walk") return preferences.exercise;
    if (activity === "music") return preferences.music;
    if (activity === "meditation" || activity === "breathing") return preferences.meditation;
    return true; // journaling and others are always allowed
  });

  // If no suggestions after filtering, use base suggestions
  const finalSuggestions = filteredSuggestions.length > 0 
    ? filteredSuggestions 
    : baseSuggestions;

  // Check if recommendation already exists for this mood log
  let recommendation = await Recommendation.findOne({
    userId,
    moodLogId: lastLog._id,
  });

  if (recommendation) {
    // Update existing recommendation
    recommendation.suggestedActivities = finalSuggestions;
    recommendation.status = "pending"; // Reset status when regenerating
    await recommendation.save();
  } else {
    // Create new recommendation
    recommendation = await Recommendation.create({
      userId,
      moodLogId: lastLog._id,
      suggestedActivities: finalSuggestions,
    });
  }

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

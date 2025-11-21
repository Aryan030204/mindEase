import axios from "axios";
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
    const { data } = await axios.post(process.env.AI_API_URL, payload, {
      timeout: 5000,
    });

    aiSuggestions = data?.suggestions || [];
  } catch (err) {
    console.log("AI API Error:", err.message);

    // fallback if ML API fails
    if (lastLog.moodScore <= 4) {
      aiSuggestions = ["meditation", "breathing", "journaling"];
    } else {
      aiSuggestions = ["music", "walk"];
    }
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

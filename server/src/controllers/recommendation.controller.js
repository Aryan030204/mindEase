import asyncHandler from "../utils/asyncHandler.js";
import {
  generatePersonalizedRecommendation,
  getGeneralRecommendations,
} from "../services/recommendation.service.js";

// -----------------------------------------------------
// Fetch Personalized Recommendation
// -----------------------------------------------------
export const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const recommendation = await generatePersonalizedRecommendation(userId);

  if (!recommendation) {
    return res.status(404).json({
      message: "No mood log found. Please log your mood first.",
    });
  }

  return res.status(200).json({
    message: "Personalized recommendations fetched",
    recommendation,
  });
});

// -----------------------------------------------------
// Fetch General Wellness Recommendations
// -----------------------------------------------------
export const getGeneralWellness = asyncHandler(async (req, res) => {
  const tips = getGeneralRecommendations();

  return res.status(200).json({
    message: "General recommendations fetched",
    tips,
  });
});

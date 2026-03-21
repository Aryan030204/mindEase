import asyncHandler from "../utils/asyncHandler.js";
import { generateUserInsight, detectPatterns, forecastMood } from "../services/insight.service.js";

export const getInsightsProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const insight = await generateUserInsight(userId);

  if (!insight) {
    return res.status(200).json({
      success: true,
      message: "Not enough mood logs to generate insights. Please log your mood regularly.",
      insight: null,
    });
  }

  res.status(200).json({
    success: true,
    message: "User insights fetched successfully",
    insight,
  });
});

export const getPatterns = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const patterns = await detectPatterns(userId);

  res.status(200).json({
    success: true,
    message: "Patterns detected successfully",
    patterns,
  });
});

export const getForecast = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const forecast = await forecastMood(userId);

  res.status(200).json({
    success: true,
    message: "Mood forecast generated successfully",
    forecast,
  });
});

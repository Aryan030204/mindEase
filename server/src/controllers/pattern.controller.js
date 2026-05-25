import asyncHandler from "../utils/asyncHandler.js";
import { detectUserPatterns, getUserPatterns } from "../services/patternDetection.service.js";
import { forecastMood } from "../services/forecasting.service.js";

export const getPatternSummary = asyncHandler(async (req, res) => {
  const patterns = await getUserPatterns(req.user._id);

  res.status(200).json({
    success: true,
    message: "Behavioral patterns fetched successfully",
    patterns,
  });
});

export const refreshPatterns = asyncHandler(async (req, res) => {
  const patterns = await detectUserPatterns(req.user._id);

  res.status(200).json({
    success: true,
    message: "Behavioral patterns refreshed successfully",
    patterns,
  });
});

export const getMoodForecast = asyncHandler(async (req, res) => {
  const forecast = await forecastMood(req.user._id);

  res.status(200).json({
    success: true,
    message: "Mood forecast generated successfully",
    forecast,
  });
});

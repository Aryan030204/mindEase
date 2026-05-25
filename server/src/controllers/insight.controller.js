import asyncHandler from "../utils/asyncHandler.js";
import { buildUserAnonymizedProfile } from "../services/collectiveAggregation.service.js";
import { buildCollectiveInsightSummary } from "../services/collectiveLearning.service.js";
import { generateUserInsight } from "../services/insight.service.js";
import { getUserPatterns } from "../services/patternDetection.service.js";
import { forecastMood } from "../services/forecasting.service.js";

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

  const patterns = await getUserPatterns(userId);

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

export const getCollectiveSummary = asyncHandler(async (req, res) => {
  const userProfile = await buildUserAnonymizedProfile(req.user._id);
  const summary = await buildCollectiveInsightSummary(userProfile);

  res.status(200).json({
    success: true,
    message: "Collective insight summary fetched successfully",
    summary,
  });
});

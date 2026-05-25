import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import Recommendation from "../models/Recommendation.model.js";
import recommendationDataset from "../data/recommendationDataset.js";
import {
  generatePersonalizedRecommendation,
  updateRecommendationFeedback,
} from "../services/recommendationEngine.service.js";

const toObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : value;

export const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  const recommendation = await generatePersonalizedRecommendation(toObjectId(req.user.id));

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

export const getRecommendationHistory = asyncHandler(async (req, res) => {
  const history = await Recommendation.find({ userId: toObjectId(req.user.id) })
    .sort({ createdAt: -1 })
    .limit(20);

  return res.status(200).json({
    message: "Recommendation history fetched",
    history,
  });
});

export const getGeneralWellness = asyncHandler(async (req, res) => {
  const suggestions = recommendationDataset
    .filter((activity) => activity.intensityLevel === "low")
    .slice(0, 6)
    .map((activity) => ({
      activityType: activity.activityType,
      title: activity.title,
      description: activity.description,
    }));

  return res.status(200).json({
    message: "Daily wellness suggestions fetched",
    suggestions,
  });
});

export const updateRecommendationStatus = asyncHandler(async (req, res) => {
  const recommendation = await updateRecommendationFeedback({
    userId: req.user.id,
    recommendationId: toObjectId(req.params.recommendationId),
    activityId: toObjectId(req.params.activityId),
    action: req.body.action,
  });

  return res.status(200).json({
    message: "Recommendation feedback updated successfully",
    recommendation,
  });
});

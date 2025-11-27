import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import Recommendation from "../models/Recommendation.model.js";
import {
  generatePersonalizedRecommendation,
  getGeneralRecommendations,
} from "../services/recommendation.service.js";

// -----------------------------------------------------
// Fetch Personalized Recommendation
// -----------------------------------------------------
export const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Convert to ObjectId if needed
  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  const recommendation = await generatePersonalizedRecommendation(userObjectId);

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

// -----------------------------------------------------
// Update Recommendation Status
// -----------------------------------------------------
export const updateRecommendationStatus = asyncHandler(async (req, res) => {
  const { recommendationId } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  const validStatuses = ["accepted", "ignored", "completed", "pending"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status. Must be one of: accepted, ignored, completed, pending",
    });
  }

  const mongoose = (await import("mongoose")).default;
  const recObjectId = mongoose.Types.ObjectId.isValid(recommendationId)
    ? new mongoose.Types.ObjectId(recommendationId)
    : recommendationId;

  const recommendation = await Recommendation.findOne({
    _id: recObjectId,
    userId,
  });

  if (!recommendation) {
    return res.status(404).json({
      message: "Recommendation not found",
    });
  }

  recommendation.status = status;
  await recommendation.save();

  return res.status(200).json({
    message: "Recommendation status updated successfully",
    recommendation,
  });
});

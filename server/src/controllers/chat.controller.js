import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import Conversation from "../models/Conversation.model.js";
import { askAI } from "../services/ai.service.js";

// -----------------------------------------------------
// SEND USER QUERY → AI BOT RESPONSE + SAVE CHAT
// -----------------------------------------------------
export const sendChatQuery = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { message } = req.body;

  // Convert to ObjectId if needed
  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  // Get conversation history for context
  let conversation = await Conversation.findOne({ userId: userObjectId });
  const conversationHistory = conversation?.messages || [];

  // Get AI response from Gemini API with conversation context
  const aiReply = await askAI(message, conversationHistory);

  // Find existing conversation or create new one
  if (!conversation) {
    conversation = await Conversation.create({
      userId: userObjectId,
      messages: [],
    });
  }

  // Push user message
  conversation.messages.push({
    sender: "user",
    text: message.trim(),
  });

  // Push AI response
  conversation.messages.push({
    sender: "bot",
    text: aiReply,
  });

  // Limit conversation history to last 100 messages to prevent bloating
  if (conversation.messages.length > 100) {
    conversation.messages = conversation.messages.slice(-100);
  }

  await conversation.save();

  return res.status(200).json({
    message: "Reply generated",
    reply: aiReply,
    conversationId: conversation._id,
  });
});

// -----------------------------------------------------
// GET USER CHAT HISTORY
// -----------------------------------------------------
export const getChatHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 50 } = req.query;

  // Convert to ObjectId if needed
  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  const conversation = await Conversation.findOne({ userId: userObjectId });

  if (!conversation || !conversation.messages.length) {
    return res.status(200).json({ messages: [] });
  }

  // Return last N messages
  const messages = conversation.messages.slice(-parseInt(limit));

  return res.status(200).json({
    messages,
    total: conversation.messages.length,
  });
});

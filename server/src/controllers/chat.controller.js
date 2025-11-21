import asyncHandler from "../utils/asyncHandler.js";
import Conversation from "../models/Conversation.model.js";
import { askAI } from "../services/ai.service.js";

// -----------------------------------------------------
// SEND USER QUERY → AI BOT RESPONSE + SAVE CHAT
// -----------------------------------------------------
export const sendChatQuery = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { message } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ message: "Message cannot be empty" });
  }

  // Get AI response
  const aiReply = await askAI(message);

  // Find existing conversation or create new one
  let conversation = await Conversation.findOne({ userId });

  if (!conversation) {
    conversation = await Conversation.create({
      userId,
      messages: [],
    });
  }

  // Push user message
  conversation.messages.push({
    sender: "user",
    text: message,
  });

  // Push AI response
  conversation.messages.push({
    sender: "bot",
    text: aiReply,
  });

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

  const conversation = await Conversation.findOne({ userId });

  if (!conversation) {
    return res.status(200).json({ messages: [] });
  }

  return res.status(200).json({
    messages: conversation.messages,
  });
});

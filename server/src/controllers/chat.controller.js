import mongoose from "mongoose";
import Conversation from "../models/Conversation.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateChatReply } from "../services/ai.service.js";
import { buildChatContext } from "../services/chatContext.service.js";
import { pushList } from "../services/redis.service.js";
import { sanitizeText } from "../utils/sanitize.js";

const CHAT_CONTEXT_TTL = 60 * 60;

const toObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : value;

export const sendChatQuery = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userObjectId = toObjectId(userId);
  const safeMessage = sanitizeText(req.body.message, 2000);

  const [conversation, chatContext] = await Promise.all([
    Conversation.findOne({ userId: userObjectId }),
    buildChatContext(userObjectId),
  ]);

  const aiReply = await generateChatReply({
    message: safeMessage,
    context: chatContext,
  });

  const activeConversation =
    conversation ||
    (await Conversation.create({
      userId: userObjectId,
      messages: [],
    }));

  activeConversation.messages.push({
    sender: "user",
    text: safeMessage,
  });
  activeConversation.messages.push({
    sender: "bot",
    text: aiReply,
  });

  if (activeConversation.messages.length > 100) {
    activeConversation.messages = activeConversation.messages.slice(-100);
  }

  await activeConversation.save();

  await Promise.all([
    pushList(
      `chat-context:${userId}`,
      { sender: "user", text: safeMessage, timestamp: new Date().toISOString() },
      CHAT_CONTEXT_TTL,
      24
    ),
    pushList(
      `chat-context:${userId}`,
      { sender: "bot", text: aiReply, timestamp: new Date().toISOString() },
      CHAT_CONTEXT_TTL,
      24
    ),
  ]);

  return res.status(200).json({
    message: "Reply generated",
    reply: aiReply,
    context: chatContext,
    conversationId: activeConversation._id,
  });
});

export const getChatHistory = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOne({ userId: toObjectId(req.user.id) });
  const limit = parseInt(req.query.limit || 50, 10);

  if (!conversation || !conversation.messages.length) {
    return res.status(200).json({ messages: [] });
  }

  return res.status(200).json({
    messages: conversation.messages.slice(-limit),
    total: conversation.messages.length,
  });
});

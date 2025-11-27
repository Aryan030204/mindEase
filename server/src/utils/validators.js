import Joi from "joi";

export const signupSchema = Joi.object({
  firstName: Joi.string().max(50).required(),
  lastName: Joi.string().max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const moodLogSchema = Joi.object({
  moodScore: Joi.number().min(1).max(10).required(),
  emotionTag: Joi.string()
    .valid("happy", "sad", "anxious", "calm", "neutral", "angry", "excited")
    .required(),
  notes: Joi.string().max(500).allow(""),
  activityDone: Joi.boolean(),
  date: Joi.date().optional(), // Allow custom date for logging past moods
});

export const resourceAddSchema = Joi.object({
  title: Joi.string().max(200).required(),
  category: Joi.string()
    .valid("articles", "meditation", "journaling", "exercise", "faqs")
    .required(),
  contentURL: Joi.string().uri().required(),
  description: Joi.string().max(500).allow(""),
});

export const chatMessageSchema = Joi.object({
  message: Joi.string().trim().min(1).max(2000).required(),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().max(50),
  lastName: Joi.string().max(50),
  password: Joi.string().min(8),
  preferences: Joi.object({
    exercise: Joi.boolean(),
    music: Joi.boolean(),
    meditation: Joi.boolean(),
  }),
});

export const updateRecommendationStatusSchema = Joi.object({
  status: Joi.string()
    .valid("accepted", "ignored", "completed", "pending")
    .required(),
});

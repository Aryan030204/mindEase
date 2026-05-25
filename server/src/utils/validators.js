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

export const forgotPasswordRequestSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const forgotPasswordResetSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string()
    .pattern(/^\d{6}$/)
    .required(),
  newPassword: Joi.string().min(8).required(),
});

export const moodLogSchema = Joi.object({
  moodScore: Joi.number().min(1).max(10).required(),
  emotionTag: Joi.string()
    .valid(
      "happy",
      "sad",
      "anxious",
      "calm",
      "neutral",
      "angry",
      "excited",
      "tired",
      "stressed",
      "overwhelmed"
    )
    .required(),
  notes: Joi.string().max(500).allow(""),
  activityDone: Joi.boolean(),
  sleepHours: Joi.number().min(0).max(24).allow(null),
  screenTime: Joi.number().min(0).max(24).allow(null),
  socialInteractionLevel: Joi.string().valid("low", "medium", "high").default("medium"),
  stressLevel: Joi.number().min(1).max(10).allow(null),
  timestamp: Joi.date().optional(),
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
  action: Joi.string()
    .valid("accepted", "ignored", "completed")
    .required(),
});

export const objectIdParamSchema = Joi.object({
  recommendationId: Joi.string().hex().length(24).required(),
  activityId: Joi.string().hex().length(24).required(),
});

export const onboardingQuestionSchema = Joi.object({
  question: Joi.string().max(240).required(),
  description: Joi.string().max(400).allow(""),
  type: Joi.string().valid("single", "multi", "scale").default("single"),
  category: Joi.string().max(80).allow(""),
  options: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().max(200).required(),
        traitEffects: Joi.object().pattern(
          Joi.string(),
          Joi.alternatives(Joi.number(), Joi.string(), Joi.boolean(), Joi.object())
        ),
        weight: Joi.number().min(0.1).max(5).default(1),
      })
    )
    .min(2)
    .required(),
  tags: Joi.array().items(Joi.string().max(40)).default([]),
  followUpTriggers: Joi.array().items(
    Joi.object({
      trait: Joi.string().required(),
      operator: Joi.string()
        .valid("eq", "gte", "lte", "includes", "contains")
        .default("eq"),
      value: Joi.alternatives(Joi.string(), Joi.number(), Joi.boolean()).required(),
    })
  ),
  traitMappings: Joi.object().pattern(
    Joi.string(),
    Joi.alternatives(Joi.number(), Joi.string(), Joi.boolean(), Joi.object())
  ),
  isActive: Joi.boolean().default(true),
});

export const onboardingQuestionUpdateSchema = Joi.object({
  question: Joi.string().max(240),
  description: Joi.string().max(400).allow(""),
  type: Joi.string().valid("single", "multi", "scale"),
  category: Joi.string().max(80).allow(""),
  options: Joi.array().items(
    Joi.object({
      text: Joi.string().max(200).required(),
      traitEffects: Joi.object().pattern(
        Joi.string(),
        Joi.alternatives(Joi.number(), Joi.string(), Joi.boolean(), Joi.object())
      ),
      weight: Joi.number().min(0.1).max(5).default(1),
    })
  ),
  tags: Joi.array().items(Joi.string().max(40)),
  followUpTriggers: Joi.array().items(
    Joi.object({
      trait: Joi.string().required(),
      operator: Joi.string()
        .valid("eq", "gte", "lte", "includes", "contains")
        .default("eq"),
      value: Joi.alternatives(Joi.string(), Joi.number(), Joi.boolean()).required(),
    })
  ),
  traitMappings: Joi.object().pattern(
    Joi.string(),
    Joi.alternatives(Joi.number(), Joi.string(), Joi.boolean(), Joi.object())
  ),
  isActive: Joi.boolean(),
});

export const onboardingAnswerSchema = Joi.object({
  questionId: Joi.string().required(),
  selectedOptionId: Joi.string().required(),
});

export const onboardingCompleteSchema = Joi.object({
  confirm: Joi.boolean().valid(true).required(),
});

export const chatContextSchema = Joi.object({
  message: Joi.string().trim().min(1).max(2000).required(),
});

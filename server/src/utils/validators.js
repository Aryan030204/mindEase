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
  emotionTag: Joi.string().required(),
  notes: Joi.string().max(500),
  activityDone: Joi.boolean(),
});

export const resourceAddSchema = Joi.object({
  title: Joi.string().max(200).required(),
  category: Joi.string().required(),
  contentURL: Joi.string().uri().required(),
  description: Joi.string().max(500),
});

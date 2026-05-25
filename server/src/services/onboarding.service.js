import mongoose from "mongoose";
import OnboardingQuestion from "../models/OnboardingQuestion.model.js";
import OnboardingResponse from "../models/OnboardingResponse.model.js";
import UserTrait from "../models/UserTrait.model.js";
import { buildTraitEffects, applyTraitEffects } from "./traitEngine.service.js";
import { selectNextQuestion } from "./adaptiveQuestion.service.js";

const ADAPTIVE_QUESTION_COUNT = Number(process.env.ADAPTIVE_QUESTION_COUNT || 2);
const ONBOARDING_VERSION = Number(process.env.ONBOARDING_VERSION || 1);

const ensureSeedQuestions = async () => {
  const count = await OnboardingQuestion.countDocuments();
  if (count > 0) return;

  const seed = [
    {
      question: "When you feel stressed, what do you usually do first?",
      description: "Choose the response that feels closest to your natural reaction.",
      type: "single",
      category: "coping",
      options: [
        {
          text: "I reach out to someone I trust",
          traitEffects: { copingStyle: "support-seeking", socialEnergy: 1 },
        },
        {
          text: "I keep it to myself",
          traitEffects: { copingStyle: "avoidant", socialEnergy: -1 },
        },
        {
          text: "I try to solve it quickly",
          traitEffects: { copingStyle: "problem-focused", motivationStyle: "action" },
        },
        {
          text: "I distract myself with something else",
          traitEffects: { copingStyle: "emotion-avoidant", resilienceScore: -1 },
        },
      ],
      tags: ["stress", "coping"],
    },
    {
      question: "How do you usually regain your energy after a long day?",
      description: "Pick the option that feels most true.",
      type: "single",
      category: "social",
      options: [
        {
          text: "Spending quiet time alone",
          traitEffects: { socialEnergy: -2, emotionalExpression: -1 },
        },
        {
          text: "Talking with a close friend or family",
          traitEffects: { socialEnergy: 2, emotionalExpression: 1 },
        },
        {
          text: "Doing something active or creative",
          traitEffects: { socialEnergy: 1, motivationStyle: "action" },
        },
        {
          text: "Switching off and resting deeply",
          traitEffects: { resilienceScore: 1, copingStyle: "restorative" },
        },
      ],
      tags: ["energy", "social"],
    },
    {
      question: "How comfortable are you sharing emotions with others?",
      description: "There is no right answer. Choose what feels honest.",
      type: "single",
      category: "expression",
      options: [
        {
          text: "Very comfortable",
          traitEffects: { emotionalExpression: 2 },
        },
        {
          text: "Somewhat comfortable",
          traitEffects: { emotionalExpression: 1 },
        },
        {
          text: "I share only with a few people",
          traitEffects: { emotionalExpression: 0 },
        },
        {
          text: "I usually keep it inside",
          traitEffects: { emotionalExpression: -1 },
        },
      ],
      tags: ["expression"],
    },
    {
      question: "When a plan changes suddenly, how do you usually feel?",
      description: "Think about recent moments where plans shifted.",
      type: "single",
      category: "stress",
      options: [
        {
          text: "I adapt easily",
          traitEffects: { stressSensitivity: -1, resilienceScore: 1 },
        },
        {
          text: "I feel uneasy but manage",
          traitEffects: { stressSensitivity: 0 },
        },
        {
          text: "I feel stressed and need time",
          traitEffects: { stressSensitivity: 1 },
        },
        {
          text: "It throws me off a lot",
          traitEffects: { stressSensitivity: 2 },
        },
      ],
      tags: ["stress", "resilience"],
    },
    {
      question: "What usually helps you feel motivated on low days?",
      description: "Choose the support that feels most motivating.",
      type: "single",
      category: "motivation",
      options: [
        {
          text: "Setting a small goal and finishing it",
          traitEffects: { motivationStyle: "action", resilienceScore: 1 },
        },
        {
          text: "Encouragement from someone close",
          traitEffects: { motivationStyle: "support", socialEnergy: 1 },
        },
        {
          text: "Taking time to rest first",
          traitEffects: { motivationStyle: "rest", resilienceScore: 0 },
        },
        {
          text: "Reflecting or journaling",
          traitEffects: { motivationStyle: "reflective", emotionalExpression: 1 },
        },
      ],
      tags: ["motivation"],
    },
    {
      question: "How often do you pause to notice how you feel?",
      description: "Think about your typical week.",
      type: "single",
      category: "awareness",
      options: [
        {
          text: "Multiple times a day",
          traitEffects: { emotionalExpression: 1, resilienceScore: 1 },
        },
        {
          text: "Once a day",
          traitEffects: { emotionalExpression: 0 },
        },
        {
          text: "A few times a week",
          traitEffects: { emotionalExpression: -1 },
        },
        {
          text: "Rarely",
          traitEffects: { emotionalExpression: -2 },
        },
      ],
      tags: ["awareness"],
    },
    {
      question: "When you feel overwhelmed, do you ask for help?",
      description: "This helps us understand your support style.",
      type: "single",
      category: "support",
      followUpTriggers: [
        { trait: "copingStyle", operator: "eq", value: "avoidant" },
        { trait: "copingStyle", operator: "eq", value: "emotion-avoidant" },
      ],
      options: [
        {
          text: "Yes, I usually reach out",
          traitEffects: { copingStyle: "support-seeking", resilienceScore: 1 },
        },
        {
          text: "Sometimes, if I feel safe",
          traitEffects: { copingStyle: "selective", emotionalExpression: 1 },
        },
        {
          text: "Rarely, I prefer handling it alone",
          traitEffects: { copingStyle: "avoidant", emotionalExpression: -1 },
        },
      ],
      tags: ["support"],
    },
    {
      question: "After social time, how do you usually feel?",
      description: "We want to understand your social energy rhythm.",
      type: "single",
      category: "social",
      followUpTriggers: [{ trait: "socialEnergy", operator: "lte", value: -1 }],
      options: [
        {
          text: "Drained and needing quiet",
          traitEffects: { socialEnergy: -1, copingStyle: "restorative" },
        },
        {
          text: "Balanced",
          traitEffects: { socialEnergy: 0 },
        },
        {
          text: "Energized",
          traitEffects: { socialEnergy: 1 },
        },
      ],
      tags: ["social"],
    },
    {
      question: "When you feel low, what tends to help most?",
      description: "Choose the response that feels most restorative.",
      type: "single",
      category: "resilience",
      followUpTriggers: [{ trait: "resilienceScore", operator: "lte", value: 0 }],
      options: [
        {
          text: "Taking a short walk or moving my body",
          traitEffects: { resilienceScore: 1, motivationStyle: "action" },
        },
        {
          text: "Talking to someone who understands",
          traitEffects: { resilienceScore: 1, copingStyle: "support-seeking" },
        },
        {
          text: "Quiet time and rest",
          traitEffects: { resilienceScore: 1, motivationStyle: "rest" },
        },
      ],
      tags: ["resilience"],
    },
    {
      question: "Which kind of encouragement feels most grounding?",
      description: "Select the option that feels most supportive.",
      type: "single",
      category: "support",
      followUpTriggers: [{ trait: "emotionalExpression", operator: "lte", value: 0 }],
      options: [
        {
          text: "Gentle reminders and check-ins",
          traitEffects: { copingStyle: "support-seeking", emotionalExpression: 1 },
        },
        {
          text: "Practical steps I can take",
          traitEffects: { copingStyle: "problem-focused", motivationStyle: "action" },
        },
        {
          text: "Space to process at my own pace",
          traitEffects: { copingStyle: "restorative", emotionalExpression: 0 },
        },
      ],
      tags: ["support"],
    },
  ];

  await OnboardingQuestion.insertMany(seed);
};

const toObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;

const serializeQuestion = (question) => {
  if (!question) return null;

  return {
    id: question._id,
    question: question.question,
    description: question.description,
    type: question.type,
    category: question.category,
    options: question.options.map((option) => ({
      id: option._id,
      text: option.text,
    })),
  };
};

const getProgress = async ({ userId, onboardingVersion }) => {
  const answeredCount = await OnboardingResponse.countDocuments({
    userId,
    onboardingVersion,
  });

  const baseCount = await OnboardingQuestion.countDocuments({
    isActive: true,
    $or: [
      { followUpTriggers: { $exists: false } },
      { followUpTriggers: { $size: 0 } },
    ],
  });

  const totalCount = baseCount + ADAPTIVE_QUESTION_COUNT;

  return {
    answered: answeredCount,
    total: totalCount,
    baseCount,
    adaptiveLimit: ADAPTIVE_QUESTION_COUNT,
  };
};

const getAdaptiveAnsweredCount = async ({ userId, onboardingVersion }) => {
  const responses = await OnboardingResponse.find({ userId, onboardingVersion })
    .select("metadata")
    .lean();

  return responses.filter((response) => response?.metadata?.isAdaptive).length;
};

const ensureUserTrait = async (userId) => {
  const existing = await UserTrait.findOne({ userId });
  if (existing) return existing;

  return UserTrait.create({
    userId,
    onboardingCompleted: false,
    onboardingVersion: 0,
    needsOnboardingUpgrade: false,
  });
};

const syncUpgradeFlag = async (userTrait) => {
  if (!userTrait) return null;

  if (userTrait.onboardingCompleted && userTrait.onboardingVersion < ONBOARDING_VERSION) {
    if (!userTrait.needsOnboardingUpgrade) {
      userTrait.needsOnboardingUpgrade = true;
      await userTrait.save();
    }
  }

  return userTrait;
};

export const startOnboarding = async (userId) => {
  await ensureSeedQuestions();

  const userTrait = await ensureUserTrait(userId);
  await syncUpgradeFlag(userTrait);

  if (userTrait.onboardingCompleted && userTrait.onboardingVersion === ONBOARDING_VERSION) {
    const error = new Error("Onboarding already completed");
    error.statusCode = 409;
    throw error;
  }

  const onboardingVersion = ONBOARDING_VERSION;
  const answeredIds = await OnboardingResponse.find({
    userId,
    onboardingVersion,
  }).select("questionId");

  const answeredIdList = answeredIds.map((item) => item.questionId);
  const askedAdaptiveCount = await getAdaptiveAnsweredCount({
    userId,
    onboardingVersion,
  });

  const question = await selectNextQuestion({
    traits: userTrait.traits,
    answeredIds: answeredIdList,
    adaptiveLimit: ADAPTIVE_QUESTION_COUNT,
    askedAdaptiveCount,
  });

  const progress = await getProgress({ userId, onboardingVersion });

  return {
    question: serializeQuestion(question),
    progress,
    onboarding: {
      completed: userTrait.onboardingCompleted,
      onboardingVersion: userTrait.onboardingVersion,
      needsOnboardingUpgrade: userTrait.needsOnboardingUpgrade,
    },
  };
};

export const submitAnswer = async ({ userId, questionId, selectedOptionId }) => {
  const onboardingVersion = ONBOARDING_VERSION;
  const userTrait = await ensureUserTrait(userId);
  await syncUpgradeFlag(userTrait);

  if (userTrait.onboardingCompleted && userTrait.onboardingVersion === onboardingVersion) {
    const error = new Error("Onboarding already completed");
    error.statusCode = 409;
    throw error;
  }

  const question = await OnboardingQuestion.findById(toObjectId(questionId));
  if (!question || !question.isActive) {
    const error = new Error("Question not found or inactive");
    error.statusCode = 404;
    throw error;
  }

  const selectedOption = question.options.id(toObjectId(selectedOptionId));
  if (!selectedOption) {
    const error = new Error("Selected option not found");
    error.statusCode = 404;
    throw error;
  }

  const existing = await OnboardingResponse.findOne({
    userId,
    questionId: question._id,
    onboardingVersion,
  });

  if (existing) {
    const error = new Error("Question already answered");
    error.statusCode = 409;
    throw error;
  }

  const effects = buildTraitEffects(question, selectedOption);
  const { userTrait: updatedTrait, derivedTraits } = await applyTraitEffects({
    userId,
    effects,
    onboardingVersion,
  });

  const response = await OnboardingResponse.create({
    userId,
    questionId: question._id,
    onboardingVersion,
    selectedOption: {
      optionId: selectedOption._id,
      text: selectedOption.text,
      traitEffects: selectedOption.traitEffects,
      weight: selectedOption.weight ?? 1,
    },
    derivedTraits,
    metadata: {
      isAdaptive: (question.followUpTriggers || []).length > 0,
      category: question.category || null,
    },
  });

  const progress = await getProgress({ userId, onboardingVersion });

  return {
    response,
    derivedTraits,
    traits: updatedTrait.traits,
    confidenceScores: updatedTrait.confidenceScores,
    progress,
  };
};

export const getNextQuestion = async (userId) => {
  const onboardingVersion = ONBOARDING_VERSION;
  const userTrait = await ensureUserTrait(userId);
  await syncUpgradeFlag(userTrait);

  if (userTrait.onboardingCompleted && userTrait.onboardingVersion === onboardingVersion) {
    const error = new Error("Onboarding already completed");
    error.statusCode = 409;
    throw error;
  }

  const answeredIds = await OnboardingResponse.find({
    userId,
    onboardingVersion,
  }).select("questionId");

  const answeredIdList = answeredIds.map((item) => item.questionId);
  const askedAdaptiveCount = await getAdaptiveAnsweredCount({
    userId,
    onboardingVersion,
  });

  const question = await selectNextQuestion({
    traits: userTrait.traits,
    answeredIds: answeredIdList,
    adaptiveLimit: ADAPTIVE_QUESTION_COUNT,
    askedAdaptiveCount,
  });

  const progress = await getProgress({ userId, onboardingVersion });

  return {
    question: serializeQuestion(question),
    progress,
  };
};

export const completeOnboarding = async (userId) => {
  const onboardingVersion = ONBOARDING_VERSION;
  const userTrait = await ensureUserTrait(userId);
  await syncUpgradeFlag(userTrait);

  if (userTrait.onboardingCompleted && userTrait.onboardingVersion === onboardingVersion) {
    const error = new Error("Onboarding already completed");
    error.statusCode = 409;
    throw error;
  }

  const responseCount = await OnboardingResponse.countDocuments({
    userId,
    onboardingVersion,
  });

  if (responseCount === 0) {
    const error = new Error("Please answer at least one question before completing onboarding");
    error.statusCode = 400;
    throw error;
  }

  userTrait.onboardingCompleted = true;
  userTrait.onboardingVersion = onboardingVersion;
  userTrait.needsOnboardingUpgrade = false;
  userTrait.lastUpdated = new Date();

  await userTrait.save();

  return userTrait;
};

export const getProfile = async (userId) => {
  const userTrait = await ensureUserTrait(userId);
  await syncUpgradeFlag(userTrait);
  return userTrait;
};

export const createQuestion = async (payload) => {
  return OnboardingQuestion.create(payload);
};

export const updateQuestion = async (questionId, payload) => {
  return OnboardingQuestion.findByIdAndUpdate(questionId, payload, {
    new: true,
    runValidators: true,
  });
};

export const listQuestions = async () => {
  return OnboardingQuestion.find().sort({ createdAt: 1 });
};

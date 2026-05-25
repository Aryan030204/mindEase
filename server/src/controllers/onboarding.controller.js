import asyncHandler from "../utils/asyncHandler.js";
import {
  startOnboarding,
  submitAnswer,
  getNextQuestion,
  completeOnboarding,
  getProfile,
  createQuestion,
  updateQuestion,
  listQuestions,
} from "../services/onboarding.service.js";

export const start = asyncHandler(async (req, res) => {
  const result = await startOnboarding(req.user.id);
  return res.status(200).json({
    message: "Onboarding started",
    ...result,
  });
});

export const answer = asyncHandler(async (req, res) => {
  const { questionId, selectedOptionId } = req.body;
  const result = await submitAnswer({
    userId: req.user.id,
    questionId,
    selectedOptionId,
  });

  return res.status(200).json({
    message: "Answer recorded",
    ...result,
  });
});

export const next = asyncHandler(async (req, res) => {
  const result = await getNextQuestion(req.user.id);

  return res.status(200).json({
    message: "Next question fetched",
    ...result,
  });
});

export const complete = asyncHandler(async (req, res) => {
  const profile = await completeOnboarding(req.user.id);
  return res.status(200).json({
    message: "Onboarding completed",
    profile,
  });
});

export const profile = asyncHandler(async (req, res) => {
  const result = await getProfile(req.user.id);
  return res.status(200).json({
    message: "Profile fetched",
    profile: result,
  });
});

export const createQuestionHandler = asyncHandler(async (req, res) => {
  const question = await createQuestion(req.body);
  return res.status(201).json({
    message: "Question created",
    question,
  });
});

export const updateQuestionHandler = asyncHandler(async (req, res) => {
  const question = await updateQuestion(req.params.id, req.body);
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  return res.status(200).json({
    message: "Question updated",
    question,
  });
});

export const listQuestionsHandler = asyncHandler(async (req, res) => {
  const questions = await listQuestions();
  return res.status(200).json({
    message: "Questions fetched",
    questions,
  });
});

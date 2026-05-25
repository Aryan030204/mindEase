import OnboardingQuestion from "../models/OnboardingQuestion.model.js";

const getTraitValue = (traits, traitKey) => {
  if (!traits) return undefined;
  const raw = traits instanceof Map ? traits.get(traitKey) : traits[traitKey];

  if (raw && typeof raw === "object" && "value" in raw) {
    return raw.value;
  }

  return raw;
};

const matchTrigger = (traits, trigger) => {
  const traitValue = getTraitValue(traits, trigger.trait);

  if (traitValue === undefined || traitValue === null) {
    return false;
  }

  const triggerValue = trigger.value;

  switch (trigger.operator) {
    case "gte":
      return Number(traitValue) >= Number(triggerValue);
    case "lte":
      return Number(traitValue) <= Number(triggerValue);
    case "includes":
      if (Array.isArray(traitValue)) {
        return traitValue.includes(triggerValue);
      }
      return String(traitValue).includes(String(triggerValue));
    case "contains":
      return String(traitValue).includes(String(triggerValue));
    case "eq":
    default:
      return String(traitValue) === String(triggerValue);
  }
};

const shouldUseAdaptiveQuestion = (question, traits) => {
  if (!question.followUpTriggers || question.followUpTriggers.length === 0) {
    return false;
  }

  return question.followUpTriggers.some((trigger) => matchTrigger(traits, trigger));
};

export const selectNextQuestion = async ({
  traits,
  answeredIds,
  adaptiveLimit,
  askedAdaptiveCount,
}) => {
  const baseFilter = {
    isActive: true,
    _id: { $nin: answeredIds },
  };

  if (askedAdaptiveCount < adaptiveLimit) {
    const adaptiveCandidates = await OnboardingQuestion.find({
      ...baseFilter,
      followUpTriggers: { $exists: true, $ne: [] },
    }).sort({ createdAt: 1 });

    const matched = adaptiveCandidates.find((question) =>
      shouldUseAdaptiveQuestion(question, traits)
    );

    if (matched) {
      return matched;
    }
  }

  const baseQuestion = await OnboardingQuestion.findOne({
    ...baseFilter,
    $or: [
      { followUpTriggers: { $exists: false } },
      { followUpTriggers: { $size: 0 } },
    ],
  }).sort({ createdAt: 1 });

  if (baseQuestion) {
    return baseQuestion;
  }

  return OnboardingQuestion.findOne(baseFilter).sort({ createdAt: 1 });
};

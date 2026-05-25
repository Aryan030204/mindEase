import UserTrait from "../models/UserTrait.model.js";

const normalizeTraitsMap = (value) => {
  if (value instanceof Map) {
    return value;
  }
  return new Map(Object.entries(value || {}));
};

const getTraitValue = (traitValue) => {
  if (traitValue && typeof traitValue === "object" && "value" in traitValue) {
    return traitValue.value;
  }
  return traitValue;
};

const addNumericTrait = (traits, confidenceScores, traitKey, delta, weight) => {
  const current = Number(getTraitValue(traits.get(traitKey)) || 0);
  const nextValue = Number((current + delta).toFixed(3));
  const currentConfidence = Number(confidenceScores.get(traitKey) || 0);

  traits.set(traitKey, nextValue);
  confidenceScores.set(traitKey, Number((currentConfidence + Math.abs(weight)).toFixed(3)));
};

const addCategoricalTrait = (traits, confidenceScores, traitKey, optionValue, weight) => {
  const current = confidenceScores.get(traitKey) || {};
  const counts = { ...current };
  const valueKey = String(optionValue);

  counts[valueKey] = Number((counts[valueKey] || 0) + Math.abs(weight));

  let dominant = valueKey;
  let maxScore = counts[valueKey];
  Object.entries(counts).forEach(([key, score]) => {
    if (score > maxScore) {
      dominant = key;
      maxScore = score;
    }
  });

  traits.set(traitKey, dominant);
  confidenceScores.set(traitKey, counts);
};

const buildEffectsFromMap = (sourceMap, defaultWeight) => {
  if (!sourceMap) return [];
  const entries = sourceMap instanceof Map ? [...sourceMap.entries()] : Object.entries(sourceMap);

  return entries.map(([trait, rawValue]) => {
    if (rawValue && typeof rawValue === "object" && "value" in rawValue) {
      return {
        trait,
        value: rawValue.value,
        weight: Number(rawValue.weight ?? defaultWeight ?? 1),
      };
    }

    return {
      trait,
      value: rawValue,
      weight: Number(defaultWeight ?? 1),
    };
  });
};

export const buildTraitEffects = (question, selectedOption) => {
  const optionWeight = Number(selectedOption.weight ?? 1);
  const questionEffects = buildEffectsFromMap(question.traitMappings, 1);
  const optionEffects = buildEffectsFromMap(selectedOption.traitEffects, optionWeight);

  return [...questionEffects, ...optionEffects].filter((effect) => effect.trait);
};

export const applyTraitEffects = async ({ userId, effects, onboardingVersion }) => {
  const userTrait =
    (await UserTrait.findOne({ userId })) ||
    new UserTrait({ userId, onboardingCompleted: false, onboardingVersion: 0 });

  const traits = normalizeTraitsMap(userTrait.traits);
  const confidenceScores = normalizeTraitsMap(userTrait.confidenceScores);

  const derivedTraits = {};

  effects.forEach((effect) => {
    const { trait, value, weight } = effect;

    if (typeof value === "number") {
      addNumericTrait(traits, confidenceScores, trait, value * weight, weight);
      derivedTraits[trait] = value * weight;
      return;
    }

    if (typeof value === "string" || typeof value === "boolean") {
      addCategoricalTrait(traits, confidenceScores, trait, value, weight);
      derivedTraits[trait] = value;
      return;
    }

    if (value && typeof value === "object" && "value" in value) {
      if (typeof value.value === "number") {
        addNumericTrait(traits, confidenceScores, trait, value.value * weight, weight);
        derivedTraits[trait] = value.value * weight;
      } else {
        addCategoricalTrait(traits, confidenceScores, trait, value.value, weight);
        derivedTraits[trait] = value.value;
      }
    }
  });

  userTrait.traits = traits;
  userTrait.confidenceScores = confidenceScores;
  userTrait.onboardingVersion = onboardingVersion;
  userTrait.lastUpdated = new Date();

  await userTrait.save();

  return {
    userTrait,
    derivedTraits,
  };
};

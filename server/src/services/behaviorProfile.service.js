const normalizeTraits = (traitsMap) => {
  if (traitsMap instanceof Map) {
    return Object.fromEntries(traitsMap.entries());
  }
  return traitsMap || {};
};

const unique = (items) => [...new Set(items.filter(Boolean))];

export const inferPersonalityTags = (traitDocument) => {
  const traits = normalizeTraits(traitDocument?.traits);
  const values = Object.values(traits).map((value) =>
    typeof value === "string" ? value.toLowerCase() : value
  );

  const tags = new Set(["ambivert"]);

  values.forEach((value) => {
    if (typeof value !== "string") {
      return;
    }
    if (value.includes("intro")) tags.add("introvert");
    if (value.includes("extra")) tags.add("extrovert");
    if (value.includes("avoid")) tags.add("avoidant");
    if (value.includes("creative")) tags.add("creative");
    if (value.includes("reflect")) tags.add("reflective");
    if (value.includes("organ")) tags.add("organized");
    if (value.includes("family")) tags.add("family_oriented");
    if (value.includes("suppress")) tags.add("emotionally_suppressed");
    if (value.includes("express")) tags.add("socially_expressive");
  });

  const socialEnergy = Number(traits.socialEnergy || traits.social_energy || 0);
  if (socialEnergy <= -1) tags.add("introvert");
  if (socialEnergy >= 1) tags.add("extrovert");

  if (Number(traits.creativity || 0) >= 1) tags.add("creative");
  if (Number(traits.structurePreference || traits.routinePreference || 0) >= 1) {
    tags.add("organized");
  }
  if (Number(traits.emotionalExpression || 0) <= -1) {
    tags.add("emotionally_suppressed");
  }
  if (Number(traits.emotionalExpression || 0) >= 1) {
    tags.add("socially_expressive");
  }
  if (Number(traits.stressSensitivity || 0) >= 1) {
    tags.add("high_stress");
  }
  if (Number(traits.stressSensitivity || 0) <= -1) {
    tags.add("low_stress");
  }

  if (!tags.has("introvert") && !tags.has("extrovert")) {
    tags.add("reflective");
  }

  return [...tags];
};

const getStressSensitivity = (traitTags, patternTypes) => {
  if (traitTags.includes("high_stress") || patternTypes.includes("monday_stress")) {
    return "high_stress";
  }
  return "steady_stress";
};

const getEmotionalExpression = (traitTags) => {
  if (traitTags.includes("emotionally_suppressed") || traitTags.includes("avoidant")) {
    return "emotionally_suppressed";
  }
  if (traitTags.includes("socially_expressive") || traitTags.includes("extrovert")) {
    return "socially_expressive";
  }
  return "reflective_expression";
};

const getSocialEnergy = (traitTags, patternTypes) => {
  if (traitTags.includes("introvert") || patternTypes.includes("social_isolation_pattern")) {
    return "low_energy";
  }
  if (traitTags.includes("extrovert")) {
    return "high_energy";
  }
  return "balanced_energy";
};

const getCopingStyle = (traitTags, topInterventions) => {
  if (traitTags.includes("avoidant")) {
    return "avoidant";
  }
  if (topInterventions.some((item) => ["family_check_in", "friend_voice_note"].includes(item.activityType))) {
    return "socially_connected";
  }
  if (topInterventions.some((item) => ["gratitude_journaling", "chai_reflection", "creative_reset"].includes(item.activityType))) {
    return "reflective";
  }
  return "steady_coping";
};

export const deriveTonePreferences = ({ traitTags = [], patternTypes = [] }) => {
  const avoidTone = [];
  const supportFocus = [];
  let preferredTone = "gentle_reassurance";

  if (traitTags.includes("avoidant") || traitTags.includes("emotionally_suppressed")) {
    preferredTone = "gentle_reassurance";
    avoidTone.push("aggressive_motivation");
    supportFocus.push("low_pressure_reflection");
  }

  if (patternTypes.includes("night_anxiety")) {
    preferredTone = "calm_grounding";
    avoidTone.push("high_energy_language");
    supportFocus.push("bedtime_regulation");
  }

  if (patternTypes.includes("social_isolation_pattern")) {
    supportFocus.push("soft_social_reconnection");
  }

  if (traitTags.includes("socially_expressive") && !patternTypes.includes("night_anxiety")) {
    preferredTone = "warm_encouragement";
  }

  return {
    preferredTone,
    avoidTone: unique(avoidTone),
    supportFocus: unique(supportFocus),
  };
};

export const deriveBehavioralArchetype = ({
  userTrait,
  userPatterns = [],
  effectivenessRows = [],
}) => {
  const traitTags = inferPersonalityTags(userTrait);
  const patternTypes = userPatterns.map((pattern) => pattern.type);
  const sortedInterventions = [...effectivenessRows]
    .sort((a, b) => b.effectivenessWeight - a.effectivenessWeight)
    .slice(0, 4);

  const copingStyle = getCopingStyle(traitTags, sortedInterventions);
  const emotionalExpression = getEmotionalExpression(traitTags);
  const stressSensitivity = getStressSensitivity(traitTags, patternTypes);
  const socialEnergy = getSocialEnergy(traitTags, patternTypes);
  const clusterId = [copingStyle, emotionalExpression, socialEnergy]
    .filter(Boolean)
    .join("_");

  const tonePreferences = deriveTonePreferences({ traitTags, patternTypes });

  return {
    clusterId,
    dominantTraits: unique([copingStyle, emotionalExpression, stressSensitivity, socialEnergy, ...traitTags]).slice(0, 6),
    commonPatterns: unique(patternTypes).slice(0, 5),
    commonInterventions: sortedInterventions.map((item) => item.activityType),
    tonePreferences,
  };
};

export const deriveEmotionalPatternKey = ({ userPatterns = [], moodSummary = {} }) => {
  const patternTypes = userPatterns.map((pattern) => pattern.type);

  if (patternTypes.includes("night_anxiety")) return "night_anxiety";
  if (patternTypes.includes("social_isolation_pattern")) return "social_isolation";
  if (patternTypes.includes("sleep_related_mood_decline")) return "sleep_decline";
  if (patternTypes.includes("monday_stress")) return "monday_stress";
  if (moodSummary.dominantEmotion) return `dominant_${moodSummary.dominantEmotion}`;
  return "general_emotional_variability";
};

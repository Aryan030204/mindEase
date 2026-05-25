import CollectiveInsight from "../models/CollectiveInsight.model.js";
import PersonalityCluster from "../models/PersonalityCluster.model.js";
import RecommendationGlobalWeight from "../models/RecommendationGlobalWeight.model.js";
import { collectAnonymizedBehaviorProfiles } from "./collectiveAggregation.service.js";
import { deriveBehavioralArchetype, inferPersonalityTags } from "./behaviorProfile.service.js";
import { getJson, setJson } from "./redis.service.js";

const GLOBAL_WEIGHT_CACHE_KEY = "collective:global-weight-map";
const GLOBAL_WEIGHT_CACHE_TTL = 60 * 60 * 3;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const updateRecommendationGlobalWeights = async ({ forceRefresh = false } = {}) => {
  const profiles = await collectAnonymizedBehaviorProfiles({ forceRefresh });
  const grouped = new Map();

  profiles.forEach((profile) => {
    profile.interventionStats.forEach((stat) => {
      const targetTraits = profile.dominantTraits.slice(0, 4).sort();
      const targetPatterns = profile.commonPatterns.slice(0, 3).sort();
      const key = `${stat.activityType}::${targetTraits.join("|")}::${targetPatterns.join("|")}`;
      const current = grouped.get(key) || {
        activityType: stat.activityType,
        targetTraits,
        targetPatterns,
        stats: [],
      };
      current.stats.push(stat);
      grouped.set(key, current);
    });
  });

  const weightDocs = await Promise.all(
    [...grouped.values()].map(async (group) => {
      const sampleSize = group.stats.reduce((sum, item) => sum + item.totalShown, 0);
      const averageSuccess =
        group.stats.reduce((sum, item) => sum + item.successRate, 0) /
        Math.max(1, group.stats.length);
      const averageEffectiveness =
        group.stats.reduce((sum, item) => sum + item.effectivenessWeight, 0) /
        Math.max(1, group.stats.length);

      const globalEffectivenessScore = Number(
        clamp(0.7 + averageSuccess * 0.45 + (averageEffectiveness - 1) * 0.2, 0.6, 1.45).toFixed(3)
      );
      const confidence = Number(clamp(sampleSize / 18, 0.15, 0.95).toFixed(2));
      const targetKey = `${group.activityType}::${group.targetTraits.join("|")}::${group.targetPatterns.join("|")}`;

      return RecommendationGlobalWeight.findOneAndUpdate(
        { targetKey },
        {
          targetKey,
          activityType: group.activityType,
          targetTraits: group.targetTraits,
          targetPatterns: group.targetPatterns,
          globalEffectivenessScore,
          confidence,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    })
  );

  await setJson(GLOBAL_WEIGHT_CACHE_KEY, weightDocs, GLOBAL_WEIGHT_CACHE_TTL);
  return weightDocs;
};

const getAllGlobalWeights = async () => {
  const cached = await getJson(GLOBAL_WEIGHT_CACHE_KEY);
  if (cached) {
    return cached;
  }

  const weights = await RecommendationGlobalWeight.find({}).lean();
  await setJson(GLOBAL_WEIGHT_CACHE_KEY, weights, GLOBAL_WEIGHT_CACHE_TTL);
  return weights;
};

export const getGlobalRecommendationModifiers = async ({
  userTrait,
  userPatterns = [],
}) => {
  const [allWeights, clusterDocs, collectiveInsights] = await Promise.all([
    getAllGlobalWeights(),
    PersonalityCluster.find({}).lean(),
    CollectiveInsight.find({}).lean(),
  ]);

  const traitTags = inferPersonalityTags(userTrait);
  const patternTypes = userPatterns.map((pattern) => pattern.type);
  const archetype = deriveBehavioralArchetype({
    userTrait,
    userPatterns,
    effectivenessRows: [],
  });

  const matchingCluster = clusterDocs.find((cluster) => cluster.clusterId === archetype.clusterId);
  const matchingInsights = collectiveInsights.filter(
    (item) =>
      item.traitCluster === archetype.clusterId ||
      item.emotionalPattern === patternTypes[0]
  );

  const modifierMap = new Map();

  allWeights.forEach((weight) => {
    const traitOverlap = weight.targetTraits.filter((trait) => traitTags.includes(trait)).length;
    const patternOverlap = weight.targetPatterns.filter((pattern) => patternTypes.includes(pattern)).length;
    const overlapScore = traitOverlap * 0.18 + patternOverlap * 0.26;

    if (overlapScore <= 0) {
      return;
    }

    const modifier = clamp(
      1 + (weight.globalEffectivenessScore - 1) * 0.8 + overlapScore * weight.confidence,
      0.8,
      1.4
    );
    modifierMap.set(weight.activityType, {
      weight: Number(modifier.toFixed(3)),
      confidence: weight.confidence,
    });
  });

  return {
    modifierMap,
    adaptationMetadata: {
      preferredTone:
        matchingInsights[0]?.emotionalStrategy?.preferredTone ||
        matchingCluster?.tonePreferences?.preferredTone ||
        "gentle_reassurance",
      avoidTone: [
        ...new Set(
          matchingInsights.flatMap((item) => item.emotionalStrategy?.avoidTone || []).concat(
            matchingCluster?.tonePreferences?.avoidTone || []
          )
        ),
      ].slice(0, 4),
      supportFocus: [
        ...new Set(
          matchingInsights.flatMap((item) => item.emotionalStrategy?.supportFocus || [])
        ),
      ].slice(0, 4),
      clusterStrength: matchingCluster?.userCount || 0,
    },
  };
};

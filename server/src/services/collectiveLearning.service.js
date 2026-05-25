import CollectiveInsight from "../models/CollectiveInsight.model.js";
import EmotionalTrendAnalytics from "../models/EmotionalTrendAnalytics.model.js";
import { collectAnonymizedBehaviorProfiles } from "./collectiveAggregation.service.js";
import { recalculatePersonalityClusters } from "./clustering.service.js";
import { getJson, setJson } from "./redis.service.js";

const COLLECTIVE_SUMMARY_CACHE_TTL = 60 * 60;

const average = (items) =>
  items.length ? items.reduce((sum, value) => sum + value, 0) / items.length : 0;

const groupBy = (items, keyBuilder) =>
  items.reduce((map, item) => {
    const key = keyBuilder(item);
    const current = map.get(key) || [];
    current.push(item);
    map.set(key, current);
    return map;
  }, new Map());

const summarizeInterventions = (profiles, comparator) => {
  const interventionMap = new Map();

  profiles.forEach((profile) => {
    profile.interventionStats.forEach((stat) => {
      const current = interventionMap.get(stat.activityType) || [];
      current.push(stat);
      interventionMap.set(stat.activityType, current);
    });
  });

  return [...interventionMap.entries()]
    .map(([activityType, stats]) => ({
      activityType,
      effectivenessWeight: Number(average(stats.map((item) => item.effectivenessWeight)).toFixed(2)),
      successRate: Number(average(stats.map((item) => item.successRate)).toFixed(2)),
      averageIgnoreRate: Number(average(stats.map((item) => item.ignoreRate)).toFixed(2)),
      sampleSize: stats.reduce((sum, item) => sum + item.totalShown, 0),
    }))
    .filter((item) => item.sampleSize >= 3)
    .sort(comparator)
    .slice(0, 5)
    .map(({ activityType, effectivenessWeight, successRate }) => ({
      activityType,
      effectivenessWeight,
      successRate,
    }));
};

const buildEmotionalStrategy = (profiles) => {
  const toneCounts = groupBy(
    profiles.map((profile) => profile.tonePreferences.preferredTone),
    (tone) => tone
  );
  const preferredTone =
    [...toneCounts.entries()].sort((a, b) => b[1].length - a[1].length)[0]?.[0] ||
    "gentle_reassurance";

  const avoidTone = [
    ...new Set(profiles.flatMap((profile) => profile.tonePreferences.avoidTone)),
  ].slice(0, 4);
  const supportFocus = [
    ...new Set(profiles.flatMap((profile) => profile.tonePreferences.supportFocus)),
  ].slice(0, 4);

  return {
    preferredTone,
    avoidTone,
    supportFocus,
  };
};

export const runCollectiveLearningAnalysis = async ({ forceRefresh = false } = {}) => {
  const profiles = await collectAnonymizedBehaviorProfiles({ forceRefresh });
  await recalculatePersonalityClusters({ forceRefresh });

  const grouped = groupBy(
    profiles,
    (profile) => `${profile.traitCluster}::${profile.emotionalPattern}`
  );

  const documents = await Promise.all(
    [...grouped.entries()].map(async ([key, groupedProfiles]) => {
      const [traitCluster, emotionalPattern] = key.split("::");
      const sampleSize = groupedProfiles.length;
      const effectiveInterventions = summarizeInterventions(
        groupedProfiles,
        (a, b) =>
          b.successRate - a.successRate || b.effectivenessWeight - a.effectivenessWeight
      ).filter((item) => item.successRate >= 0.45);
      const ineffectiveInterventions = summarizeInterventions(
        groupedProfiles,
        (a, b) =>
          b.averageIgnoreRate - a.averageIgnoreRate || a.successRate - b.successRate
      ).filter((item) => item.successRate <= 0.4);

      const confidenceScore = Number(
        Math.max(0.2, Math.min(0.95, (sampleSize / 12) * 0.8)).toFixed(2)
      );

      return CollectiveInsight.findOneAndUpdate(
        { traitCluster, emotionalPattern },
        {
          traitCluster,
          emotionalPattern,
          effectiveInterventions,
          ineffectiveInterventions,
          emotionalStrategy: buildEmotionalStrategy(groupedProfiles),
          confidenceScore,
          sampleSize,
          generatedAt: new Date(),
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    })
  );

  const activeKeys = documents.map((item) => ({
    traitCluster: item.traitCluster,
    emotionalPattern: item.emotionalPattern,
  }));

  if (activeKeys.length) {
    await CollectiveInsight.deleteMany({
      $nor: activeKeys,
    });
  }

  return documents;
};

export const aggregateEmotionalTrendAnalytics = async ({ forceRefresh = false } = {}) => {
  const profiles = await collectAnonymizedBehaviorProfiles({ forceRefresh });
  const grouped = groupBy(profiles, (profile) => profile.emotionalPattern);

  const analytics = await Promise.all(
    [...grouped.entries()].map(async ([emotionalPattern, groupedProfiles]) => {
      const correlatedFactors = [];
      if (average(groupedProfiles.map((profile) => profile.moodSummary.averageStress || 0)) >= 6) {
        correlatedFactors.push("elevated_stress");
      }
      if (average(groupedProfiles.map((profile) => profile.moodSummary.averageSleep || 0)) <= 6) {
        correlatedFactors.push("short_sleep");
      }
      if (average(groupedProfiles.map((profile) => profile.moodSummary.lowSocialRate || 0)) >= 0.45) {
        correlatedFactors.push("low_social_energy");
      }

      const interventionSuccessRates = summarizeInterventions(
        groupedProfiles,
        (a, b) => b.successRate - a.successRate
      );

      return EmotionalTrendAnalytics.findOneAndUpdate(
        { emotionalPattern },
        {
          emotionalPattern,
          correlatedFactors,
          interventionSuccessRates,
          generatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    })
  );

  return analytics;
};

export const buildCollectiveInsightSummary = async (userProfile) => {
  const cacheKey = `collective:summary:${userProfile.traitCluster}:${userProfile.emotionalPattern}`;
  const cached = await getJson(cacheKey);
  if (cached) {
    return cached;
  }

  const [clusterInsight, emotionalTrend] = await Promise.all([
    CollectiveInsight.findOne({
      traitCluster: userProfile.traitCluster,
      emotionalPattern: userProfile.emotionalPattern,
    }).lean(),
    EmotionalTrendAnalytics.findOne({
      emotionalPattern: userProfile.emotionalPattern,
    }).lean(),
  ]);

  const summary = {
    insightCards: [
      clusterInsight?.effectiveInterventions?.[0]
        ? {
            title: "What tends to help",
            summary: `People with a similar emotional rhythm often do well with ${clusterInsight.effectiveInterventions[0].activityType.replace(/_/g, " ")}.`,
          }
        : null,
      emotionalTrend?.correlatedFactors?.length
        ? {
            title: "A steady pattern",
            summary: `Your recent signals are often linked with ${emotionalTrend.correlatedFactors
              .slice(0, 2)
              .join(" and ")
              .replace(/_/g, " ")}.`,
          }
        : null,
      clusterInsight?.emotionalStrategy?.preferredTone
        ? {
            title: "Support style",
            summary: `MindEase is leaning toward a ${clusterInsight.emotionalStrategy.preferredTone
              .replace(/_/g, " ")} style when it supports you.`,
          }
        : null,
    ].filter(Boolean),
    behavioralTrendSummaries: emotionalTrend?.interventionSuccessRates?.slice(0, 3).map((item) => ({
      activityType: item.activityType,
      summary: `${item.activityType.replace(/_/g, " ")} has shown steady value in similar situations.`,
    })) || [],
    recommendationEvolutionIndicators: clusterInsight?.effectiveInterventions?.slice(0, 3).map((item) => ({
      activityType: item.activityType,
      label: `${item.activityType.replace(/_/g, " ")} is being prioritized more intelligently over time.`,
    })) || [],
  };

  await setJson(cacheKey, summary, COLLECTIVE_SUMMARY_CACHE_TTL);
  return summary;
};

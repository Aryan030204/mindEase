import PersonalityCluster from "../models/PersonalityCluster.model.js";
import { collectAnonymizedBehaviorProfiles } from "./collectiveAggregation.service.js";

const countMostCommon = (items = [], limit = 4) => {
  const counter = new Map();
  items.forEach((item) => {
    counter.set(item, (counter.get(item) || 0) + 1);
  });

  return [...counter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
};

export const recalculatePersonalityClusters = async ({ forceRefresh = false } = {}) => {
  const profiles = await collectAnonymizedBehaviorProfiles({ forceRefresh });
  const grouped = new Map();

  profiles.forEach((profile) => {
    const current = grouped.get(profile.traitCluster) || [];
    current.push(profile);
    grouped.set(profile.traitCluster, current);
  });

  const clusterDocuments = await Promise.all(
    [...grouped.entries()].map(async ([clusterId, clusterProfiles]) => {
      const dominantTraits = countMostCommon(
        clusterProfiles.flatMap((profile) => profile.dominantTraits),
        6
      );
      const commonPatterns = countMostCommon(
        clusterProfiles.flatMap((profile) => profile.commonPatterns),
        5
      );
      const commonInterventions = countMostCommon(
        clusterProfiles.flatMap((profile) => profile.commonInterventions),
        5
      );
      const preferredTones = countMostCommon(
        clusterProfiles.map((profile) => profile.tonePreferences.preferredTone),
        1
      );
      const avoidTone = countMostCommon(
        clusterProfiles.flatMap((profile) => profile.tonePreferences.avoidTone),
        3
      );

      return PersonalityCluster.findOneAndUpdate(
        { clusterId },
        {
          clusterId,
          dominantTraits,
          commonPatterns,
          commonInterventions,
          tonePreferences: {
            preferredTone: preferredTones[0] || "gentle_reassurance",
            avoidTone,
          },
          userCount: clusterProfiles.length,
          generatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    })
  );

  const activeClusterIds = clusterDocuments.map((item) => item.clusterId);
  await PersonalityCluster.deleteMany({ clusterId: { $nin: activeClusterIds } });

  return clusterDocuments;
};

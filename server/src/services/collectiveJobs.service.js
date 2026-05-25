import cron from "node-cron";
import {
  aggregateEmotionalTrendAnalytics,
  runCollectiveLearningAnalysis,
} from "./collectiveLearning.service.js";
import { recalculatePersonalityClusters } from "./clustering.service.js";
import { updateRecommendationGlobalWeights } from "./recommendationOptimization.service.js";
import { runWithRedisLock } from "./redis.service.js";

const JOB_LOCK_TTL = 60 * 25;

const scheduleProtectedJob = (name, expression, handler) => {
  cron.schedule(expression, async () => {
    await runWithRedisLock(`cron-lock:${name}`, JOB_LOCK_TTL, async () => {
      try {
        await handler();
        console.log(`[collective-jobs] ${name} completed`);
      } catch (error) {
        console.error(`[collective-jobs] ${name} failed:`, error.message);
      }
    });
  });
};

export const startCollectiveJobs = () => {
  if (process.env.DISABLE_COLLECTIVE_JOBS === "true") {
    return;
  }

  scheduleProtectedJob("nightly_collective_analysis", "0 1 * * *", async () => {
    await runCollectiveLearningAnalysis({ forceRefresh: true });
  });

  scheduleProtectedJob("cluster_recalculation", "20 1 * * *", async () => {
    await recalculatePersonalityClusters({ forceRefresh: true });
  });

  scheduleProtectedJob("recommendation_optimization", "40 1 * * *", async () => {
    await updateRecommendationGlobalWeights({ forceRefresh: true });
  });

  scheduleProtectedJob("emotional_trend_aggregation", "0 2 * * *", async () => {
    await aggregateEmotionalTrendAnalytics({ forceRefresh: true });
  });
};

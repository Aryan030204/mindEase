import recommendationDataset from "../data/recommendationDataset.js";
import { generatePersonalizedRecommendation } from "./recommendationEngine.service.js";

export { generatePersonalizedRecommendation };

export const getGeneralRecommendations = async () =>
  recommendationDataset
    .filter((activity) => activity.intensityLevel === "low")
    .slice(0, 6)
    .map((activity) => ({
      activityType: activity.activityType,
      title: activity.title,
      description: activity.description,
    }));

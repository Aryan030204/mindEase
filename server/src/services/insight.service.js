import MoodLog from "../models/MoodLog.model.js";
import UserInsight from "../models/UserInsight.model.js";

export const generateUserInsight = async (userId) => {
  const logs = await MoodLog.find({ userId })
    .sort({ date: -1 })
    .limit(14);

  if (!logs || logs.length === 0) {
    return null;
  }

  // 1. Emotional Baseline
  const totalScore = logs.reduce((sum, log) => sum + log.moodScore, 0);
  const emotionalBaseline = totalScore / logs.length;

  // 2. Stress Level
  let stressLevel = "medium";
  if (emotionalBaseline < 4) stressLevel = "high";
  else if (emotionalBaseline > 7) stressLevel = "low";

  // 3. Recovery Rate
  const ascLogs = [...logs].reverse();
  let dropCount = 0;
  let totalLogsToRecover = 0;

  for (let i = 1; i < ascLogs.length; i++) {
    if (ascLogs[i].moodScore < ascLogs[i - 1].moodScore) {
      // Drop detected
      let j = i + 1;
      while (j < ascLogs.length && ascLogs[j].moodScore <= ascLogs[i].moodScore) {
        j++;
      }
      if (j < ascLogs.length) {
        totalLogsToRecover += (j - i);
        dropCount++;
      }
    }
  }

  let recoveryRate = "medium";
  if (dropCount > 0) {
    const avgRecoverLogs = totalLogsToRecover / dropCount;
    if (avgRecoverLogs <= 1) recoveryRate = "fast";
    else if (avgRecoverLogs > 2) recoveryRate = "slow";
  }

  // 4. Dominant Emotion
  const emotionMap = {};
  logs.forEach((log) => {
    emotionMap[log.emotionTag] = (emotionMap[log.emotionTag] || 0) + 1;
  });
  let dominantEmotion = Object.keys(emotionMap).reduce((a, b) => 
    emotionMap[a] > emotionMap[b] ? a : b
  );

  const insight = await UserInsight.findOneAndUpdate(
    { userId },
    {
      emotionalBaseline,
      stressLevel,
      recoveryRate,
      dominantEmotion,
      lastUpdated: new Date()
    },
    { upsert: true, new: true }
  );

  return insight;
};

export const detectPatterns = async (userId) => {
  const logs = await MoodLog.find({ userId }).sort({ date: -1 }).limit(30);
  if (!logs || logs.length === 0) return [];

  const patterns = [];

  // 1. Day pattern
  const dayScores = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  logs.forEach(log => {
    const day = new Date(log.date).getDay();
    dayScores[day].push(log.moodScore);
  });

  let lowestDay = -1;
  let lowestAvg = 11;
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  Object.keys(dayScores).forEach(day => {
    if (dayScores[day].length > 0) {
      const avg = dayScores[day].reduce((sum, score) => sum + score, 0) / dayScores[day].length;
      if (avg < lowestAvg) {
        lowestAvg = avg;
        lowestDay = day;
      }
    }
  });

  if (lowestDay !== -1 && lowestAvg < 5) {
    patterns.push(`Mood is lowest on ${dayNames[lowestDay]}s`);
  }

  // 2. Low mood frequency
  const lowMoodsCount = logs.filter(log => log.moodScore < 4).length;
  if (lowMoodsCount > logs.length * 0.3) {
    patterns.push("Frequent low mood detected");
  }

  // 3. Improvement after activity
  const activityLogs = logs.filter(log => log.activityDone);
  if (activityLogs.length > 0) {
    let improvementCount = 0;
    const ascLogs = [...logs].reverse();

    ascLogs.forEach((log, index) => {
      if (log.activityDone && index > 0) {
        if (log.moodScore > ascLogs[index - 1].moodScore) {
          improvementCount++;
        }
      }
    });

    if (improvementCount > activityLogs.length * 0.4) {
      patterns.push("Mood improves after activity");
    }
  }

  return patterns;
};

export const forecastMood = async (userId) => {
  const logs = await MoodLog.find({ userId }).sort({ date: -1 }).limit(7);
  if (!logs || logs.length === 0) {
    return { predictedMood: 5, confidence: 0 };
  }

  const ascLogs = [...logs].reverse();
  const n = ascLogs.length;

  if (n === 1) {
    return { predictedMood: ascLogs[0].moodScore, confidence: 0.5 };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  ascLogs.forEach((log, index) => {
    const x = index;
    const y = log.moodScore;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Predict next log (index n)
  let predictedMood = slope * n + intercept;
  predictedMood = Math.max(1, Math.min(10, Math.round(predictedMood * 10) / 10));

  // Confidence calculation based on variance/R2
  let scoreSum = logs.reduce((sum, log) => sum + log.moodScore, 0);
  let meanY = scoreSum / n;
  let ssTot = 0;
  let ssRes = 0;

  ascLogs.forEach((log, index) => {
    const y = log.moodScore;
    const yPred = slope * index + intercept;
    ssTot += (y - meanY) * (y - meanY);
    ssRes += (y - yPred) * (y - yPred);
  });

  let confidence = 0.5;
  if (ssTot > 0) {
    const r2 = 1 - (ssRes / ssTot);
    confidence = Math.max(0.1, Math.min(0.9, Math.round(r2 * 10) / 10));
  }

  return { predictedMood, confidence };
};

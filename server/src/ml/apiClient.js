import axios from "axios";

const client = axios.create({
  baseURL: process.env.ML_SERVER_URL, // e.g. http://localhost:8000
  timeout: 5000,
});

// Generic POST request wrapper
export const mlPost = async (endpoint, payload) => {
  try {
    const { data } = await client.post(endpoint, payload);
    return data;
  } catch (err) {
    console.error("ML Server Error:", err.message);
    return null; // fallback for ML failure
  }
};

// Sentiment prediction example
export const getMoodPrediction = async (text) => {
  return await mlPost("/predict", { text });
};

// Recommendation example
export const getActivitySuggestions = async (moodScore, emotionTag) => {
  return await mlPost("/recommend", { moodScore, emotionTag });
};

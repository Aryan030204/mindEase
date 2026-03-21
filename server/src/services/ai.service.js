import { GoogleGenerativeAI } from "@google/generative-ai";
import { mlPost } from "../ml/apiClient.js";

/**
 * Mental health chatbot using Google Gemini API
 * Focused only on mental health, moods, stress, and emotional well-being
 */
export const askAI = async (message, conversationHistory = []) => {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error(
        "GEMINI_API_KEY is not configured in environment variables",
      );
      return "I'm here to support you, but my AI service is not properly configured. Please contact support.";
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // System prompt to ensure chatbot only responds to mental health topics
    const systemPrompt = `You are a compassionate and empathetic mental health support assistant for MindEase, a mental wellness application. 

Your role is to:
- Provide supportive, empathetic responses about mental health, moods, stress, and emotional well-being
- Offer gentle guidance and encouragement
- Help users understand and process their emotions
- Suggest healthy coping strategies when appropriate
- Maintain a warm, non-judgmental tone

IMPORTANT RULES:
- ONLY respond to questions about mental health, emotions, moods, stress, anxiety, depression, self-care, and emotional well-being
- If asked about topics outside mental health (weather, sports, politics, etc.), politely redirect: "I'm here specifically to support you with mental health and emotional well-being. How are you feeling today? Is there something on your mind related to your mental health?"
- Never provide medical diagnoses or replace professional therapy
- Encourage users to seek professional help for serious mental health concerns
- Keep responses concise, empathetic, and supportive
- Do not provide harmful advice or encourage dangerous behaviors

Previous conversation context:
${
  conversationHistory.length > 0
    ? conversationHistory
        .slice(-10)
        .map((msg) => `${msg.sender}: ${msg.text}`)
        .join("\n")
    : "This is the start of the conversation."
}

User's current message: ${message}

Provide a supportive, empathetic response focused on mental health and emotional well-being:`;

    // Generate response using Gemini
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const reply = response.text();

    if (!reply || reply.trim().length === 0) {
      throw new Error("Empty response from Gemini API");
    }

    return reply.trim();
  } catch (error) {
    console.error("Gemini API Error:", error.message);

    // Fallback responses based on error type
    if (error.message.includes("API_KEY")) {
      return "I'm here to support you, but there's an issue with my configuration. Please try again later or contact support.";
    }

    if (
      error.message.includes("timeout") ||
      error.message.includes("network")
    ) {
      return "I'm having trouble connecting right now, but I'm here for you. Please try again in a moment, or feel free to share what's on your mind.";
    }

    // Generic fallback
    return "I'm here with you. I may be having trouble responding fully right now, but you can share anything you're feeling. How are you doing today?";
  }
};

export const analyzeMoodText = async (text) => {
  try {
    const result = await mlPost("/predict", { text });
    return result;
  } catch {
    return { sentiment: "neutral", moodScore: 5 };
  }
};

export const generateDynamicRecommendations = async (
  moodScore,
  emotionTag,
  preferences = {},
) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error(
        "GEMINI_API_KEY is not configured in environment variables",
      );
      return null;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prefsText = Object.keys(preferences)
      .filter((k) => preferences[k])
      .join(", ");

    const prompt = `You are a mental health wellness assistant for Indian users. A user in India has logged their mood today.
Mood Score (1-10): ${moodScore}
Emotion Tag: ${emotionTag}
User Preferences: ${prefsText || "None specified"}

Generate exactly 6 short, actionable, and highly personalized wellness activities for them to do today. 
CRITICAL: The activities MUST be deeply rooted in Indian culture, lifestyle, daily habits, and way of living (e.g., involving masala chai, yoga, evening terrace walks, local music/ragas, family time, typical Indian meals/snacks, spirituality, etc.).

Keep each activity name under 8 words. Be creative, specific to the Indian context, and match their emotion and mood score perfectly.

Return the response ONLY as a JSON array of strings. Example:
["Sip unhurried masala chai by the window", "Listen to calming flute or sitar ragas", "Take a peaceful evening walk on the terrace"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const activities = JSON.parse(text);
    if (!Array.isArray(activities) || activities.length === 0) {
      throw new Error("Invalid format returned by Gemini");
    }

    return activities.slice(0, 6);
  } catch (error) {
    console.error("Gemini Recommendation Error:", error.message);
    return null;
  }
};

export const generateDynamicTips = async (moodScore, emotionTag) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error(
        "GEMINI_API_KEY is not configured in environment variables",
      );
      return null;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `You are a mental health wellness assistant for Indian users. A user in India has logged their mood today.
Mood Score (1-10): ${moodScore || "Not provided"}
Emotion Tag: ${emotionTag || "Not provided"}

Generate exactly 10 short, actionable, and profound general wellness tips for them.
CRITICAL: The tips MUST be deeply rooted in Indian culture, lifestyle, philosophy, and daily habits (e.g., Ayurveda, yoga, mindfulness, family values, traditional practices, etc.).

Keep each tip under 12 words. Make them uplifting, comforting, and matching their general mood state.

Return the response ONLY as a JSON array of exactly 10 strings. Example:
["Start your day with warm water and tulsi leaves", "Practice 10 minutes of Anulom Vilom pranayama", "Spend mindful time with your elders today"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const tips = JSON.parse(text);
    if (!Array.isArray(tips) || tips.length === 0) {
      throw new Error("Invalid format returned by Gemini");
    }

    return tips.slice(0, 10);
  } catch (error) {
    console.error("Gemini Tips Error:", error.message);
    return null;
  }
};

export const rephraseRecommendations = async (context, activities) => {
  const fallback = activities.map(a => ({ title: a, description: a }));

  try {
    if (!process.env.GEMINI_API_KEY) {
      return fallback;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `You are an AI formatting assistant used inside a production-grade backend system.

You are NOT responsible for decision making.
You are NOT responsible for generating recommendations.
You are ONLY responsible for rephrasing and personalizing already selected recommendations.

---

## CRITICAL SYSTEM ROLE DEFINITION

You are part of a hybrid recommendation system:
1. A deterministic engine has already selected the best activities.
2. Your job is ONLY to rewrite them, personalize tone, and add light contextual empathy.

You must NOT change logic, activities, add new activities, remove, or reorder activities.

---

## STRICT NON-NEGOTIABLE RULES
1. DO NOT generate any new activity.
2. DO NOT modify meaning.
3. DO NOT merge, drop, or hallucinate.
4. DO NOT output anything except valid JSON.
5. DO NOT change count items.

---

## INPUT STRUCTURE

User Context:
${JSON.stringify(context, null, 2)}

Activities:
${JSON.stringify(activities)}

---

## OBJECTIVE
Transform each activity into a personalized suggestion.
For EACH activity:
* Keep original intent unchanged
* Make it emotionally supportive
* Make it slightly personalized to context
* Keep it concise and natural

---

## STYLE GUIDELINES
Tone: calm, supportive, non-judgmental, human-like.
Language: simple English, light Hinglish natural options.
Cultural Context (India-specific): chai break, terrace walk, calm music, light family interaction. DO NOT overuse.

---

## PERSONALIZATION RULES
IF moodScore <= 4: tone = supportive + gentle, avoid high-energy.
IF moodScore >= 7: tone = uplifting + encouraging.
IF emotionTag = anxious: calming language.
IF timeOfDay = night: relaxing tone.

---

## OUTPUT FORMAT (STRICT)
Return ONLY valid JSON.
{
"recommendations": [
{
"title": "string",
"description": "string"
}
]
}

---

## FORBIDDEN BEHAVIOR
DO NOT suggest therapy or medication.
DO NOT mention AI.
DO NOT create long text.
DO NOT add emojis excessively.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const resultJson = JSON.parse(text);

    if (!resultJson || !Array.isArray(resultJson.recommendations)) {
      throw new Error("Invalid response format from Gemini");
    }

    const recommendations = resultJson.recommendations;

    // Validate size and structure
    if (recommendations.length !== activities.length) {
      throw new Error("Recommendations length mismatch");
    }

    const valid = recommendations.every(r => typeof r.title === 'string' && typeof r.description === 'string');
    if (!valid) {
      throw new Error("Recommendations fields type invalid");
    }

    return recommendations;
  } catch (error) {
    console.error("Gemini Rephrase Error:", error.message);
    return fallback;
  }
};

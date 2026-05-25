import { GoogleGenerativeAI } from "@google/generative-ai";
import { mlPost } from "../ml/apiClient.js";

const getGeminiClient = () => {
  if (!process.env.RECOMMENDATIONS_API_KEY) {
    return null;
  }

  return new GoogleGenerativeAI(process.env.RECOMMENDATIONS_API_KEY);
};

const getModel = (options = {}) => {
  const client = getGeminiClient();
  if (!client) {
    return null;
  }

  return client.getGenerativeModel({
    model: options.model || "gemini-2.5-flash",
    generationConfig: options.generationConfig,
  });
};

export const analyzeMoodText = async (text) => {
  try {
    const result = await mlPost("/predict", { text });
    return result;
  } catch {
    return { sentiment: "neutral", moodScore: 5 };
  }
};

export const rephraseRecommendations = async (context, activities) => {
  const fallback = activities.map((activity) => ({
    title: activity.title,
    description: activity.description,
  }));

  try {
    const model = getModel({
      generationConfig: { responseMimeType: "application/json" },
    });
    if (!model) {
      return fallback;
    }

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

Activities already selected by the deterministic engine:
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

    const valid = recommendations.every(
      (r) => typeof r.title === "string" && typeof r.description === "string"
    );
    if (!valid) {
      throw new Error("Recommendations fields type invalid");
    }

    return recommendations;
  } catch (error) {
    console.error("Gemini Rephrase Error:", error.message);
    return fallback;
  }
};

export const generateChatReply = async ({ message, context }) => {
  const fallback =
    "I’m here with you. It sounds like a lot is on your mind right now. Try one small grounding step, and if things feel intense or unsafe, please reach out to a trusted person or local professional support.";

  try {
    const model = getModel();
    if (!model) {
      return fallback;
    }

    const prompt = `You are MindEase's emotionally aware support chatbot.

You are only responsible for response generation. You must not invent diagnosis, therapy claims, or medical authority.
You must use the structured context exactly as support context, not as truth beyond what is provided.

Rules:
- Stay focused on emotional support, coping, reflection, and safe self-care.
- Do not claim to remember anything outside the provided context.
- Do not provide diagnosis or crisis guarantees.
- If the user asks for non-mental-wellness topics, gently redirect.
- Keep the reply practical, calm, and human.
- Use a tone that adapts to the user's likely state and personality context.

Structured context:
${JSON.stringify(context, null, 2)}

User message:
${message}

Return only the reply text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text()?.trim();
    return reply || fallback;
  } catch (error) {
    console.error("Gemini Chat Error:", error.message);
    return fallback;
  }
};

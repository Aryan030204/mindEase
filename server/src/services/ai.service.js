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
      console.error("GEMINI_API_KEY is not configured in environment variables");
      return "I'm here to support you, but my AI service is not properly configured. Please contact support.";
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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
${conversationHistory.length > 0 
  ? conversationHistory.slice(-10).map(msg => `${msg.sender}: ${msg.text}`).join('\n')
  : 'This is the start of the conversation.'
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
    
    if (error.message.includes("timeout") || error.message.includes("network")) {
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

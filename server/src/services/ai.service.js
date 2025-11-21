import axios from "axios";

export const askAI = async (message) => {
  try {
    // Hitting your AI backend (Node → Python / Gemini)
    const { data } = await axios.post(
      process.env.AI_CHAT_API_URL,
      { message },
      { timeout: 7000 }
    );

    return data?.reply || "I’m here for you. Tell me how you feel.";
  } catch (err) {
    console.log("AI Chat Error:", err.message);

    // Fallback response if AI fails
    return "I'm here with you. I may be having trouble responding fully, but you can share anything you're feeling.";
  }
};

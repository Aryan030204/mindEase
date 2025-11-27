# Gemini API Setup Guide

## Overview
The chatbot feature now uses Google Gemini API for AI-powered mental health support. The ML server is used only for mood predictions and activity recommendations.

## Environment Variables

Add the following to your `.env` file in the `server` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Add it to your `.env` file as `GEMINI_API_KEY`

## Features

### Chatbot (Gemini API)
- **Purpose**: Mental health support and emotional well-being conversations
- **Scope**: Only responds to mental health, moods, stress, and emotional topics
- **Behavior**: 
  - Redirects off-topic questions back to mental health
  - Provides empathetic, supportive responses
  - Maintains conversation context
  - Never provides medical diagnoses

### ML Server (Python)
- **Purpose**: Mood prediction and activity recommendations
- **Endpoints**:
  - `/predict` - Sentiment analysis and mood scoring
  - `/recommend` - Personalized activity suggestions based on mood

## Installation

After adding the Gemini API key, install the required package:

```bash
cd server
npm install
```

The `@google/generative-ai` package will be installed automatically.

## Testing

The chatbot will:
1. Use Gemini API if `GEMINI_API_KEY` is configured
2. Return helpful error messages if the API key is missing
3. Maintain conversation history for context-aware responses
4. Only respond to mental health-related topics

## Notes

- The chatbot is designed to be supportive and empathetic
- It redirects non-mental-health topics politely
- Conversation history is maintained for better context
- All conversations are stored in the database for user history




import pickle
import numpy as np
import os
from pathlib import Path

# Get the base directory (ML/app)
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"

# Load saved ML model & vectorizer
model_path = MODELS_DIR / "sentiment_model.pkl"
vectorizer_path = MODELS_DIR / "vectorizer.pkl"

# Check if models exist
if not model_path.exists() or not vectorizer_path.exists():
    print(f"Warning: Model files not found at {MODELS_DIR}")
    print("Using fallback sentiment analysis")
    model = None
    vectorizer = None
else:
    model = pickle.load(open(model_path, "rb"))
    vectorizer = pickle.load(open(vectorizer_path, "rb"))

def predict_sentiment(text: str):
    # Fallback if models are not loaded
    if model is None or vectorizer is None:
        # Simple keyword-based fallback
        text_lower = text.lower()
        if any(word in text_lower for word in ["great", "good", "happy", "excited", "wonderful", "amazing"]):
            sentiment = "positive"
            moodScore = 8
        elif any(word in text_lower for word in ["bad", "sad", "angry", "frustrated", "terrible", "awful"]):
            sentiment = "negative"
            moodScore = 3
        else:
            sentiment = "neutral"
            moodScore = 5
        
        return {
            "sentiment": sentiment,
            "moodScore": moodScore
        }
    
    # Use ML model
    X = vectorizer.transform([text])
    prediction = model.predict(X)[0]

    # map sentiment → mood score
    sentiment_to_mood = {
        "negative": 3,
        "neutral": 5,
        "positive": 8,
    }

    moodScore = sentiment_to_mood.get(prediction, 5)

    return {
        "sentiment": prediction,
        "moodScore": moodScore
    }

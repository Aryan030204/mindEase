import pickle
import numpy as np

# Load saved ML model & vectorizer
model = pickle.load(open("app/models/sentiment_model.pkl", "rb"))
vectorizer = pickle.load(open("app/models/vectorizer.pkl", "rb"))

def predict_sentiment(text: str):
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

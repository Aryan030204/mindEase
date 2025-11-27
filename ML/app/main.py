from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.predict_request import PredictRequest
from app.schemas.recommend_request import RecommendRequest
from app.services.ml_service import (
    process_sentiment_request,
    process_recommendation_request
)

app = FastAPI(title="MindEase ML Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Sentiment Prediction Endpoint
# -----------------------------
@app.post("/predict")
def predict_text(payload: PredictRequest):
    result = process_sentiment_request(payload.text)
    return {
        "sentiment": result["sentiment"],
        "moodScore": result["moodScore"]
    }

# -----------------------------
# Recommendation Endpoint
# -----------------------------
@app.post("/recommend")
def recommend_activity(payload: RecommendRequest):
    activities = process_recommendation_request(
        payload.moodScore,
        payload.emotionTag
    )
    return {
        "suggestions": activities
    }

@app.get("/")
def root():
    return {"message": "MindEase ML Server Running - Mood Prediction & Recommendations Only"}

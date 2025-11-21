from app.utils.sentiment import predict_sentiment
from app.utils.recommend import generate_recommendations

def process_sentiment_request(text: str):
    return predict_sentiment(text)

def process_recommendation_request(score: int, tag: str):
    return generate_recommendations(score, tag)

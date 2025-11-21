from pydantic import BaseModel

class RecommendRequest(BaseModel):
    moodScore: int
    emotionTag: str

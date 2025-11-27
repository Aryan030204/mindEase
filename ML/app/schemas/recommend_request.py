from typing import Dict, Optional
from pydantic import BaseModel


class RecommendRequest(BaseModel):
    moodScore: int
    emotionTag: str
    preferences: Optional[Dict[str, bool]] = None

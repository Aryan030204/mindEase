def generate_recommendations(moodScore: int, emotionTag: str):
    """
    Generate activity recommendations based on mood score and emotion tag.
    Returns only valid activities that match the backend enum:
    meditation, journaling, music, workout, breathing, walk
    """
    suggestions = []

    # Base suggestions based on mood score
    if moodScore <= 3:
        suggestions = ["breathing", "meditation", "journaling"]
    elif 3 < moodScore <= 6:
        suggestions = ["walk", "music", "breathing"]
    else:
        suggestions = ["workout", "music", "journaling"]

    # Emotion-based adjustments (using valid enum values)
    emotion_map = {
        "anxious": ["breathing", "meditation"],
        "sad": ["journaling", "music"],
        "angry": ["breathing", "walk"],
        "calm": ["music", "meditation"],
        "happy": ["workout", "music"],
        "excited": ["workout", "music"],
        "neutral": ["walk", "breathing"]
    }

    if emotionTag.lower() in emotion_map:
        suggestions.extend(emotion_map[emotionTag.lower()])

    # Remove duplicates and return only valid activities
    valid_activities = ["meditation", "journaling", "music", "workout", "breathing", "walk"]
    suggestions = [s for s in suggestions if s in valid_activities]
    
    return list(set(suggestions))  # remove duplicates

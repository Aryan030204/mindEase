def generate_recommendations(moodScore: int, emotionTag: str):
    suggestions = []

    if moodScore <= 3:
        suggestions = ["breathing", "meditation", "journaling"]
    elif 3 < moodScore <= 6:
        suggestions = ["walk", "light music", "stretching"]
    else:
        suggestions = ["workout", "upbeat music", "gratitude journaling"]

    # emotion-based adjustments
    emotion_map = {
        "anxious": ["breathing", "meditation"],
        "sad": ["journaling", "positive music"],
        "angry": ["cool-down breathing", "walk"],
        "calm": ["light music", "meditation"]
    }

    if emotionTag in emotion_map:
        suggestions.extend(emotion_map[emotionTag])

    return list(set(suggestions))  # remove duplicates

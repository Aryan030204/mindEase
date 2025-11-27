import random
from typing import Dict, Optional

VALID_ACTIVITIES = [
    "meditation",
    "journaling",
    "music",
    "workout",
    "breathing",
    "walk",
    "yoga",
    "stretching",
    "nature_walk",
    "digital_detox",
    "gratitude",
    "creative",
    "social_check_in",
    "therapy_check_in",
    "hydration_break",
    "mindful_eating",
]

ACTIVITY_LIBRARY = {
    "meditation": {
        "category": "meditation",
        "intensity": ["very_low", "low", "moderate"],
        "emotions": ["anxious", "angry", "sad", "overwhelmed", "stressed"],
        "base_score": 4,
    },
    "breathing": {
        "category": "meditation",
        "intensity": ["very_low", "low"],
        "emotions": ["anxious", "angry", "worried", "stressed"],
        "base_score": 4,
    },
    "journaling": {
        "category": "creative",
        "intensity": ["low", "moderate"],
        "emotions": ["sad", "overwhelmed", "confused", "neutral"],
        "base_score": 3,
    },
    "music": {
        "category": "music",
        "intensity": ["low", "moderate", "elevated"],
        "emotions": ["sad", "neutral", "happy", "excited"],
        "base_score": 3,
    },
    "workout": {
        "category": "exercise",
        "intensity": ["moderate", "elevated"],
        "emotions": ["angry", "sad", "tired"],
        "base_score": 3,
    },
    "walk": {
        "category": "movement",
        "intensity": ["low", "moderate"],
        "emotions": ["neutral", "stressed", "worried"],
        "base_score": 3,
    },
    "yoga": {
        "category": "exercise",
        "intensity": ["low", "moderate"],
        "emotions": ["anxious", "angry", "tired"],
        "base_score": 3,
    },
    "stretching": {
        "category": "movement",
        "intensity": ["very_low", "low"],
        "emotions": ["tired", "overwhelmed"],
        "base_score": 2,
    },
    "nature_walk": {
        "category": "nature",
        "intensity": ["moderate"],
        "emotions": ["sad", "worried", "stressed"],
        "base_score": 3,
    },
    "digital_detox": {
        "category": "rest",
        "intensity": ["very_low", "low"],
        "emotions": ["overwhelmed", "anxious"],
        "base_score": 2,
    },
    "gratitude": {
        "category": "reflection",
        "intensity": ["very_low", "low", "moderate"],
        "emotions": ["sad", "neutral"],
        "base_score": 2,
    },
    "creative": {
        "category": "creative",
        "intensity": ["moderate", "elevated"],
        "emotions": ["sad", "neutral", "happy"],
        "base_score": 2,
    },
    "social_check_in": {
        "category": "social",
        "intensity": ["moderate", "elevated"],
        "emotions": ["lonely", "sad", "worried"],
        "base_score": 2,
    },
    "therapy_check_in": {
        "category": "support",
        "intensity": ["very_low", "low"],
        "emotions": ["sad", "hopeless", "angry"],
        "base_score": 2,
    },
    "hydration_break": {
        "category": "rest",
        "intensity": ["very_low", "low", "moderate"],
        "emotions": ["tired", "stressed"],
        "base_score": 1,
    },
    "mindful_eating": {
        "category": "rest",
        "intensity": ["low", "moderate"],
        "emotions": ["neutral", "anxious"],
        "base_score": 1,
    },
}

EMOTION_CATEGORY_MAP = {
    "anxious": ["meditation", "breathing", "stretching", "digital_detox", "yoga"],
    "sad": ["journaling", "gratitude", "social_check_in", "nature_walk", "music"],
    "angry": ["breathing", "workout", "yoga", "therapy_check_in"],
    "stressed": ["breathing", "meditation", "walk", "digital_detox"],
    "overwhelmed": ["breathing", "gratitude", "stretching", "hydration_break"],
    "tired": ["stretching", "mindful_eating", "hydration_break"],
    "happy": ["creative", "music", "nature_walk", "social_check_in"],
    "excited": ["workout", "creative", "social_check_in"],
    "neutral": ["walk", "creative", "mindful_eating", "journaling"],
}

INTENSITY_MAP = {
    "very_low": ["breathing", "meditation", "gratitude", "hydration_break", "digital_detox"],
    "low": ["journaling", "stretching", "walk", "mindful_eating"],
    "moderate": ["music", "yoga", "nature_walk", "creative"],
    "elevated": ["workout", "social_check_in", "creative"],
}

PREFERENCE_MAP = {
    "exercise": ["workout", "yoga", "stretching", "nature_walk"],
    "music": ["music"],
    "meditation": ["meditation", "breathing", "yoga"],
}


def classify_intensity(score: int) -> str:
    if score <= 2:
        return "very_low"
    if score <= 4:
        return "low"
    if score <= 7:
        return "moderate"
    return "elevated"


def generate_recommendations(moodScore: int, emotionTag: str, preferences: Optional[Dict[str, bool]]):
    preferences = preferences or {}
    emotion = emotionTag.lower()
    intensity = classify_intensity(moodScore)

    ranked = []
    for activity, meta in ACTIVITY_LIBRARY.items():
        score = meta["base_score"]

        if intensity in meta["intensity"]:
            score += 2

        if emotion in meta["emotions"]:
            score += 3

        if emotion in EMOTION_CATEGORY_MAP and activity in EMOTION_CATEGORY_MAP[emotion]:
            score += 2

        if intensity in INTENSITY_MAP and activity in INTENSITY_MAP[intensity]:
            score += 1

        for pref, tags in PREFERENCE_MAP.items():
            if preferences.get(pref) and activity in tags:
                score += 2

        score += random.uniform(0, 1)  # add subtle randomness
        ranked.append((score, activity))

    ranked.sort(reverse=True)
    top_activities = [activity for _, activity in ranked[:8]]

    # Ensure we only return valid, unique activities
    unique_activities = []
    for activity in top_activities:
        if activity in VALID_ACTIVITIES and activity not in unique_activities:
            unique_activities.append(activity)

    if not unique_activities:
        unique_activities = ["meditation", "breathing", "journaling"]

    return unique_activities[:6]

import os
import random
import pickle
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, classification_report

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "app", "models")
DATA_DIR = os.path.join(BASE_DIR, "app", "data")
DATA_PATH = os.path.join(DATA_DIR, "mood_sentiment_dataset.csv")

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)


def build_dataset(min_rows: int = 1200) -> pd.DataFrame:
    positive_phrases = [
        "I feel grateful for",
        "Today was amazing because",
        "I'm excited about",
        "Feeling accomplished after",
        "I'm proud of",
        "Life feels joyful when",
        "I'm hopeful about",
        "I love spending time",
        "Feeling inspired to",
        "I'm content with",
        "Feeling supported by",
        "I appreciate",
        "Feeling peaceful during",
        "I'm energized when",
        "Feeling confident about",
        "I'm happy to share",
        "Feeling motivated to",
        "I found comfort in",
        "Feeling optimistic about",
        "I enjoyed",
    ]

    negative_phrases = [
        "I feel overwhelmed by",
        "Today was exhausting because",
        "I'm anxious about",
        "Feeling frustrated with",
        "I'm disappointed in",
        "Life feels heavy when",
        "I'm worried about",
        "Feeling lonely during",
        "I'm upset that",
        "Feeling stressed about",
        "I'm angry with",
        "Feeling drained after",
        "I'm sad about",
        "Feeling nervous about",
        "I struggled with",
        "Feeling hopeless about",
        "I'm afraid of",
        "Feeling heartbroken over",
        "I can't handle",
        "Feeling stuck in",
    ]

    neutral_phrases = [
        "I noticed",
        "Today I experienced",
        "I'm thinking about",
        "I'm observing",
        "I plan to",
        "I might consider",
        "I'm unsure about",
        "I'm reflecting on",
        "I have mixed feelings about",
        "I'm curious about",
        "I acknowledge",
        "I'm learning from",
        "I'm wondering about",
        "I'm noticing",
        "I have questions about",
        "I'm evaluating",
        "I'm processing",
        "I'm considering",
        "I'm exploring",
        "I'm neutral about",
    ]

    contexts = [
        "my work progress today",
        "the conversation with my friend",
        "the way I handled stress",
        "the weather this morning",
        "an upcoming meeting",
        "my family situation",
        "a recent accomplishment",
        "my sleep quality",
        "my health goals",
        "my relationship with others",
        "the news I heard",
        "my weekend plans",
        "my financial situation",
        "a creative project",
        "my daily routine",
        "my study goals",
        "my support system",
        "a personal challenge",
        "my future plans",
        "a change at work",
    ]

    detail_adjectives = [
        "deeply",
        "genuinely",
        "slightly",
        "moderately",
        "intensely",
        "remarkably",
        "gently",
        "surprisingly",
        "consistently",
        "quietly",
        "slowly",
        "suddenly",
        "carefully",
        "intentionally",
        "mindfully",
        "steadily",
        "softly",
        "warmly",
        "boldly",
        "lightly",
    ]

    categories = [
        (positive_phrases, "positive"),
        (negative_phrases, "negative"),
        (neutral_phrases, "neutral"),
    ]

    records = []
    for phrases, label in categories:
        for phrase in phrases:
            for context in contexts:
                modifier = random.choice(detail_adjectives)
                sentence = f"{phrase} {modifier} about {context}"
                records.append({"text": sentence.strip(), "label": label})

    df = pd.DataFrame(records)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    if len(df) < min_rows:
        multiplier = (min_rows // len(df)) + 1
        df = pd.concat([df] * multiplier, ignore_index=True)
        df = df.sample(n=min_rows, random_state=42).reset_index(drop=True)

    print(f"Dataset generated with {len(df)} rows")
    df.to_csv(DATA_PATH, index=False)
    return df


if os.path.exists(DATA_PATH):
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded existing dataset with {len(df)} rows from {DATA_PATH}")
else:
    df = build_dataset(min_rows=1500)

vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), min_df=5)
X = vectorizer.fit_transform(df["text"])
y = df["label"]

model = LogisticRegression(
    max_iter=2000,
    class_weight="balanced",
    solver="lbfgs",
    multi_class="auto",
)
model.fit(X, y)

preds = model.predict(X)
acc = accuracy_score(y, preds)
print("Training Accuracy:", round(acc * 100, 2), "%")
print("Detailed Metrics:\n", classification_report(y, preds))

model_path = os.path.join(MODEL_DIR, "sentiment_model.pkl")
vectorizer_path = os.path.join(MODEL_DIR, "vectorizer.pkl")

pickle.dump(model, open(model_path, "wb"))
pickle.dump(vectorizer, open(vectorizer_path, "wb"))

print("Model & Vectorizer Saved Successfully at:", MODEL_DIR)
print("Dataset saved at:", DATA_PATH)


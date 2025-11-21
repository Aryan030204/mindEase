import os
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score
import pickle

# ---------------------------------------------
# 1. Auto-create folder structure
# ---------------------------------------------
MODEL_DIR = "app/models"
os.makedirs(MODEL_DIR, exist_ok=True)

# ---------------------------------------------
# 2. Build a bigger sample dataset
# ---------------------------------------------
texts = [
    "I am very happy today",
    "Feeling really sad and depressed",
    "I am anxious and stressed",
    "What a wonderful day!",
    "I hate this so much",
    "Life is beautiful",
    "I'm so angry right now",
    "Everything is okay",
    "This is terrible",
    "I'm calm and relaxed",
    "Feeling joyful and energetic",
    "This made me upset",
    "I'm feeling neutral today",
    "I'm worried about tomorrow",
    "Today was awesome",
]

labels = [
    "positive",
    "negative",
    "negative",
    "positive",
    "negative",
    "positive",
    "negative",
    "neutral",
    "negative",
    "neutral",
    "positive",
    "negative",
    "neutral",
    "negative",
    "positive",
]

df = pd.DataFrame({"text": texts, "label": labels})

# ---------------------------------------------
# 3. Train TF-IDF + Logistic Regression
# ---------------------------------------------
vectorizer = TfidfVectorizer(stop_words="english")
X = vectorizer.fit_transform(df["text"])
y = df["label"]

model = LogisticRegression(max_iter=1000)
model.fit(X, y)

# ---------------------------------------------
# 4. Evaluate accuracy on training data
# (OK for small dataset)
# ---------------------------------------------
preds = model.predict(X)
acc = accuracy_score(y, preds)
print("Training Accuracy:", acc)

# ---------------------------------------------
# 5. Save model + vectorizer
# ---------------------------------------------
pickle.dump(model, open(os.path.join(MODEL_DIR, "sentiment_model.pkl"), "wb"))
pickle.dump(vectorizer, open(os.path.join(MODEL_DIR, "vectorizer.pkl"), "wb"))

print("Model & Vectorizer Saved Successfully at:", MODEL_DIR)

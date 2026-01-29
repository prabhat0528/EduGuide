import pandas as pd
import joblib
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import CountVectorizer
import os

DATA_PATH = "Coursera.csv"
MODEL_DIR = "models"

os.makedirs(MODEL_DIR, exist_ok=True)

stemmer = PorterStemmer()

def tag_stemmer(text):
    text = str(text).lower()
    return " ".join(stemmer.stem(word) for word in text.split())

print("Loading dataset...")
course_df = pd.read_csv(DATA_PATH)

course_df['tags'] = (
    course_df['Course Description'].fillna('') + " " +
    course_df['Skills'].fillna('')
)

print("Stemming...")
course_df['tags'] = course_df['tags'].apply(tag_stemmer)

course_df = course_df[
    ['Course Name', 'University', 'Difficulty Level',
     'Course Rating', 'Course URL', 'tags']
]

print("Training vectorizer...")
cv = CountVectorizer(max_features=4000, stop_words='english')
cv_matrix = cv.fit_transform(course_df['tags'])

print("Saving models...")
joblib.dump(cv, f"{MODEL_DIR}/count_vectorizer.pkl")
joblib.dump(cv_matrix, f"{MODEL_DIR}/cv_matrix.pkl")
joblib.dump(course_df, f"{MODEL_DIR}/course_df.pkl")

print("Training complete")

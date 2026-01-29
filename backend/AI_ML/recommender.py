from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from nltk.stem.porter import PorterStemmer
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

# Load pre-trained artifacts (VERY FAST)
cv = joblib.load(os.path.join(MODEL_DIR, "count_vectorizer.pkl"))
cv_matrix = joblib.load(os.path.join(MODEL_DIR, "cv_matrix.pkl"))
course_df = joblib.load(os.path.join(MODEL_DIR, "course_df.pkl"))

stemmer = PorterStemmer()

def tag_stemmer(text):
    text = str(text).lower()
    return " ".join(stemmer.stem(word) for word in text.split())

def recommend_courses(search_query, difficulty, top_k=10):
    processed_query = tag_stemmer(search_query)
    query_vector = cv.transform([processed_query])

    # FILTER FIRST (huge speed gain)
    filtered_idx = course_df[
        course_df['Difficulty Level'].str.lower() == difficulty.lower()
    ].index

    if len(filtered_idx) == 0:
        return []

    similarity_scores = cosine_similarity(
        query_vector,
        cv_matrix[filtered_idx]
    )[0]

    top_indices = filtered_idx[np.argsort(similarity_scores)[::-1][:top_k]]

    recommendations = []
    for idx in top_indices:
        course = course_df.loc[idx]
        recommendations.append({
            "Course Name": course["Course Name"],
            "University": course["University"],
            "Rating": course["Course Rating"],
            "URL": course["Course URL"]
        })

    return recommendations

@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json(force=True)
        topic = data.get("topic", "").strip()
        difficulty = data.get("difficulty", "").strip()

        if not topic or not difficulty:
            return jsonify({"error": "Missing topic or difficulty"}), 400

        result = recommend_courses(topic, difficulty)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Render requires this
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port)

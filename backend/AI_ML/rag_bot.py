import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

from langchain_google_genai import (
    GoogleGenerativeAIEmbeddings,
    ChatGoogleGenerativeAI
)
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA

# ==========================
# App Setup
# ==========================
app = Flask(__name__)
CORS(app)

# ==========================
# Env
# ==========================
load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_KEY")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INDEX_DIR = os.path.join(BASE_DIR, "faiss_index_edu")

# ==========================
# Load Vector Store (FAST)
# ==========================
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=GEMINI_KEY
)

vector_store = FAISS.load_local(
    INDEX_DIR,
    embeddings,
    allow_dangerous_deserialization=True
)

# ==========================
# LLM + QA Chain
# ==========================
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GEMINI_KEY,
    convert_system_message_to_human=True
)

qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    chain_type="stuff",
    retriever=vector_store.as_retriever(search_kwargs={"k": 3})
)

# ==========================
# API Route
# ==========================
@app.route("/get-information", methods=["POST"])
def get_information():
    data = request.get_json()

    if not data or "question" not in data:
        return jsonify({"error": "Question is required"}), 400

    response = qa_chain.invoke(data["question"])

    return jsonify({
        "question": data["question"],
        "answer": response["result"]
    })

# ==========================
# Run (Render-compatible)
# ==========================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)

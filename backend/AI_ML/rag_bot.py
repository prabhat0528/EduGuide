import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA

# ==========================
# App Setup
# ==========================
app = Flask(__name__)
CORS(app)

# ==========================
# Load Environment Variables
# ==========================
load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_KEY")

# ==========================
# Initialize Embeddings
# ==========================
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=GEMINI_KEY
)

# ==========================
# Build Vector Store
# ==========================
def create_vector_store():
    print("Building vector database...")

    file_path = "./EduGuideDocs.pdf"
    if not os.path.exists(file_path):
        raise FileNotFoundError("EduGuideDocs.pdf not found")

    loader = PyPDFLoader(file_path)
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(docs)

    vector_store = FAISS.from_documents(chunks, embeddings)
    return vector_store

vector_store = create_vector_store()

# ==========================
# Initialize LLM & QA Chain
# ==========================
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GEMINI_KEY
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
# Run Server 
# ==========================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)

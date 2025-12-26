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
# Load / Build Vector Store
# ==========================
VECTOR_DB_PATH = "faiss_index_edu"

def create_vector_store():
    file_path = "./EduGuideDocs.pdf"

    loader = PyPDFLoader(file_path)
    docs = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_documents(docs)

    vector_store = FAISS.from_documents(chunks, embeddings)
    vector_store.save_local(VECTOR_DB_PATH)
    return vector_store

if os.path.exists(VECTOR_DB_PATH):
    print("Loading existing vector database...")
    vector_store = FAISS.load_local(VECTOR_DB_PATH, embeddings, allow_dangerous_deserialization=True)
else:
    print("Creating new vector database...")
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
    query = data.get("question")

    if not query:
        return jsonify({"error": "Question is required"}), 400

    response = qa_chain.invoke(query)
    return jsonify({
        "question": query,
        "answer": response["result"]
    })

# ==========================
# Run Server
# ==========================
if __name__ == "__main__":
    app.run(port = 8080, host = '0.0.0.0', debug=True)

import os
from dotenv import load_dotenv
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS

# ==========================
# Env
# ==========================
load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_KEY")

PDF_PATH = "EduGuideDocs.pdf"
INDEX_DIR = "faiss_index_edu"

# ==========================
# Embeddings
# ==========================
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=GEMINI_KEY
)

def build_index():
    print("Loading PDF...")
    loader = PyPDFLoader(PDF_PATH)
    docs = loader.load()

    print("Splitting text...")
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )
    chunks = splitter.split_documents(docs)

    print("Creating embeddings & FAISS index...")
    vector_store = FAISS.from_documents(chunks, embeddings)

    print("Saving FAISS index...")
    vector_store.save_local(INDEX_DIR)

    print(" FAISS index built successfully")

if __name__ == "__main__":
    build_index()

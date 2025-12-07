from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

gemini_key = os.getenv("GEMINI_KEY")

if not gemini_key:
    raise ValueError(" GEMINI_KEY not found in .env file!")

model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=gemini_key
)

prompt = PromptTemplate(
    input_variables=["x"],
    template="""
You are an inspiring mentor who gives powerful study-related motivational quotes.

Generate exactly ONE quote that is:
- Focused on study, learning, discipline, success, consistency, or personal growth.
- Said by a real great personality (scientist, philosopher, author, leader, innovator).
- Unique and not a commonly viral social media quote.

Format STRICTLY:
"Quote" — Name
"""
)


chain = LLMChain(llm=model, prompt=prompt)

@app.route("/get-motivation", methods=["GET"])
def get_motivation():
    try:
        result = chain.run({"x": ""})
        return jsonify({"quote": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Motivation API is running!"})

if __name__ == "__main__":
    app.run(debug=True)

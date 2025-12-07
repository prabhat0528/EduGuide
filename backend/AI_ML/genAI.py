from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Load API key
gemini_key = os.getenv("GEMINI_KEY")

if not gemini_key:
    raise ValueError("GEMINI_KEY not found in .env file!")

# Initialize Gemini model
model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=gemini_key
)

# Prompt template
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

# Chain using pipe operator
chain = prompt | model

@app.route("/get-motivation", methods=["GET"])
def get_motivation():
    try:
        # Run chain
        result = chain.invoke({"x": ""})

        # result.content gives the actual text
        return jsonify({"quote": result.content})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Motivation API is running!"})


if __name__ == "__main__":
    app.run(port=5000, host="0.0.0.0", debug=True)

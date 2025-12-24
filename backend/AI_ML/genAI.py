from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
import os
import json

# ==================================================
# LOAD ENV
# ==================================================
load_dotenv()

app = Flask(__name__)
CORS(app)

# ==================================================
# API KEY
# ==================================================
GEMINI_KEY = os.getenv("GEMINI_KEY")
if not GEMINI_KEY:
    raise RuntimeError("GEMINI_KEY not found in environment")

# ==================================================
# GEMINI MODEL
# ==================================================
model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GEMINI_KEY,
    temperature=0.3
)

# ==================================================
# MOTIVATION PROMPT 
# ==================================================
motivation_prompt = PromptTemplate(
    input_variables=["x"],
    template="""
You are an inspiring mentor.

Generate exactly ONE powerful study-related motivational quote.

Rules:
- About learning, discipline, consistency, growth, or success
- Said by a real great personality
- Not a commonly viral quote

STRICT FORMAT:
"Quote" — Name
"""
)

motivation_chain = motivation_prompt | model

# ==================================================
# STRUCTURED ROADMAP PROMPT
# ==================================================
roadmap_prompt = PromptTemplate(
    input_variables=["user_prompt"],
    template="""
You are a calm, practical career mentor.

Create a learning roadmap for:
"{user_prompt}"

Return ONLY valid JSON in exactly this format:

{
  "Month 1": {
    "Week 1": "...",
    "Week 2": "...",
    "Week 3": "...",
    "Week 4": "..."
  },
  "Month 2": {
    "Week 1": "...",
    "Week 2": "...",
    "Week 3": "...",
    "Week 4": "..."
  },
  "Month 3": {
    "Week 1": "...",
    "Week 2": "...",
    "Week 3": "...",
    "Week 4": "..."
  }
}

Rules:
- Keep guidance vague and high-level
- No explanations
- No extra text outside JSON
- No emojis
"""
)

roadmap_chain = roadmap_prompt | model

# ==================================================
# ROUTES
# ==================================================
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "service": "AI Mentor API"
    })

@app.route("/get-motivation", methods=["GET"])
def get_motivation():
    try:
        result = motivation_chain.invoke({"x": ""})
        return jsonify({
            "success": True,
            "quote": result.content.strip()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/generate-roadmap", methods=["POST"])
def generate_roadmap():
    try:
        data = request.get_json(silent=True)
        if not data or not data.get("prompt"):
            return jsonify({
                "success": False,
                "error": "Prompt is required"
            }), 400

        result = roadmap_chain.invoke({
            "user_prompt": data["prompt"]
        })

        raw_output = result.content.strip()

        # Convert LLM output into proper JSON
        roadmap_data = json.loads(raw_output)

        return jsonify({
            "success": True,
            "roadmap": roadmap_data
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ==================================================
# RUN SERVER
# ==================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

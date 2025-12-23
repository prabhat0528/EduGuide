from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
import os
import json
import re

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
    temperature=0.2
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
# ROADMAP PROMPT 
# ==================================================
roadmap_prompt = PromptTemplate(
    input_variables=["user_prompt"],
    template="""
SYSTEM INSTRUCTION (STRICT):
You are a senior software engineering instructor.

ABSOLUTE RULES:
- Output VALID JSON ONLY
- NO markdown
- NO explanations
- NO comments
- NO trailing commas
- Use ONLY correct technical terminology
- NO spelling mistakes
- NO corrupted or meaningless words
- Professional, clear English only

JSON FORMAT:
{
  "title": "Short roadmap title",
  "duration": "Total duration",
  "months": [
    {
      "month": "Month 1",
      "goal": "Main focus of this month",
      "weeks": [
        {
          "week": "Week 1",
          "focus": "Clear technical topic name",
          "details": "Well-structured explanation in professional English",
          "outcome": "Concrete measurable learning outcome"
        }
      ]
    }
  ]
}

STUDENT REQUEST:
"{user_prompt}"
"""
)

roadmap_chain = roadmap_prompt | model

# ==================================================
# JSON SANITIZER
# ==================================================
def sanitize_and_parse_json(text: str):
    # Normalize quotes
    text = text.replace("“", '"').replace("”", '"').replace("’", "'")

    # Extract JSON block
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("No JSON object found in model output")

    json_text = match.group()

    # Remove trailing commas
    json_text = re.sub(r",\s*}", "}", json_text)
    json_text = re.sub(r",\s*]", "]", json_text)

    return json.loads(json_text)

# ==================================================
# QUALITY VALIDATION
# ==================================================
def validate_roadmap_text(roadmap: dict):
    forbidden_patterns = [
        r"\bmm\b", r"\bdd\b", r"\bxx\b",
        r"[A-Za-z]{2,}[A-Z]{2,}[a-z]+"
    ]

    text = json.dumps(roadmap)
    for pattern in forbidden_patterns:
        if re.search(pattern, text):
            raise ValueError("Low-quality or corrupted text detected")

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

        roadmap = sanitize_and_parse_json(result.content)
        validate_roadmap_text(roadmap)

        return jsonify({
            "success": True,
            "roadmap": roadmap
        })

    except json.JSONDecodeError:
        return jsonify({
            "success": False,
            "error": "Model returned invalid JSON. Try again."
        }), 500

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

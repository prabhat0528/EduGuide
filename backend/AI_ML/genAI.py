from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
import os
import json
import re

# --------------------------------------------------
# Load env
# --------------------------------------------------
load_dotenv()

app = Flask(__name__)
CORS(app)

# --------------------------------------------------
# API Key
# --------------------------------------------------
GEMINI_KEY = os.getenv("GEMINI_KEY")
if not GEMINI_KEY:
    raise RuntimeError("GEMINI_KEY not found in environment")

# --------------------------------------------------
# Gemini Model
# --------------------------------------------------
model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GEMINI_KEY,
    temperature=0.6
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
# ROADMAP PROMPT (JSON HARD MODE)
# ==================================================
roadmap_prompt = PromptTemplate(
    input_variables=["user_prompt"],
    template="""
SYSTEM INSTRUCTION:
You MUST respond with VALID JSON ONLY.
NO markdown.
NO explanations.
NO comments.
NO extra text.
NO trailing commas.
Use standard double quotes only.

JSON FORMAT:
{{
  "title": "Short roadmap title",
  "duration": "Total duration",
  "months": [
    {{
      "month": "Month 1",
      "goal": "Main focus of this month",
      "weeks": [
        {{
          "week": "Week 1",
          "focus": "What to learn",
          "details": "Clear explanation",
          "outcome": "What the learner will achieve"
        }}
      ]
    }}
  ]
}}

STUDENT REQUEST:
"{user_prompt}"
"""
)

roadmap_chain = roadmap_prompt | model

# ==================================================
# JSON SANITIZER
# ==================================================
def sanitize_and_parse_json(text: str):
    """
    Safely extract and parse JSON from LLM output
    """
    # Remove smart quotes
    text = text.replace("“", '"').replace("”", '"').replace("’", "'")

    # Extract first JSON object (non-greedy)
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("No JSON object found in model output")

    json_text = match.group()

    # Remove trailing commas
    json_text = re.sub(r",\s*}", "}", json_text)
    json_text = re.sub(r",\s*]", "]", json_text)

    return json.loads(json_text)

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
# RUN
# ==================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

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
# Load API key
# --------------------------------------------------
gemini_key = os.getenv("GEMINI_KEY")
if not gemini_key:
    raise ValueError("GEMINI_KEY not found in .env file!")

# --------------------------------------------------
# Initialize Gemini
# --------------------------------------------------
model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=gemini_key,
    temperature=0.7
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
- Related to learning, discipline, consistency, growth, or success
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
You are a highly experienced personal mentor.

Create a DETAILED, REALISTIC learning roadmap.

ABSOLUTE RULES:
- Output ONLY valid JSON
- No markdown
- No explanations
- No extra text
- Start with { and end with }

JSON STRUCTURE:
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
          "focus": "What to learn",
          "details": "Clear explanation",
          "outcome": "What the learner will achieve"
        }
      ]
    }
  ]
}

Student request:
"{user_prompt}"
"""
)

roadmap_chain = roadmap_prompt | model

# ==================================================
#  Safe JSON Extraction
# ==================================================
def extract_json(text):
    """
    Extract and parse first valid JSON object from model output
    """
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        raise ValueError("No valid JSON found in model response")
    return json.loads(match.group())

# ==================================================
# ROUTES
# ==================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "AI Mentor API is running!"})


@app.route("/get-motivation", methods=["GET"])
def get_motivation():
    try:
        result = motivation_chain.invoke({"x": ""})
        return jsonify({"success": True, "quote": result.content})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/generate-roadmap", methods=["POST"])
def generate_roadmap():
    try:
        data = request.get_json()
        user_prompt = data.get("prompt")

        if not user_prompt:
            return jsonify({
                "success": False,
                "error": "Prompt is required"
            }), 400

        result = roadmap_chain.invoke({
            "user_prompt": user_prompt
        })

        raw_output = result.content

        # # Debug 
        # print("\n----- RAW MODEL OUTPUT -----\n", raw_output)

        roadmap_json = extract_json(raw_output)

        return jsonify({
            "success": True,
            "roadmap": roadmap_json
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ==================================================
# RUN
# ==================================================
if __name__ == "__main__":
    app.run(port=5000, host="0.0.0.0", debug=True)

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
import os
import json
import traceback

# ==================================================
# LOAD ENV
# ==================================================
load_dotenv()

app = Flask(__name__)

CORS(app)

# ==================================================
# API KEY & MODEL CONFIG
# ==================================================
GEMINI_KEY = os.getenv("GEMINI_KEY")
if not GEMINI_KEY:
    raise RuntimeError("GEMINI_KEY not found in environment")

model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GEMINI_KEY,
    temperature=0.2 
)

# ==================================================
# JSON EXTRACT
# ==================================================
def extract_json(text):
    """
    Safely extracts JSON even if the model wraps it in markdown blocks
    """
    try:
       
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        text = text.strip()
        start = text.find("{")
        end = text.rfind("}") + 1

        if start == -1 or end == -1:
            raise ValueError("No valid JSON object found in response")

        return json.loads(text[start:end])
    except Exception as e:
        print(f"JSON Parsing Error: {e} | Raw Text: {text}")
        raise ValueError("AI provided invalid data format.")

# ==================================================
# PROMPTS
# ==================================================
motivation_prompt = PromptTemplate(
    input_variables=["x"],
    template="""Generate ONE powerful study-related quote. 
    Format: "Quote" — Name. No other text."""
)

roadmap_prompt = PromptTemplate(
    input_variables=["user_prompt"],
    template="""
You are a career mentor. Create a 3-month roadmap for: "{user_prompt}"

Return ONLY valid JSON.
The structure must be exactly like this:
{{
  "Month 1": {{
    "Week 1": "Topic",
    "Week 2": "Topic",
    "Week 3": "Topic",
    "Week 4": "Topic"
  }},
  "Month 2": {{
    "Week 1": "Topic",
    "Week 2": "Topic",
    "Week 3": "Topic",
    "Week 4": "Topic"
  }},
  "Month 3": {{
    "Week 1": "Topic",
    "Week 2": "Topic",
    "Week 3": "Topic",
    "Week 4": "Topic"
  }}
}}

Rules:
- Valid JSON only.
- No emojis.
- No conversational text.
"""
)

# Chains
motivation_chain = motivation_prompt | model
roadmap_chain = roadmap_prompt | model

# ==================================================
# ROUTES
# ==================================================
@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "running", "service": "AI Mentor API"})

@app.route("/get-motivation", methods=["GET"])
def get_motivation():
    try:
        result = motivation_chain.invoke({"x": ""})
        return jsonify({
            "success": True,
            "quote": result.content.strip()
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/generate-roadmap", methods=["POST"])
def generate_roadmap():
    try:
        data = request.get_json(silent=True)
        if not data or not data.get("prompt"):
            return jsonify({"success": False, "error": "Prompt is required"}), 400

        # Invoke Model
        result = roadmap_chain.invoke({"user_prompt": data["prompt"]})
        
        # Process and Parse
        raw_output = result.content.strip()
        roadmap_data = extract_json(raw_output)

        return jsonify({
            "success": True,
            "roadmap": roadmap_data
        })

    except Exception as e:
       
        print("--- ERROR LOG START ---")
        traceback.print_exc()
        print("--- ERROR LOG END ---")
        
        return jsonify({
            "success": False,
            "error": "Failed to generate roadmap. Please try a different prompt."
        }), 500

# ==================================================
# RUN SERVER
# ==================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
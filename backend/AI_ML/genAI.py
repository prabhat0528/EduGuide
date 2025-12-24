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
    try:
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]

        text = text.strip()
        start = text.find("{")
        end = text.rfind("}") + 1

        if start == -1 or end == -1:
            raise ValueError("No valid JSON found")

        return json.loads(text[start:end])
    except Exception as e:
        print("JSON Parsing Error:", e)
        print("Raw Output:", text)
        raise ValueError("Invalid AI JSON format")

# ==================================================
# PROMPTS
# ==================================================
roadmap_prompt = PromptTemplate(
    input_variables=["user_prompt"],
    template="""
You are a career mentor.

The user will specify a learning goal and a duration.
Generate a roadmap for exactly the requested duration.

Return ONLY valid JSON.

JSON format:
{
  "Month 1": { "Week 1": "Topic", "Week 2": "Topic", "Week 3": "Topic", "Week 4": "Topic" },
  "Month 2": { "Week 1": "Topic", "Week 2": "Topic", "Week 3": "Topic", "Week 4": "Topic" }
}

Rules:
- Months must match user's request.
- Always follow Month X / Week Y structure.
- Meaningful content.
- Valid JSON only.
- No emojis. No extra text.

User Request: "{user_prompt}"
"""
)

roadmap_chain = roadmap_prompt | model

# ==================================================
# ROUTES
# ==================================================
@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "running"})

@app.route("/generate-roadmap", methods=["POST"])
def generate_roadmap():
    try:
        data = request.get_json(silent=True)
        if not data or not data.get("prompt"):
            return jsonify({"success": False, "error": "Prompt is required"}), 400

        result = roadmap_chain.invoke({"user_prompt": data["prompt"]})
        roadmap_data = extract_json(result.content.strip())

        return jsonify({"success": True, "roadmap": roadmap_data})

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": "Failed to generate roadmap. Try again."
        }), 500

# ==================================================
# RUN SERVER
# ==================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

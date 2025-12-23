from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
import os

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
# SIMPLE ROADMAP PROMPT (DEBUG MODE)
# ==================================================
simple_roadmap_prompt = PromptTemplate(
    input_variables=["user_prompt"],
    template="""
You are a software engineering mentor.

In simple plain text (NOT JSON),
give a short learning roadmap for the following request.

Keep it concise and clear.

REQUEST:
"{user_prompt}"
"""
)

simple_roadmap_chain = simple_roadmap_prompt | model

# ==================================================
# ROUTES
# ==================================================
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "running",
        "service": "AI Mentor API (Debug Mode)"
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

        result = simple_roadmap_chain.invoke({
            "user_prompt": data["prompt"]
        })

        return jsonify({
            "success": True,
            "roadmap": result.content.strip()
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

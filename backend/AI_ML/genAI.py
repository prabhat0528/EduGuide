from flask import Flask, jsonify, request
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
    google_api_key=gemini_key,
    temperature=0.7
)

# ---------------- MOTIVATION PROMPT ----------------
motivation_prompt = PromptTemplate(
    input_variables=["x"],
    template="""
You are an inspiring mentor who gives powerful study-related motivational quotes.

Generate exactly ONE quote that is:
- Focused on study, learning, discipline, success, consistency, or personal growth.
- Said by a real great personality.
- Unique and not a commonly viral quote.

Format STRICTLY:
"Quote" — Name
"""
)

motivation_chain = motivation_prompt | model


# ---------------- ROADMAP PROMPT ----------------
roadmap_prompt = PromptTemplate(
    input_variables=["user_prompt"],
    template="""
You are a highly experienced personal mentor guiding a student one-on-one.

The student asked:
"{user_prompt}"

Your task:
- Create a detailed, realistic, time-bound learning roadmap.
- Respect the duration mentioned by the student (weeks or months).
- Break it into clear timelines like Month 1, Week 1–2, etc.
- Explain what to study, why it matters, and what outcome the student should achieve.
- Maintain a friendly, encouraging mentor tone.

STRICT OUTPUT RULES:
- Plain text only
- Do NOT use *, #, markdown, emojis, or special symbols
- Use clean headings and hyphen-based bullet points only
- No unnecessary filler, be clear and practical
"""
)

roadmap_chain = roadmap_prompt | model


# ---------------- ROUTES ----------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "AI Mentor API is running!"})


@app.route("/get-motivation", methods=["GET"])
def get_motivation():
    try:
        result = motivation_chain.invoke({"x": ""})
        return jsonify({"quote": result.content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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

        return jsonify({
            "success": True,
            "roadmap": result.content
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(port=5000, host="0.0.0.0", debug=True)

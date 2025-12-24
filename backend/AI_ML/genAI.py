from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
import os
import json
import traceback
import re

load_dotenv()

app = Flask(__name__)

CORS(app)

GEMINI_KEY = os.getenv("GEMINI_KEY")


model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash", 
    google_api_key=GEMINI_KEY,
    temperature=0.1 
)

def extract_json(text):
    try:
       
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if not match:
            raise ValueError("No JSON object found in response")
        
        json_str = match.group(0)
        return json.loads(json_str)
    except Exception as e:
        print(f"Extraction Error: {e}")
        print(f"Raw AI Text: {text}")
        raise ValueError("AI failed to return valid JSON format")

roadmap_prompt = PromptTemplate(
    input_variables=["user_prompt"],
    template="""You are a professional career mentor.
Generate a highly structured learning roadmap for: "{user_prompt}".

Strictly return ONLY a JSON object. No markdown formatting, no triple backticks, no preamble.

Required JSON Structure:
{{
  "Month 1": {{ "Week 1": "Topic", "Week 2": "Topic", "Week 3": "Topic", "Week 4": "Topic" }},
  "Month 2": {{ "Week 1": "Topic", "Week 2": "Topic", "Week 3": "Topic", "Week 4": "Topic" }}
}}

Rules:
1. Use the exact duration requested in the prompt.
2. Provide specific, actionable learning topics.
3. No emojis.
4. No extra text outside the JSON."""
)

roadmap_chain = roadmap_prompt | model

@app.route("/generate-roadmap", methods=["POST"])
def generate_roadmap():
    try:
        data = request.get_json(silent=True)
        if not data or not data.get("prompt"):
            return jsonify({"success": False, "error": "Prompt is required"}), 400

        result = roadmap_chain.invoke({"user_prompt": data["prompt"]})
        
        # result.content might be a string or object depending on version
        content = result.content if hasattr(result, 'content') else str(result)
        roadmap_data = extract_json(content)

        return jsonify({"success": True, "roadmap": roadmap_data})

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "success": False, 
            "error": str(e) if "AI failed" in str(e) else "Internal Server Error"
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
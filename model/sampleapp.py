import os
import requests
import base64
import time
import traceback
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
import jwt

# ============================================================
# 1️⃣ Load environment variables
# ============================================================
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ============================================================
# 2️⃣ Initialize Flask and Supabase
# ============================================================
app = Flask(__name__)
CORS(app)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================================================
# 3️⃣ JWT Authentication Decorator
# ============================================================
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token or not token.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401
        try:
            token = token.split(" ")[1]
            decoded = jwt.decode(token, options={"verify_signature": False})
            request.user_id = decoded.get("sub")
        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401
        return f(*args, **kwargs)
    return decorated

# ============================================================
# 4️⃣ Helper: Generate AI Response via Groq
# ============================================================
def generate_ai_response(prompt):
    try:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": "You are a helpful admission assistant."},
                {"role": "user", "content": prompt}
            ]
        }
        response = requests.post(url, headers=headers, json=payload)
        result = response.json()
        return result["choices"][0]["message"]["content"]
    except Exception as e:
        print(traceback.format_exc())
        return "Sorry, I couldn’t process your request."

# ============================================================
# 5️⃣ Authentication Routes (Signup & Login)
# ============================================================
@app.route("/api/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        result = supabase.auth.sign_up({"email": email, "password": password})
        return jsonify({"message": "User registered successfully", "data": result})
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 400


@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        result = supabase.auth.sign_in_with_password({"email": email, "password": password})
        access_token = result.session.access_token
        user_id = result.user.id

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user_id": user_id
        })
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 401

# ============================================================
# 6️⃣ Protected Routes (Require JWT)
# ============================================================
@app.route("/api/respond", methods=["POST"])
@require_auth
def respond():
    try:
        user_id = request.user_id
        data = request.get_json()
        user_prompt = data.get("prompt")

        ai_reply = generate_ai_response(user_prompt)

        supabase.table("chat_history").insert({
            "user_id": user_id,
            "prompt": user_prompt,
            "response": ai_reply,
            "timestamp": int(time.time())
        }).execute()

        return jsonify({"response": ai_reply})
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@app.route("/api/history", methods=["GET"])
@require_auth
def history():
    try:
        user_id = request.user_id
        result = supabase.table("chat_history").select("*").eq("user_id", user_id).execute()
        return jsonify(result.data)
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

# ============================================================
# 7️⃣ Root Route
# ============================================================
@app.route("/")
def home():
    return jsonify({"message": "Flask backend is running successfully 🚀"})

# ============================================================
# 8️⃣ Run Flask App
# ============================================================
if __name__ == "__main__":
    app.run(debug=True, port=5000)

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
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY missing in .env file!")

# ============================================================
# 2️⃣ Initialize Flask and Supabase
# ============================================================
app = Flask(__name__)
CORS(app)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

HEADERS = {"Authorization": f"Bearer {OPENAI_API_KEY}"}

# ============================================================
# 3️⃣ JWT Authentication Decorator
# ============================================================
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token or not token.startswith("Bearer "):
            print("❌ Authorization header missing or invalid")
            return jsonify({"error": "Unauthorized"}), 401
        try:
            token = token.split(" ")[1]
            decoded = jwt.decode(token, options={"verify_signature": False})
            request.user_id = decoded.get("sub")
            print(f"✅ Authenticated user_id: {request.user_id}")
        except Exception as e:
            print("❌ Invalid or expired token")
            print(traceback.format_exc())
            return jsonify({"error": "Invalid or expired token"}), 401
        return f(*args, **kwargs)
    return decorated

# ============================================================
# 4️⃣ Helper: Generate AI Response via OpenAI
# ============================================================
def generate_ai_response(prompt):
    try:
        print(f"🎯 Sending prompt to OpenAI: {prompt}")
        url = "https://api.openai.com/v1/chat/completions"
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are a helpful admission assistant."},
                {"role": "user", "content": prompt}
            ]
        }
        response = requests.post(url, headers={**HEADERS, "Content-Type": "application/json"}, json=payload)
        if response.status_code != 200:
            print(f"❌ OpenAI API failed: {response.status_code} {response.text}")
            return "Sorry, I couldn't process your request."
        result = response.json()
        ai_text = result.get("choices", [{}])[0].get("message", {}).get("content", "")
        print(f"💬 OpenAI response: {ai_text}")
        return ai_text
    except Exception as e:
        print("❌ Exception in generate_ai_response")
        print(traceback.format_exc())
        return "Sorry, I couldn't process your request."

# ============================================================
# 5️⃣ Authentication Routes (Signup & Login)
# ============================================================
@app.route("/api/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        print(f"🔹 Signup request data: {data}")
        email = data.get("email")
        password = data.get("password")

        result = supabase.auth.sign_up({"email": email, "password": password})

        response_data = {
            "user_id": result.user.id if result.user else None,
            "email": result.user.email if result.user else None,
            "session": {
                "access_token": result.session.access_token if result.session else None,
                "refresh_token": result.session.refresh_token if result.session else None,
            } if result.session else None
        }

        print(f"✅ User signed up: {email}")
        return jsonify({"message": "User registered successfully", "data": response_data})

    except Exception as e:
        print("❌ Signup failed")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 400

@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        print(f"🔹 Login request data: {data}")
        email = data.get("email")
        password = data.get("password")

        result = supabase.auth.sign_in_with_password({"email": email, "password": password})

        access_token = result.session.access_token if result.session else None
        user_id = result.user.id if result.user else None

        print(f"✅ User logged in: {email}")
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user_id": user_id
        })
    except Exception as e:
        print("❌ Login failed")
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
        print(f"🔹 User {user_id} prompt: {user_prompt}")

        ai_reply = generate_ai_response(user_prompt)

        supabase.table("chat_history").insert({
            "user_id": user_id,
            "prompt": user_prompt,
            "response": ai_reply,
            "timestamp": int(time.time())
        }).execute()
        print(f"💾 Stored conversation for user {user_id}")

        return jsonify({"response": ai_reply})
    except Exception as e:
        print("❌ Respond failed")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@app.route("/api/history", methods=["GET"])
@require_auth
def history():
    try:
        user_id = request.user_id
        print(f"🔹 Fetching history for user: {user_id}")
        result = supabase.table("chat_history").select("*").eq("user_id", user_id).execute()
        return jsonify(result.data)
    except Exception as e:
        print("❌ History fetch failed")
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
    print("🚀 Starting Flask server on port 5000...")
    app.run(debug=True, port=5000)

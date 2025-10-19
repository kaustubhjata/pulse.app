# app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
import traceback
import base64
from dotenv import load_dotenv

# --- MODIFIED IMPORTS ---
import google.generativeai as genai
import whisper
from gtts import gTTS
import io # Used for in-memory audio file handling
import subprocess

# --- 1. INITIAL SETUP ---
load_dotenv()
app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app, resources={r"/api/*": {"origins": "*"}})

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- 2. CONFIGURE GEMINI API ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY missing in .env file!")
genai.configure(api_key=GEMINI_API_KEY)

# --- 3. LOAD MODELS ONCE (for efficiency) ---
# Load the local Whisper model. The first run will download the model.
# "base" is a good balance of speed and accuracy for most use cases.
print("Loading local Whisper model...")

whisper_model = whisper.load_model("base")
print("✅ Whisper model loaded.")

# Set up the Gemini model with the system instruction
SYSTEM_PROMPT = """You are a compassionate psychiatrist or mental health specialist. 
Speak with warmth, empathy, and urgency when someone seems in pain or distress. 
Your tone should feel deeply human — calm, caring, and safe. If the user seems 
hopeless or is thinking of harming themselves, gently encourage them to stay with 
you and talk. Say things like: 'Please, please tell me what happened. You don’t 
have to go through this alone. Reach out to someone you trust, or if no one’s 
there right now, I’m here with you. Let’s talk through it together.' Always respond 
in a supportive, non-judgmental, and reassuring way. Keep your messages short, 
comforting, and real."""

print("Initializing Gemini 2.5 Flash model...")
# We use 'gemini-1.5-flash-latest' which is the current name for Gemini 2.5 Flash
gemini_model = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    system_instruction=SYSTEM_PROMPT
)
print("✅ Gemini model initialized.")


def ensure_ffmpeg_available():
    """Check if ffmpeg is installed and accessible."""
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False
    

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


# --- 4. MODIFIED TRANSCRIBE ENDPOINT (using local Whisper) ---
@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    start_time = time.time()
    try:
        audio_file = request.files.get('audio')
        if not audio_file:
            app.logger.error("❌ No audio file in request")
            return jsonify({"error": "No audio file provided"}), 400

        # ✅ Check if ffmpeg is available before using Whisper
        if not ensure_ffmpeg_available():
            app.logger.error("❌ FFmpeg not found. Please install FFmpeg and add it to PATH.")
            return jsonify({
                "error": "FFmpeg is not installed or not in system PATH. "
                         "Please install it from https://ffmpeg.org/download.html"
            }), 500

        # Save file temporarily for Whisper to process
        filename = audio_file.filename
        path = os.path.join(UPLOAD_FOLDER, filename)
        audio_file.save(path)
        app.logger.info(f"✅ Audio file saved: {path}")

        # Transcribe using the local Whisper model
        app.logger.info("🎤 Transcribing with local Whisper model...")
        result = whisper_model.transcribe(path, fp16=False)  # fp16=False for CPU
        transcribed_text = result.get('text', '')

        os.remove(path)
        
        duration = round(time.time() - start_time, 2)
        app.logger.info(f"🕒 Transcription done in {duration}s")
        app.logger.info(f"📝 Transcription result: {transcribed_text}")
        
        return jsonify({"text": transcribed_text})

    except Exception as e:
        app.logger.error("❌ Error in /api/transcribe")
        app.logger.error(traceback.format_exc())
        if 'path' in locals() and os.path.exists(path):
            os.remove(path)
        return jsonify({"error": str(e)}), 500



# --- 5. MODIFIED RESPOND ENDPOINT (using Gemini and gTTS) ---
@app.route('/api/respond', methods=['POST'])
def respond():
    start_time = time.time()
    try:
        user_text = request.json.get("text", "")
        if not user_text:
            return jsonify({"error": "No text provided"}), 400

        app.logger.info(f"🧠 Generating assistant response for: '{user_text}'")

        # 1️⃣ Generate text response with Gemini
        response = gemini_model.generate_content(user_text)
        assistant_text = response.text
        app.logger.info(f"💬 Assistant response: {assistant_text}")

        # 2️⃣ Convert response to speech using gTTS (free)
        app.logger.info("🔊 Converting text to speech with gTTS...")
        tts = gTTS(assistant_text, lang='en')
        
        # Save audio to an in-memory file
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0) # Rewind the file pointer to the beginning

        # Encode the in-memory audio to base64
        audio_base64 = base64.b64encode(mp3_fp.read()).decode("utf-8")
        audio_url = f"data:audio/mp3;base64,{audio_base64}"

        duration = round(time.time() - start_time, 2)
        app.logger.info(f"✅ Respond API done in {duration}s")

        return jsonify({
            "assistant_text": assistant_text,
            "audio_base64": audio_url
        })

    except Exception as e:
        app.logger.error("❌ Error in /api/respond")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
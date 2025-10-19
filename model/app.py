# app.py
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time
import traceback
import base64
from dotenv import load_dotenv
import json
from yt_dlp import YoutubeDL

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

# Define paths for recommendation context
CHAT_HISTORY_PATH = 'chat_history.txt'
RESULTS_JSON_PATH = 'results.json' # Assuming another process might create this


# --- 2. CONFIGURE GEMINI API ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY missing in .env file!")
genai.configure(api_key=GEMINI_API_KEY)

# --- 3. LOAD MODELS ONCE (for efficiency) ---
# Load the local Whisper model.
print("Loading local Whisper model...")
whisper_model = whisper.load_model("base")
print("✅ Whisper model loaded.")

# --- Model for empathetic chat ---
CHATBOT_SYSTEM_PROMPT = """You are a compassionate psychiatrist or mental health specialist. 
Speak with warmth, empathy, and urgency when someone seems in pain or distress. 
Your tone should feel deeply human — calm, caring, and safe. If the user seems 
hopeless or is thinking of harming themselves, gently encourage them to stay with 
you and talk. Say things like: 'Please, please tell me what happened. You don’t 
have to go through this alone. Reach out to someone you trust, or if no one’s 
there right now, I’m here with you. Let’s talk through it together.' Always respond 
in a supportive, non-judgmental, and reassuring way. Keep your messages short, 
comforting, and real."""

print("Initializing Gemini model for chat...")
gemini_chat_model = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    system_instruction=CHATBOT_SYSTEM_PROMPT
)
print("✅ Chat model initialized.")

# --- Model for YouTube recommendations (outputs JSON) ---
RECOMMENDER_SYSTEM_PROMPT = """
You are a helpful recommendation engine for mental health and well-being.
You MUST respond ONLY with a valid JSON object. Do not add any other text or markdown formatting.
The JSON object must have one key: "youtube_queries".

"youtube_queries" must be an array of exactly 5 objects.
Each object must have two keys:
- "search_query" (string, a good query to find this video on YouTube)
- "description" (string, 1-2 sentences explaining why this video is helpful)

Example format:
{
  "youtube_queries": [
    {"search_query": "10 minute guided meditation for anxiety", "description": "A short guided meditation to help calm your mind and reduce anxiety."},
    {"search_query": "how stress affects the body animation", "description": "An animated video explaining the science of stress and its effects on your body."}
  ]
}
"""
print("Initializing Gemini model for recommendations...")
recommender_model = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    system_instruction=RECOMMENDER_SYSTEM_PROMPT,
    generation_config={"response_mime_type": "application/json"} # Ensures JSON output
)
print("✅ Recommender model initialized.")


def ensure_ffmpeg_available():
    """Check if ffmpeg is installed and accessible."""
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def append_to_chat_history(user_text, assistant_text):
    """Appends the conversation turn to the chat history file."""
    try:
        with open(CHAT_HISTORY_PATH, 'a', encoding='utf-8') as f:
            f.write(f"User: {user_text}\n")
            f.write(f"Assistant: {assistant_text}\n\n")
    except Exception as e:
        app.logger.error(f"❌ Failed to write to chat history: {e}")


@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


# --- 4. TRANSCRIBE ENDPOINT (using local Whisper) ---
@app.route('/api/transcribe', methods=['POST'])
def transcribe_audio():
    start_time = time.time()
    try:
        audio_file = request.files.get('audio')
        if not audio_file:
            app.logger.error("❌ No audio file in request")
            return jsonify({"error": "No audio file provided"}), 400

        if not ensure_ffmpeg_available():
            app.logger.error("❌ FFmpeg not found. Please install FFmpeg and add it to PATH.")
            return jsonify({
                "error": "FFmpeg is not installed or not in system PATH. "
                         "Please install it from https://ffmpeg.org/download.html"
            }), 500

        filename = f"upload_{int(time.time())}.wav"
        path = os.path.join(UPLOAD_FOLDER, filename)
        audio_file.save(path)
        app.logger.info(f"✅ Audio file saved: {path}")

        app.logger.info("🎤 Transcribing with local Whisper model...")
        result = whisper_model.transcribe(path, fp16=False)
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


# --- 5. RESPOND ENDPOINT (using Gemini and gTTS) ---
@app.route('/api/respond', methods=['POST'])
def respond():
    start_time = time.time()
    try:
        user_text = request.json.get("text", "")
        if not user_text:
            return jsonify({"error": "No text provided"}), 400

        app.logger.info(f"🧠 Generating assistant response for: '{user_text}'")

        # 1️⃣ Generate text response with Gemini
        response = gemini_chat_model.generate_content(user_text)
        assistant_text = response.text
        app.logger.info(f"💬 Assistant response: {assistant_text}")
        
        # ✅ NEW: Save conversation to chat history for context
        append_to_chat_history(user_text, assistant_text)

        # 2️⃣ Convert response to speech using gTTS
        app.logger.info("🔊 Converting text to speech with gTTS...")
        tts = gTTS(assistant_text, lang='en')
        
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)

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


# --- 6. NEW RECOMMENDATION ENDPOINT ---
@app.route('/api/recommend', methods=['GET'])
def recommend():
    app.logger.info("Recommender started")
    start_time = time.time()
    context_data = ""

    try:
        # 1. Try to read results.json
        if os.path.exists(RESULTS_JSON_PATH):
            with open(RESULTS_JSON_PATH, 'r', encoding='utf-8') as f:
                content = f.read()
                if content.strip():
                    try:
                        json_content = json.loads(content)
                        context_data += "User Assessment Results:\n" + json.dumps(json_content, indent=2) + "\n\n"
                        app.logger.info("Loaded data from results.json")
                    except json.JSONDecodeError:
                        context_data += "User Assessment Results (raw):\n" + content + "\n\n"
                        app.logger.warning("results.json was not valid JSON, using raw text.")
        
        # 2. Try to read chat_history.txt
        if os.path.exists(CHAT_HISTORY_PATH):
            with open(CHAT_HISTORY_PATH, 'r', encoding='utf-8') as f:
                content = f.read()
                if content.strip():
                    context_data += "User Chat History:\n" + content + "\n\n"
                    app.logger.info("Loaded data from chat_history.txt")

        # 3. Define User Prompt for Gemini
        if context_data.strip():
            user_prompt = f"""
            Based on the following user data, please provide 5 YouTube video search queries
            related to their mental health and well-being.
            User Data:
            {context_data}
            """
            app.logger.info("Generating PERSONALIZED recommendations.")
        else:
            user_prompt = """
            The user has no data. Please provide 5 high-quality, general-purpose YouTube video
            search queries related to mental health, mindfulness, and stress reduction.
            """
            app.logger.info("Generating GENERAL recommendations.")

        # 4. Call Gemini API
        app.logger.info("Calling Gemini API for recommendations...")
        response = recommender_model.generate_content(user_prompt)
        response_text = response.text
        
        # 5. Parse and Process the JSON response
        try:
            ai_recommendations = json.loads(response_text)
            processed_videos = []
            queries_from_ai = ai_recommendations.get("youtube_queries", [])
            
            app.logger.info(f"AI generated {len(queries_from_ai)} queries. Fetching videos...")

            # --- Use yt-dlp to find actual videos ---
            for video_query in queries_from_ai:
                query = video_query.get("search_query")
                ai_description = video_query.get("description")

                if not query:
                    continue

                try:
                    ydl_opts = {
                        'format': 'best',
                        'quiet': True,
                        'default_search': 'ytsearch1', # Get only the first search result
                        'noplaylist': True,
                    }
                    
                    with YoutubeDL(ydl_opts) as ydl:
                        info = ydl.extract_info(query, download=False)
                        
                        if info and 'entries' in info and info['entries']:
                            first_video = info['entries'][0]
                            video_url = first_video.get('webpage_url')
                            video_title = first_video.get('title')

                            if video_url and video_title:
                                processed_videos.append({
                                    "title": video_title,
                                    "url": video_url,
                                    "description": ai_description
                                })
                                app.logger.info(f"✅ Found video for query '{query}': {video_url}")
                            else:
                                app.logger.warning(f"⚠️ Video found for '{query}' but missing URL or Title")
                        else:
                            app.logger.warning(f"⚠️ No video found for query: '{query}'")
                
                except Exception as search_error:
                    app.logger.error(f"❌ Error searching YouTube with yt-dlp for '{query}': {search_error}")
                    app.logger.error(traceback.format_exc())
            
            duration = round(time.time() - start_time, 2)
            app.logger.info(f"✅ Recommendation API done in {duration}s. Found {len(processed_videos)} videos.")
            
            return jsonify({"youtube_videos": processed_videos})

        except json.JSONDecodeError:
            app.logger.error(f"❌ Failed to decode AI JSON response: {response_text}")
            return jsonify({"error": "AI did not return valid JSON", "raw_response": response_text}), 500

    except Exception as e:
        app.logger.error("❌ Error in /api/recommend")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
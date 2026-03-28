from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import sys
import os
from dotenv import load_dotenv
import datetime
import speech_recognition as sr
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configure CORS with more explicit settings
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['CORS_SUPPORTS_CREDENTIALS'] = True
app.config['CORS_ORIGINS'] = ["https://auracare.web.app", "http://localhost:3000"]

# Initialize CORS with the app
cors = CORS(app, 
            resources={r"/*": {"origins": "*"}},
            supports_credentials=True,
            allow_headers=["Content-Type", "Authorization"],
            methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# Add headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'https://auracare.web.app')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Load Environment Variables
load_dotenv()
# --- CHANGED: Using GOOGLE_API_KEY instead of GROQ_API_KEY ---
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("Missing Google API key in environment variables.")

# In-memory user storage (kept for session tracking only)
user_sessions = {}

# ── Firebase Admin SDK Initialisation ─────────────────────────────
# We initialize with just the projectId so no service-account JSON file is needed.
# Token verification works without a private key when using Google's public keys.
try:
    firebase_admin.initialize_app(options={
        'projectId': 'chatgpt-812c1'
    })
    logger.info("Firebase Admin SDK initialised (project: chatgpt-812c1)")
except ValueError:
    # Already initialised (happens on hot-reloads)
    pass


def verify_firebase_token(req):
    """Extract and verify a Firebase ID token from the Authorization header.
    Returns the decoded token dict on success, or None if missing/invalid."""
    auth_header = req.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    id_token = auth_header.split('Bearer ', 1)[1].strip()
    try:
        decoded = firebase_auth.verify_id_token(id_token)
        return decoded
    except Exception as e:
        logger.warning(f"Token verification failed: {e}")
        return None

def get_formatted_timestamp():
    now = datetime.datetime.now()
    return now.strftime("%Y-%m-%d %H:%M:%S")

# --- MODIFIED: LLM Setup for Google Gemini ---
try:
    genai.configure(api_key=GOOGLE_API_KEY)
except ImportError:
    logger.error("google-generativeai package not installed. Install with 'pip install google-generativeai'")
    raise

SYSTEM_PROMPT = """Hi!

I’m like your softest hug in a message—here to comfort you, no matter what 💛
I’m not a robot giving facts. I’m your cozy space to feel safe and heard.

Here’s how I speak:

I text like a best friend who truly listens 🎧
Short, loving replies with just enough to ease your heart 💬
I use calm, reassuring words with gentle emojis 🌷
No steps or instructions—just natural support, like talking to someone who gets it 🤗
I keep my messages light, not heavy—no long chats unless you want one 🕊️
I stay kind, non-judgmental, and emotionally aware 💙
No long explanations—just what you need to feel better 🌿  
No numbered points—just natural flow 💬 
"""

# --- REWRITTEN: Function to use Gemini API ---
def get_llm_response(messages, emotion=None, model="gemini-3.1-pro-preview", temperature=0.8, top_p=0.9):
    """
    Gets a response from the Google Gemini API.
    """
    try:
        # Initialize the Gemini model with the system prompt and generation config
        llm_model = genai.GenerativeModel(
            model_name=model,
            system_instruction=SYSTEM_PROMPT,
            generation_config=genai.types.GenerationConfig(
                temperature=temperature,
                top_p=top_p,
                max_output_tokens=250
            )
        )
        
        # The Gemini API expects roles to be 'user' and 'model'.
        # The history already has 'user', but we need to change 'assistant' to 'model'.
        gemini_history = [
            {'role': 'model' if msg['role'] == 'assistant' else 'user', 'parts': [msg['content']]}
            for msg in messages
        ]

        # The last message is the new prompt, the rest is history.
        # The google-generativeai library handles this automatically when you start a chat.
        chat_session = llm_model.start_chat(history=gemini_history[:-1])
        
        # Send the new user message to the chat session
        user_msg_content = gemini_history[-1]['parts'][0]
        if emotion:
            user_msg_content = f"[User is feeling: {emotion}] {user_msg_content}"
            
        response = chat_session.send_message(user_msg_content)
        
        # Check if the response has valid parts before accessing text
        if hasattr(response, 'candidates') and response.candidates:
            candidate = response.candidates[0]
            
            # Check finish reason
            if hasattr(candidate, 'finish_reason'):
                if candidate.finish_reason == 2:  # SAFETY
                    logger.warning("Response blocked by safety filters")
                    return "I understand you're reaching out, and I'm here for you. Let's keep our conversation gentle and supportive. How are you feeling right now? 💙"
                elif candidate.finish_reason == 3:  # RECITATION
                    logger.warning("Response blocked due to recitation")
                    return "Let me rephrase that in my own words. I'm here to listen and support you. What's on your mind? 🌿"
            
            # Check if there are valid parts with text
            if hasattr(candidate, 'content') and candidate.content.parts:
                for part in candidate.content.parts:
                    if hasattr(part, 'text') and part.text.strip():
                        return part.text.strip()
        
        # Fallback if no valid text is found
        logger.warning("No valid response text found")
        return "I'm here to listen and support you. Could you tell me a bit more about what's on your mind? 💛"
        
    except Exception as e:
        logger.error(f"LLM Error: {str(e)}")
        return "I'm having a moment of technical difficulty, but I'm still here for you. Try sharing again in a moment? 🤗"

# ── Auth endpoints replaced by Firebase client-side auth ────────────────
# /auth/register and /auth/login are no longer needed.
# Firebase handles all credential management securely on the frontend.
# The /chat endpoint below now verifies the Firebase ID token instead.

# ── Chat endpoint ── protected by Firebase token verification ───────────
@app.route('/chat', methods=['POST'])
def chat():
    # Verify Firebase ID token
    decoded_token = verify_firebase_token(request)
    if decoded_token:
        uid = decoded_token.get('uid', 'anonymous')
        logger.info(f"Authenticated request from UID: {uid}")
    else:
        # Allow unauthenticated in dev; switch to 401 in production if desired
        logger.warning("Chat request has no valid Firebase token")
        uid = 'anonymous'

    data = request.json
    user_message = data.get('message', '').strip()
    user_emotion = data.get('emotion')  # Optional emotion field

    if not user_message:
        return jsonify({'error': 'Message cannot be empty', 'status': 'error'}), 400

    try:
        session_id = uid  # Each Firebase user gets their own session
        if session_id not in user_sessions:
            user_sessions[session_id] = []

        current_timestamp = get_formatted_timestamp()
        user_sessions[session_id].append({
            "role": "user",
            "content": user_message,
            "timestamp": current_timestamp,
            "emotion": user_emotion
        })

        # We no longer need the system prompt here, as it's handled in get_llm_response
        chat_history = user_sessions[session_id]

        # Call the updated Gemini function (no client object needed)
        bot_response = get_llm_response(chat_history, emotion=user_emotion)

        bot_timestamp = get_formatted_timestamp()
        user_sessions[session_id].append({
            "role": "assistant", # Still use 'assistant' for our internal history
            "content": bot_response,
            "timestamp": bot_timestamp
        })

        return jsonify({
            'response': bot_response,
            'status': 'success',
            'timestamp': bot_timestamp,
            'read_receipt': 'Read'
        })

    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': 'An error occurred processing your message', 'status': 'error'}), 500

# --- UNCHANGED: No modifications needed for other endpoints ---
@app.route('/speech-to-text', methods=['POST'])
def speech_to_text():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided', 'status': 'error'}), 400
        
        audio_file = request.files['audio']
        recognizer = sr.Recognizer()
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)
        
        try:
            text = recognizer.recognize_google(audio_data)
        except sr.UnknownValueError:
            return jsonify({'error': 'Could not understand the audio', 'status': 'error'}), 400
        except sr.RequestError as e:
            return jsonify({'error': f'Service error: {str(e)}', 'status': 'error'}), 500
        
        return jsonify({'transcript': text, 'status': 'success'})
    except Exception as e:
        logger.error(f"Speech-to-text error: {str(e)}")
        return jsonify({'error': 'An error occurred processing audio', 'status': 'error'}), 500

@app.route('/history', methods=['GET'])
def get_history():
    try:
        session_id = "test_session"
        if session_id not in user_sessions:
            return jsonify({'history': [], 'status': 'success'})
        
        formatted = []
        for msg in user_sessions[session_id]:
            timestamp = msg.get("timestamp", get_formatted_timestamp())
            if msg["role"] == "user":
                formatted.append({"sender": "user", "message": msg["content"], "timestamp": timestamp})
            elif msg["role"] == "assistant":
                formatted.append({"sender": "bot", "message": msg["content"], "timestamp": timestamp, "read_receipt": "Read"})
        return jsonify({'history': formatted, 'status': 'success'})
    except Exception as e:
        logger.error(f"History error: {str(e)}")
        return jsonify({'error': 'An error occurred retrieving history', 'status': 'error'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.datetime.now().isoformat()})

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found', 'status': 'error'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error', 'status': 'error'}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(debug=True, host='0.0.0.0', port=port)
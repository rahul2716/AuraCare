from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import sys
import os
from dotenv import load_dotenv
import datetime
import speech_recognition as sr
import google.generativeai as genai


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load Environment Variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("Missing Google API key in environment variables.")

users = {}
user_sessions = {}

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
def get_llm_response(messages, model="gemini-1.5-flash-latest", temperature=0.8, top_p=0.9):
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
        
       
        gemini_history = [
            {'role': 'model' if msg['role'] == 'assistant' else 'user', 'parts': [msg['content']]}
            for msg in messages
        ]

        # The last message is the new prompt, the rest is history.
        # The google-generativeai library handles this automatically when you start a chat.
        chat_session = llm_model.start_chat(history=gemini_history[:-1])
        
        # Send the new user message to the chat session
        response = chat_session.send_message(gemini_history[-1]['parts'][0])
        
        return response.text.strip()
        
    except Exception as e:
        print(f"LLM Error: {str(e)}")
        return "Oops! Something went wrong. Try again later."

@app.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    if not name or not email or not password:
        return jsonify({'error': 'All fields are required', 'status': 'error'}), 400

    try:
        if email in [u['email'] for u in users.values()]:
            return jsonify({'error': 'Email already registered', 'status': 'error'}), 400
        
        user_id = str(len(users) + 1)
        users[user_id] = {
            'id': user_id,
            'name': name,
            'email': email,
            'password': password
        }
        return jsonify({'message': 'User registered successfully', 'status': 'success'})
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'An error occurred during registration', 'status': 'error'}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required', 'status': 'error'}), 400

    try:
        user = next((u for u in users.values() if u['email'] == email and u['password'] == password), None)
        if not user:
            return jsonify({'error': 'Invalid credentials', 'status': 'error'}), 401
        
        return jsonify({'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}, 'status': 'success'})
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'An error occurred during login', 'status': 'error'}), 500

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '').strip()
    if not user_message:
        return jsonify({'error': 'Message cannot be empty', 'status': 'error'}), 400

    try:
        session_id = "test_session"
        if session_id not in user_sessions:
            user_sessions[session_id] = []

        current_timestamp = get_formatted_timestamp()
        user_sessions[session_id].append({
            "role": "user",
            "content": user_message,
            "timestamp": current_timestamp
        })

        chat_history = user_sessions[session_id]

        # Call the updated Gemini function (no client object needed)
        bot_response = get_llm_response(chat_history)

        bot_timestamp = get_formatted_timestamp()
        user_sessions[session_id].append({
            "role": "assistant", 
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

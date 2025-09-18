from flask import Flask, jsonify, request
from flask_cors import CORS
import logging
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load Environment Variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("Missing Google API key. Please create a .env file and add GOOGLE_API_KEY='your_api_key'")

# LLM Setup
try:
    genai.configure(api_key=GOOGLE_API_KEY)
    llm_client = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    logger.error(f"Failed to initialize Gemini client: {str(e)}")
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

# In-memory chat history (for a single session)
# Note: This will reset every time the server restarts.
chat_history = []

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '').strip()
    
    if not user_message:
        return jsonify({'error': 'Message cannot be empty', 'status': 'error'}), 400

    try:
        # Add user message to our history
        chat_history.append({"role": "user", "content": user_message})

        # Format messages for the Gemini API
        messages_for_llm = []
        for msg in chat_history:
            # The Gemini Python SDK uses 'model' for the assistant's role
            role = 'model' if msg['role'] == 'assistant' else msg['role']
            messages_for_llm.append({'role': role, 'parts': [msg['content']]})

        # Start a chat session with the history
        chat_session = llm_client.start_chat(history=messages_for_llm[:-1])
        
        # Send the latest user message with the system prompt for context
        prompt_with_system_message = f"{SYSTEM_PROMPT}\n\nUser: {user_message}"

        response = chat_session.send_message(prompt_with_system_message)
        bot_response = response.text.strip()
        
        # Add the bot's response to our history
        chat_history.append({"role": "assistant", "content": bot_response})

        response_data = {
            'response': bot_response,
            'status': 'success',
        }
        
        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': 'An error occurred processing your message', 'status': 'error'}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8080)

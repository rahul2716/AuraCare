import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmotionDetector from './components/EmotionDetector';

const wellnessTips = [
  "🌸 Take mindful deep breaths", "💧 Stay beautifully hydrated", "🧘‍♀️ Practice gentle mindfulness",
  "😴 Embrace restorative sleep", "⏸️ Take healing breaks", "💕 Connect with your tribe",
  "🏃‍♀️ Move your body joyfully", "🙏 Practice daily gratitude", "📱 Digital detox moments",
  "🎵 Listen to soul music", "📝 Journal your journey", "🚧 Set loving boundaries",
  "🌿 Commune with nature", "🕯️ Meditate in stillness", "⚡ Create sacred routines"
];

export default function ChatInterface({ user, onLogout }) {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }
    };

    const scrollId = requestAnimationFrame(() => {
      scrollToBottom();
    });

    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => {
      cancelAnimationFrame(scrollId);
      clearTimeout(timeoutId);
    };
  }, [chatHistory]);

  const startChat = () => {
    setChatHistory([
      {
        role: 'assistant',
        content: "✨ Hello beautiful soul! I'm Aura, your AI mental health companion. I'm here to listen, support, and guide you on your wellness journey. How are you feeling in this moment?",
        timestamp: new Date().toISOString(),
      }
    ]);
  };

  useEffect(() => {
    startChat();

    // Cleanup speech recognition on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore errors on cleanup
        }
        recognitionRef.current = null;
      }
    };
  }, []);
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Regex to remove emojis from the text before speaking
      const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
      const cleanText = text.replace(emojiRegex, '');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported in this browser.');
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setChatHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Get a fresh Firebase ID token and attach it as a Bearer token
      let authHeader = {};
      if (user) {
        try {
          const idToken = await user.getIdToken();
          authHeader = { 'Authorization': `Bearer ${idToken}` };
        } catch (tokenErr) {
          console.warn('Could not get ID token:', tokenErr);
        }
      }

      const res = await fetch('https://backendac-1.onrender.com/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          message: messageText,
          emotion: currentEmotion
        }),
      });
      const data = await res.json();

      setTimeout(() => {
        if (data.status === 'success') {
          const assistantMessage = {
            role: 'assistant',
            content: data.response,
            timestamp: data.timestamp || new Date().toISOString(),
          };
          setChatHistory(prev => [...prev, assistantMessage]);
          speakText(data.response);
        }
        setIsTyping(false);
      }, 1500);
    } catch (err) {
      console.error('Chat error:', err);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    sendMessage(message);
    setMessage('');
  };

  const handleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('🎤 Speech recognition not supported in this browser.');
      return;
    }

    // If already listening, stop the recognition
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    // Initialize recognition if it doesn't exist
    if (!recognitionRef.current) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        sendMessage(transcript);
      };
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    // Start recognition only if not already listening
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
    }
  };

  return (
    <motion.div
      key="chat"
      className="chat-interface"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.div
        className="chat-sidebar"
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className="header-content">
          <motion.div
            className="header-info"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.h1
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              AuraCare
            </motion.h1>
            <motion.div
              className="status-badge"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(139, 92, 246, 0.3)",
                  "0 0 30px rgba(139, 92, 246, 0.6)",
                  "0 0 20px rgba(139, 92, 246, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.span
                className="status-dot"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="status-text">AI Companion Online</span>
            </motion.div>
          </motion.div>

          {/* User info + Logout */}
          {user && (
            <motion.div
              className="user-info"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <span style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.8)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '120px'
              }}>
                👤 {user.displayName || user.email}
              </span>
              <motion.button
                onClick={onLogout}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(239,68,68,0.2)' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.4)',
                  borderRadius: '8px',
                  color: '#fca5a5',
                  fontSize: '11px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap'
                }}
              >
                Sign Out
              </motion.button>
            </motion.div>
          )}
        </div>

        <div className="sidebar-content">
          <EmotionDetector onEmotionChange={setCurrentEmotion} />

          <motion.div
            className="chat-guidance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3>💫 Chat Guide</h3>
            <div className="guide-points">
              {[
                { icon: "💭", text: "Express yourself freely and authentically" },
                { icon: "❓", text: "Ask about mental health and wellness" },
                { icon: "🤝", text: "Receive personalized AI-powered support" }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="guide-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  whileHover={{
                    scale: 1.02,
                    x: 5,
                    backgroundColor: "rgba(139, 92, 246, 0.1)"
                  }}
                >
                  <span className="guide-icon">{item.icon}</span>
                  {item.text}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="wellness-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3>🌟 Daily Wellness</h3>
            <div className="wellness-carousel">
              {wellnessTips.map((tip, i) => (
                <motion.div
                  key={i}
                  className="wellness-tip"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.05 }}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(254, 243, 199, 0.2)",
                    color: "#7C3AED"
                  }}
                  style={{
                    animationDelay: `${i * 0.5}s`,
                  }}
                >
                  {tip}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="mood-tracker"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <h3>🎭 Quick Mood Check</h3>
            <div className="mood-options">
              {[
                { emoji: "😊", label: "Great", color: "#10B981" },
                { emoji: "😌", label: "Good", color: "#8B5CF6" },
                { emoji: "😐", label: "Okay", color: "#F59E0B" },
                { emoji: "😔", label: "Low", color: "#EF4444" }
              ].map((mood, i) => (
                <motion.button
                  key={i}
                  className="mood-btn"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ '--mood-color': mood.color }}
                >
                  <span className="mood-emoji">{mood.emoji}</span>
                  <span className="mood-label">{mood.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="chat-main"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <div
          className="chat-history"
          style={{
            height: 'calc(100vh - 180px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch', // For smooth scrolling on iOS
            scrollBehavior: 'smooth',
            padding: '20px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#8B5CF6 transparent',
          }}
        >
          <AnimatePresence>
            {chatHistory.map((entry, i) => (
              <motion.div
                key={i}
                className={`message-wrapper ${entry.role}`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                layout
              >
                <motion.div
                  className="message-bubble"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="message-content">{entry.content}</div>
                  <div className="message-time">
                    {new Date(entry.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <motion.div
                    className="message-glow"
                    animate={{
                      opacity: [0, 0.3, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {(isLoading || isTyping) && (
              <motion.div
                className="typing-indicator"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="typing-avatar">🧠</div>
                <div className="typing-bubbles">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="typing-bubble"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
                <span className="typing-text">Aura is thinking...</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        <motion.form
          className="input-area"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="input-container">
            <motion.input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your thoughts with Aura..."
              className="message-input"
              whileFocus={{
                borderColor: "#8B5CF6"
              }}
              transition={{ duration: 0.3 }}
            />

            <motion.button
              type="button"
              onClick={handleSpeechRecognition}
              className={`mic-button ${isListening ? 'listening' : ''}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={isListening ? {
                boxShadow: [
                  "0 0 20px rgba(239, 68, 68, 0.5)",
                  "0 0 40px rgba(239, 68, 68, 0.8)",
                  "0 0 20px rgba(239, 68, 68, 0.5)"
                ]
              } : {}}
              transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
            >
              <motion.span
                animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.5, repeat: isListening ? Infinity : 0 }}
              >
                🎤
              </motion.span>
            </motion.button>

            <motion.button
              type="submit"
              className="send-button"
              disabled={!message.trim()}
              whileHover={message.trim() ? { scale: 1.05 } : {}}
              whileTap={message.trim() ? { scale: 0.95 } : {}}
              animate={message.trim() ? {
                boxShadow: [
                  "0 5px 15px rgba(139, 92, 246, 0.3)",
                  "0 8px 25px rgba(139, 92, 246, 0.5)",
                  "0 5px 15px rgba(139, 92, 246, 0.3)"
                ]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.span
                animate={message.trim() ? { x: [0, 3, 0] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                😁
              </motion.span>
            </motion.button>
          </div>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}

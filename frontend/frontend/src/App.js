
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import LoginPage from './LoginPage';
import Meditation from './components/Meditation';
import ChatInterface from './ChatInterface';
import { app, analytics, auth } from './firebase';

const welcomeSlides = [
  {
    title: "WELCOME TO AURACARE",
    subtitle: "Your AI-Powered Mental Health Companion",
    icon: "✨",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 50%, #FEF3C7 100%)"
  },
  {
    title: "Safe & Confidential",
    subtitle: "Your sacred space to express freely",
    icon: "🛡️",
    color: "#7C3AED",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #FDE68A 100%)"
  },
  {
    title: "24/7 AI Support",
    subtitle: "Intelligent care whenever you need",
    icon: "🌙",
    color: "#6D28D9",
    gradient: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 50%, #FEF3C7 100%)"
  }
];

const floatingParticles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 2,
  duration: Math.random() * 20 + 10
}));

const FloatingParticles = () => (
  <div className="floating-particles">
    {floatingParticles.map(particle => (
      <motion.div
        key={particle.id}
        className="particle"
        style={{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
        }}
        animate={{
          y: [-20, 20, -20],
          x: [-10, 10, -10],
          opacity: [0.3, 0.8, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: particle.duration,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

const WelcomeCarousel = ({ currentSlide }) => (
  <motion.div className="welcome-carousel">
    <AnimatePresence mode="wait">
      <motion.div
        key={currentSlide}
        className="carousel-slide"
        initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ background: welcomeSlides[currentSlide].gradient }}
      >
        <motion.div
          className="slide-icon"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {welcomeSlides[currentSlide].icon}
        </motion.div>
        <motion.h1
          className="slide-title"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {welcomeSlides[currentSlide].title}
        </motion.h1>
        <motion.p
          className="slide-subtitle"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {welcomeSlides[currentSlide].subtitle}
        </motion.p>
      </motion.div>
    </AnimatePresence>
  </motion.div>
);

const WelcomeScreen = ({ onStartChat, onStartMeditation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % welcomeSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="welcome-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="welcome-content"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <WelcomeCarousel currentSlide={currentSlide} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key="welcome"
        className="welcome-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-section">
          <motion.div
            className="hero-content"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div className="hero-badge">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                ✨
              </motion.span>
              <span>AI-Powered Mental Wellness</span>
            </motion.div>

            <motion.h1
              className="hero-title"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              Meet AuraCare
              <motion.span
                className="hero-subtitle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Your Intelligent Mental Health Companion
              </motion.span>
            </motion.h1>

            <motion.div
              className="feature-cards"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {[
                { icon: "🧠", title: "AI-Powered Insights", desc: "Advanced emotional intelligence", color: "#8B5CF6" },
                { icon: "🛡️", title: "Safe & Secure", desc: "Your privacy is sacred", color: "#7C3AED" },
                { icon: "🌟", title: "24/7 Availability", desc: "Always here when you need us", color: "#6D28D9" }
              ].map((feature, i) => (
                <motion.div
                  className="feature-card"
                  key={i}
                  initial={{ opacity: 0, y: 40, rotateX: -15 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 1 + i * 0.2, duration: 0.6 }}
                  whileHover={{
                    scale: 1.05,
                    rotateY: 5,
                    boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)",
                  }}
                  style={{ '--feature-color': feature.color }}
                >
                  <motion.div
                    className="feature-icon"
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                  <motion.div
                    className="feature-glow"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            <div className="button-group">
              <motion.button
                className="start-chat-btn"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 15px 30px rgba(139, 92, 246, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartChat}
              >
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Begin Your Healing Journey ✨
                </motion.span>
              </motion.button>

              <motion.button
                className="first-aid-btn"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.7, duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartMeditation}
              >
                First-Aid 🩹
              </motion.button>
            </div>



          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // prevents flash of login on refresh
  const [activeMode, setActiveMode] = useState('welcome'); // 'welcome', 'chat', 'meditation'
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // ── Firebase Auth listener ── persists login across page refreshes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
    return unsubscribe; // cleanup on unmount
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleLogin = (firebaseUser) => setUser(firebaseUser);
  const handleLogout = () => {
    signOut(auth);
    setUser(null);
    setActiveMode('welcome');
  };
  const handleStartChat = () => setActiveMode('chat');

  // Show a minimal spinner while Firebase resolves auth state
  if (authLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 48, height: 48,
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid #fff',
            borderRadius: '50%'
          }}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <FloatingParticles />

      <motion.div
        className="cursor-glow"
        style={{
          left: mousePosition.x - 10,
          top: mousePosition.y - 10,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <AnimatePresence mode="wait">
        {!user ? (
          <LoginPage key="login" onLogin={handleLogin} />
        ) : activeMode === 'welcome' ? (
          <WelcomeScreen
            key="welcome"
            onStartChat={handleStartChat}
            onStartMeditation={() => setActiveMode('meditation')}
          />
        ) : activeMode === 'meditation' ? (
          <Meditation key="meditation" onBack={() => setActiveMode('welcome')} />
        ) : (
          <ChatInterface key="chat" user={user} onLogout={handleLogout} />
        )}
      </AnimatePresence>
    </div>
  );
}


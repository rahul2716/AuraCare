import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (isSignUp && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    // In a real app, you would validate credentials with your backend here
    onLogin();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="login-header"
        >
          <div className="logo">
            <span className="logo-icon">🌿</span>
            <h1>AuraCare</h1>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to continue your mental health journey</p>
        </motion.div>

        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Password</label>
              <button type="button" className="text-button" onClick={() => {}}>
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="login-button">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="social-login">
          <button type="button" className="social-button google">
            <span className="icon">G</span>
            Continue with Google
          </button>
          <button type="button" className="social-button apple">
            <span className="icon"></span>
            Continue with Apple
          </button>
        </div>

        <div className="login-footer">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button 
            type="button" 
            className="toggle-auth-mode"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

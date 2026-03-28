import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [isActive, setIsActive] = useState(false);

  // Sign-up form state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [signUpLoading, setSignUpLoading] = useState(false);

  // Sign-in form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);

  // ─── Email / Password Sign Up ────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault();
    setSignUpError('');

    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword) {
      setSignUpError('All fields are required.');
      return;
    }
    if (signUpPassword.length < 6) {
      setSignUpError('Password must be at least 6 characters.');
      return;
    }

    setSignUpLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
      // Set the user's display name
      await updateProfile(userCred.user, { displayName: signUpName.trim() });
      onLogin(userCred.user);
    } catch (err) {
      setSignUpError(friendlyError(err.code));
    } finally {
      setSignUpLoading(false);
    }
  };

  // ─── Email / Password Sign In ────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    setSignInError('');

    if (!signInEmail.trim() || !signInPassword) {
      setSignInError('Email and password are required.');
      return;
    }

    setSignInLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
      onLogin(userCred.user);
    } catch (err) {
      setSignInError(friendlyError(err.code));
    } finally {
      setSignInLoading(false);
    }
  };

  // ─── Google Sign In (shared for both panels) ─────────────────────────────────
  const handleGoogleSignIn = async () => {
    setSignInError('');
    setSignUpError('');
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      onLogin(userCred.user);
    } catch (err) {
      const msg = friendlyError(err.code);
      isActive ? setSignUpError(msg) : setSignInError(msg);
    }
  };

  // ─── Human-readable Firebase error messages ───────────────────────────────────
  const friendlyError = (code) => {
    switch (code) {
      case 'auth/email-already-in-use': return 'This email is already registered. Try signing in instead.';
      case 'auth/invalid-email': return 'Please enter a valid email address.';
      case 'auth/weak-password': return 'Password must be at least 6 characters.';
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/wrong-password': return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential': return 'Invalid email or password. Please try again.';
      case 'auth/popup-closed-by-user': return 'Google sign-in was cancelled.';
      case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
      default: return 'Something went wrong. Please try again.';
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className={`container ${isActive ? 'active' : ''}`} id="container">

        {/* ── Sign Up Form ── */}
        <div className="form-container sign-up">
          <form onSubmit={handleSignUp} noValidate>
            <h1 style={{ color: '#8B5CF6' }}>Create Account</h1>

            {/* Google Button */}
            <div className="social-icons">
              <button
                type="button"
                className="google-btn"
                onClick={handleGoogleSignIn}
                title="Continue with Google"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>

            <span style={{ color: '#8B5CF6' }}>or use your email for registration</span>

            <input
              type="text"
              placeholder="Full Name"
              value={signUpName}
              onChange={(e) => setSignUpName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={signUpEmail}
              onChange={(e) => setSignUpEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={signUpPassword}
              onChange={(e) => setSignUpPassword(e.target.value)}
              required
            />

            {signUpError && <p className="auth-error">{signUpError}</p>}

            <button type="submit" disabled={signUpLoading}>
              {signUpLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        </div>

        {/* ── Sign In Form ── */}
        <div className="form-container sign-in">
          <form onSubmit={handleSignIn} noValidate>
            <h1 style={{ color: '#8B5CF6' }}>Sign In</h1>

            {/* Google Button */}
            <div className="social-icons">
              <button
                type="button"
                className="google-btn"
                onClick={handleGoogleSignIn}
                title="Continue with Google"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>
            </div>

            <span style={{ color: '#8B5CF6' }}>or use your email and password</span>

            <input
              type="email"
              placeholder="Email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              required
            />

            {signInError && <p className="auth-error">{signInError}</p>}

            <a href="#forgot" style={{ color: '#8B5CF6' }}>Forgot Your Password?</a>
            <button type="submit" disabled={signInLoading}>
              {signInLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* ── Sliding Toggle Panel ── */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all of site features</p>
              <button className="hidden" id="login" onClick={() => setIsActive(false)}>Sign In</button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello, Friend!</h1>
              <p>Register with your personal details to use all of site features</p>
              <button className="hidden" id="register" onClick={() => setIsActive(true)}>Sign Up</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;

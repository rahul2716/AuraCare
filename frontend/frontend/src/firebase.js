// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDJkOLe4u3lDnti0SqXD3Me9-i4_ZyyrfY",
    authDomain: "chatgpt-812c1.firebaseapp.com",
    projectId: "chatgpt-812c1",
    storageBucket: "chatgpt-812c1.firebasestorage.app",
    messagingSenderId: "454794195309",
    appId: "1:454794195309:web:74f2c7f847a12b93e82a64",
    measurementId: "G-D7GCGK2L6C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth and providers
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider };

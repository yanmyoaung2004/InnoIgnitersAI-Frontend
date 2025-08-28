// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "fir-2a9cc.firebaseapp.com",
  projectId: "fir-2a9cc",
  storageBucket: "fir-2a9cc.firebasestorage.app",
  messagingSenderId: "1014772180746",
  appId: "1:1014772180746:web:c791de30b457e155da7cf3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export { app };

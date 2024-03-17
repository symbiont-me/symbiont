// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyDDHYKgG7mAfyvWA3Tg-TrCECmlNIsu_DM",
  authDomain: "symbiont-e7f06.firebaseapp.com",
  databaseURL:
    "https://symbiont-e7f06-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "symbiont-e7f06",
  storageBucket: "symbiont-e7f06.appspot.com",
  messagingSenderId: "1038513118003",
  appId: "1:1038513118003:web:8afee261b6a25481c1fc46",
  measurementId: "G-8DB5QX6KE7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
export { app, auth };

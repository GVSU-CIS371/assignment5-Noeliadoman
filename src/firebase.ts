import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB-ZxCXr-IdQ9rj9YPvwCoWBEN1AaBB08",
  authDomain: "my-app-project-90868.firebaseapp.com",
  projectId: "my-app-project-90868",
  storageBucket: "my-app-project-90868.firebasestorage.app",
  messagingSenderId: "1003400641418",
  appId: "1:1003400641418:web:6020dfc26aa2799fb82673",
  measurementId: "G-678SCLDNKW"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };

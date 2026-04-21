import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCfeGmNOIdULtkUDb5rBKrfuqxjFW3PAks",
  authDomain: "beverageshop-a25b4.firebaseapp.com",
  databaseURL: "https://beverageshop-a25b4-default-rtdb.firebaseio.com",
  projectId: "beverageshop-a25b4",
  storageBucket: "beverageshop-a25b4.firebasestorage.app",
  messagingSenderId: "727899777685",
  appId: "1:727899777685:web:cb6fb0f8f0de9ed992099c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

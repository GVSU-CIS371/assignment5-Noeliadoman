import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCpzQqezaUrXlrnvaN-4Q_SO66V515L-4g",
  authDomain: "beverageshop-ace5c.firebaseapp.com",
  projectId: "beverageshop-ace5c",
  storageBucket: "beverageshop-ace5c.firebasestorage.app",
  messagingSenderId: "826745717432",
  appId: "1:826745717432:web:7f93cdea071298b06d2a4d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

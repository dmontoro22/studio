import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAUA7r0JJttKY3X5MvQgcNYQnl3rwwmfns",
  authDomain: "studio-4153589564-dbf4e.firebaseapp.com",
  projectId: "studio-4153589564-dbf4e",
  storageBucket: "studio-4153589564-dbf4e.firebasestorage.app",
  messagingSenderId: "755364166380",
  appId: "1:755364166380:web:abafaf77111662d76243c9"
};

// Inicialización segura: si no hay apps iniciadas, la crea. Si ya existe, la reutiliza.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Sua configuração do Firebase (você precisa pegar do console do Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyDZFXASqK-b5_NaYmTZYJ-4oANdyvxpp2k",
  authDomain: "desapegakids-6e481.firebaseapp.com",
  projectId: "desapegakids-6e481",
  storageBucket: "desapegakids-6e481.firebasestorage.app",
  messagingSenderId: "85324719659",
  appId: "1:85324719659:web:b3fe68271fd75b72faac6e",
  measurementId: "G-WG7HSCMTEF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
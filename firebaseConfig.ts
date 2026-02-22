import { initializeApp, getApps, getApp } from "firebase/app"; // 1. Importa getApps y getApp
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

/*

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_APIKEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_MESSAGINGRENDER,
  appId: process.env.EXPO_PUBLIC_APPID,
  measurementId: process.env.EXPO_PUBLIC_MEASUREID
};*/

const firebaseConfig = {
  apiKey: "AIzaSyBbVc97O5rF2mEb3d_PKG0FGOXpJbtp620",
  authDomain: "inmijobs-c69c6.firebaseapp.com",
  projectId: "inmijobs-c69c6",
  storageBucket:"inmijobs-c69c6.firebasestorage.app",
  messagingSenderId:"425078158369",
  appId: "1:425078158369:web:20b02ffc0c5bb395559f60",
  measurementId:"G-ZMMB3SBPF4"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
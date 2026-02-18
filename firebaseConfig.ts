

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Pega aquí los datos que copiaste de la consola de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBbVc97O5rF2mEb3d_PKG0FGOXpJbtp620",
  authDomain: "inmijobs-c69c6.firebaseapp.com",
  projectId: "inmijobs-c69c6",
  storageBucket: "inmijobs-c69c6.firebasestorage.app",
  messagingSenderId: "425078158369",
  appId: "1:425078158369:web:20b02ffc0c5bb395559f60",
  measurementId: "G-ZMMB3SBPF4"
};
// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios que vas a usar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
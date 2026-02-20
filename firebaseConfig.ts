

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Pega aquí los datos que copiaste de la consola de Firebase
const firebaseConfig = {
  apiKey: process.env.APIKEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGINGRENDER,
  appId: process.env.APPID,
  measurementId:process.env. MEASUREID
};
// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios que vas a usar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);



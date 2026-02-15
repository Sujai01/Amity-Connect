import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyApg2l74_Bp4UB2kU9PE4X4RSjHN_PBIp0",
  authDomain: "amityconnect-14742.firebaseapp.com",
  projectId: "amityconnect-14742",
  storageBucket: "amityconnect-14742.firebasestorage.app",
  messagingSenderId: "650703923119",
  appId: "1:650703923119:web:538219051d68af2985f15a",
  measurementId: "G-VBXYFZKYS9"
};

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const auth = getAuth(app);
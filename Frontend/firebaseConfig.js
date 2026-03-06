import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

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
// const analytics = getAnalytics(app);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});


export const db = getFirestore(app);


// NOTE: I removed Analytics entirely. 
// It causes errors in Expo Go and you don't need it yet!
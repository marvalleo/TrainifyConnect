import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCKdjs9dYmuToTHmbHOYpe3jq2v7MwrglQ",
  authDomain: "trainifyconnect-a7c70.firebaseapp.com",
  projectId: "trainifyconnect-a7c70",
  storageBucket: "trainifyconnect-a7c70.firebasestorage.app",
  messagingSenderId: "22076773317",
  appId: "1:22076773317:web:14074217f77078eccb31ac",
  measurementId: "G-H1YKQZMQ0K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

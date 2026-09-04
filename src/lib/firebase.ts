import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyDUCG6ncdBPhbzKcvWVwnF2hJ7pqKV57xA",
  authDomain: "radarseguro.firebaseapp.com",
  projectId: "radarseguro",
  storageBucket: "radarseguro.firebasestorage.app",
  messagingSenderId: "417473619805",
  appId: "1:417473619805:web:8fbc0366fbe53c0fe46ab4",
  measurementId: "G-XV4680B8GH"
};

// Initialize Firebase safely
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

export {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
};

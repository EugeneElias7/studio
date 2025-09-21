
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "studio-3376546694-a8e3d",
  "appId": "1:703998424217:web:98c6af1a05d49e8fbc7408",
  "apiKey": "AIzaSyAtLBwRQK_no_VmaR35kxSLgUmKkADRifM",
  "authDomain": "studio-3376546694-a8e3d.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "703998424217"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

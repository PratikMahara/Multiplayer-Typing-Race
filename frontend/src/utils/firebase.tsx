// utils/firebase.tsx (or .ts is also fine)

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

// Define the type for firebaseConfig
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Your web app's Firebase configuration
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY as string,  // type assertion
  authDomain: "multiplayer-typing-9d5cc.firebaseapp.com",
  projectId: "multiplayer-typing-9d5cc",
  storageBucket: "multiplayer-typing-9d5cc.firebasestorage.app",
  messagingSenderId: "616237297608",
  appId: "1:616237297608:web:9299dab9d9c654ebc61afd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const provider: GoogleAuthProvider = new GoogleAuthProvider();

export { auth, provider };

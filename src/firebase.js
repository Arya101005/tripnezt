import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBN3mHShBfnnmPl7w5Ly8O-lp8-QruGo_w",
  authDomain: "tripnezt-app.firebaseapp.com",
  projectId: "tripnezt-app",
  storageBucket: "tripnezt-app.firebasestorage.app",
  messagingSenderId: "1047310980568",
  appId: "1:1047310980568:web:9393e5e41f6920f9ef4ead"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

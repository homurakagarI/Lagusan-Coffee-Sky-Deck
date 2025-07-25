// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOboIY1vMo2Ujem41tcAmEMrvOJp6NNJ4",
  authDomain: "lagusan-cofee-sky-deck.firebaseapp.com",
  projectId: "lagusan-cofee-sky-deck",
  storageBucket: "lagusan-cofee-sky-deck.firebasestorage.app",
  messagingSenderId: "182806216428",
  appId: "1:182806216428:web:09b2ed3cdc990bebefafc9",
  measurementId: "G-RW3CS0R1FY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;

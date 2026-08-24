// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFLNVc5V2o4prkn0vhgMuRPNUq1r0g49g",
  authDomain: "dealsafe-fa406.firebaseapp.com",
  projectId: "dealsafe-fa406",
  storageBucket: "dealsafe-fa406.firebasestorage.app",
  messagingSenderId: "147748444632",
  appId: "1:147748444632:web:df07e878009f678932baad",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Unable to persist the Firebase session.", error);
});

export { app, auth, db };
export default app;

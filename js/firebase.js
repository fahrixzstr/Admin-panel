// admin/js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDjSUSuUWl6GOh_vJ-GnYV1tvguv0_pRXI",
    authDomain: "fahrixzstore.firebaseapp.com",
    databaseURL: "https://fahrixzstore-default-rtdb.firebaseio.com",
    projectId: "fahrixzstore",
    storageBucket: "fahrixzstore.firebasestorage.app",
    messagingSenderId: "1070736619563",
    appId: "1:1070736619563:web:735cdd57d5c90373e1526e",
    measurementId: "G-H7QL79SSMX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export { signInWithPopup, signOut, onAuthStateChanged };

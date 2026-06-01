// admin/js/auth.js - LOGIN GOOGLE SAJA
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from "./firebase.js";
import { db } from "./firebase.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

console.log("Auth.js loaded");

// Custom Toast
function showAlert(message, type = 'info') {
    const oldToast = document.querySelector('.login-toast');
    if (oldToast) oldToast.remove();
    
    const colors = {
        success: '#10b981',
        error: '#ef4444', 
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    
    const toast = document.createElement('div');
    toast.className = 'login-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
}

// Login dengan Google
window.loginWithGoogle = async () => {
    const btn = document.getElementById('googleBtn');
    if (btn) btn.disabled = true;
    
    try {
        console.log("Mulai login dengan Google...");
        
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        console.log("Login berhasil:", user.email);
        
        // Simpan/update data user di Firestore
        await saveUserData(user);
        
        showAlert('Login berhasil! Mengalihkan...', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error("Login error:", error);
        
        let errorMessage = error.message;
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Popup ditutup. Coba lagi!';
        } else if (error.code === 'auth/cancelled-popup-request') {
            errorMessage = 'Popup dibatalkan.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Koneksi internet bermasalah!';
        }
        
        showAlert(errorMessage, 'error');
        
    } finally {
        if (btn) btn.disabled = false;
    }
};

// Simpan data user ke Firestore
async function saveUserData(user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'admin',
            createdAt: serverTimestamp()
        });
    }
}

// Auto redirect jika sudah login
onAuthStateChanged(auth, (user) => {
    console.log("Auth changed:", user ? user.email : 'not logged in');
    if (user && window.location.pathname.includes('login.html')) {
        window.location.href = 'index.html';
    }
});

// Logout
window.logout = async () => {
    if (confirm('Logout sekarang?')) {
        await signOut(auth);
        window.location.href = 'login.html';
    }
};

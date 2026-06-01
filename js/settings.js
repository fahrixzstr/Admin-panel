// admin/js/settings.js
import { db } from "./firebase.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";
import { storage } from "./firebase.js";

let settingsDocId = 'site_settings';

export const initSettings = async () => {
    await loadSettings();
};

async function loadSettings() {
    try {
        const docSnap = await getDoc(doc(db, "settings", settingsDocId));
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('site-name').value = data.siteName || 'FahriXZ Store';
            document.getElementById('wa-number').value = data.whatsapp || '';
            document.getElementById('telegram-link').value = data.telegram || '';
            document.getElementById('instagram-link').value = data.instagram || '';
            document.getElementById('footer-text').value = data.footerText || '';
            
            if (data.logo) {
                document.getElementById('logo-preview').src = data.logo;
            }
        }
    } catch (error) {
        console.error("Error loading settings:", error);
    }
}

document.getElementById('settings-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const siteName = document.getElementById('site-name').value;
    const whatsapp = document.getElementById('wa-number').value;
    const telegram = document.getElementById('telegram-link').value;
    const instagram = document.getElementById('instagram-link').value;
    const footerText = document.getElementById('footer-text').value;
    const logoFile = document.getElementById('site-logo').files[0];
    
    let logoUrl = null;
    
    if (logoFile) {
        const storageRef = ref(storage, `logo/${Date.now()}_${logoFile.name}`);
        await uploadBytes(storageRef, logoFile);
        logoUrl = await getDownloadURL(storageRef);
    }
    
    const settingsData = {
        siteName, whatsapp, telegram, instagram, footerText,
        updatedAt: new Date()
    };
    
    if (logoUrl) settingsData.logo = logoUrl;
    
    try {
        const docSnap = await getDoc(doc(db, "settings", settingsDocId));
        if (docSnap.exists()) {
            await updateDoc(doc(db, "settings", settingsDocId), settingsData);
        } else {
            await setDoc(doc(db, "settings", settingsDocId), settingsData);
        }
        
        Swal.fire('Berhasil', 'Pengaturan disimpan', 'success');
    } catch (error) {
        Swal.fire('Error', error.message, 'error');
    }
});

// Preview logo
document.getElementById('site-logo')?.addEventListener('change', function(e) {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('logo-preview').src = e.target.result;
        };
        reader.readAsDataURL(this.files[0]);
    }
});
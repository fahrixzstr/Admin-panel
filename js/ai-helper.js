// admin/js/ai-helper.js
import { db, storage } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// TODO: Ganti dengan API Key Anda dari https://platform.openai.com/
const OPENAI_API_KEY = "ISI_DENGAN_OPENAI_API_KEY_ANDA";

export const generateSmartNotification = async (context) => {
    try {
        showToast('🤖 AI sedang membuat notifikasi cerdas...', 'info');
        
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Anda adalah asisten marketing profesional. Buat notifikasi yang menarik dan cerdas untuk toko online berdasarkan konteks berikut. 
                        Buat dalam format JSON dengan fields: title (maksimal 30 karakter), message (maksimal 100 karakter), type (info/promo/alert).
                        Gunakan bahasa Indonesia yang menarik.`
                    },
                    {
                        role: "user",
                        content: `Konteks: ${context}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 200
            })
        });

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Parse JSON dari response
        const notification = JSON.parse(content.replace(/```json|```/g, '').trim());
        
        return notification;
    } catch (error) {
        console.error("AI Error:", error);
        showToast('Gagal generate notifikasi AI', 'error');
        return null;
    }
};

export const generateProductFromDescription = async (description) => {
    try {
        showToast('🤖 AI sedang membuat deskripsi produk...', 'info');
        
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Anda adalah asisten toko online profesional. Parse deskripsi produk menjadi data produk yang lengkap.
                        Buat dalam format JSON dengan fields: name, price (angka), category (Fashion/Elektronik/Aksesoris/Lainnya), 
                        badge (Best Seller/Popular/Promo/kosong), description (maksimal 200 karakter).
                        Untuk harga, buat harga yang realistis dalam angka.`
                    },
                    {
                        role: "user",
                        content: description
                    }
                ],
                temperature: 0.7,
                max_tokens: 300
            })
        });

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        const product = JSON.parse(content.replace(/```json|```/g, '').trim());
        
        return product;
    } catch (error) {
        console.error("AI Error:", error);
        showToast('Gagal generate produk AI', 'error');
        return null;
    }
};

export const analyzeSalesData = async (orders) => {
    try {
        const orderSummary = orders.map(o => `${o.status} - ${o.total}`).join(', ');
        
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Anda adalah analis data toko. Berikan insights singkat (maksimal 50 kata) tentang data penjualan berikut.`
                    },
                    {
                        role: "user",
                        content: `Data pesanan: ${orderSummary}`
                    }
                ],
                temperature: 0.5,
                max_tokens: 100
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("AI Error:", error);
        return null;
    }
};

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
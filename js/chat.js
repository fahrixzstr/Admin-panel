// admin/js/chat.js
import { db } from "./firebase.js";
import { 
    collection, addDoc, getDocs, getDoc, doc, updateDoc, 
    query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let activeChatRoom = null;
let unsubscribe = null;
let chatUsers = [];
let broadcastMessages = [];

// Initialize Chat
export const initChat = async () => {
    await loadChatUsers();
    await loadBroadcastMessages();
    setupRealtimeListeners();
};

// Load all users who have chatted
async function loadChatUsers() {
    const tbody = document.getElementById('chat-users-list');
    if (!tbody) return;

    const q = query(collection(db, "chats"), orderBy("lastMessageAt", "desc"));
    const snapshot = await getDocs(q);
    
    chatUsers = [];
    snapshot.forEach(doc => {
        chatUsers.push({ id: doc.id, ...doc.data() });
    });
    
    renderChatUsers();
}

function renderChatUsers() {
    const container = document.getElementById('chat-users-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (chatUsers.length === 0) {
        container.innerHTML = '<p style="padding:1rem;text-align:center;color:#6b7280">Belum ada percakapan</p>';
        return;
    }

    chatUsers.forEach(chat => {
        const user = chat.users.find(u => u.role === 'user') || { name: 'User', uid: '_unknown' };
        const div = document.createElement('div');
        div.className = `user-item ${activeChatRoom === chat.id ? 'active' : ''}`;
        div.onclick = () => openChatRoom(chat.id, user);
        div.innerHTML = `
            <div class="user-avatar">${user.name?.charAt(0).toUpperCase() || 'U'}</div>
            <div style="flex:1">
                <div style="font-weight:500">${user.name || 'User'}</div>
                <small style="color:#6b7280">${chat.lastMessage || 'Belum ada pesan'}</small>
            </div>
            <div class="user-status ${chat.isOnline ? '' : 'offline'}"></div>
        `;
        container.appendChild(div);
    });
}

// Open specific chat room
async function openChatRoom(roomId, user) {
    activeChatRoom = roomId;
    renderChatUsers(); // Update active state
    
    document.getElementById('current-chat-user').textContent = user.name || 'User';
    document.getElementById('chat-messages').innerHTML = 'Loading...';
    
    // Unsubscribe previous listener
    if (unsubscribe) unsubscribe();
    
    // Subscribe to messages
    const messagesRef = collection(db, "chats", roomId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    
    unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });
        renderMessages(messages);
    });
}

function renderMessages(messages) {
    const container = document.getElementById('chat-messages');
    container.innerHTML = '';
    
    messages.forEach(msg => {
        const isAdmin = msg.sender === 'admin';
        const div = document.createElement('div');
        div.className = `chat-message ${isAdmin ? 'admin' : 'user'}`;
        div.innerHTML = `
            <div>${msg.message}</div>
            <small style="opacity:0.7;font-size:0.7rem">${msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'}) : ''}</small>
        `;
        container.appendChild(div);
    });
    
    container.scrollTop = container.scrollHeight;
}

// Send message
window.sendChatMessage = async () => {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message || !activeChatRoom) return;
    
    try {
        const messagesRef = collection(db, "chats", activeChatRoom, "messages");
        await addDoc(messagesRef, {
            message,
            sender: 'admin',
            senderName: 'Admin',
            createdAt: serverTimestamp()
        });
        
        // Update last message
        await updateDoc(doc(db, "chats", activeChatRoom), {
            lastMessage: message,
            lastMessageAt: serverTimestamp()
        });
        
        input.value = '';
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

// Make Admin Online Indicator
export const setAdminOnline = async () => {
    // Update admin status periodically
    setInterval(async () => {
        await updateDoc(doc(db, "settings", "site_settings"), {
            adminOnline: true,
            lastActive: serverTimestamp()
        });
    }, 30000);
};

// Broadcast Messages
async function loadBroadcastMessages() {
    const container = document.getElementById('broadcast-list');
    if (!container) return;
    
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(20));
    const snapshot = await getDocs(q);
    
    broadcastMessages = [];
    snapshot.forEach(doc => {
        broadcastMessages.push({ id: doc.id, ...doc.data() });
    });
    
    renderBroadcastList();
}

function renderBroadcastList() {
    const container = document.getElementById('broadcast-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    broadcastMessages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'broadcast-item';
        div.innerHTML = `
            <div>
                <strong>${msg.title}</strong>
                <p style="margin:0;font-size:0.85rem">${msg.message}</p>
            </div>
            <small>${msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleDateString('id-ID') : ''}</small>
        `;
        container.appendChild(div);
    });
}

window.sendBroadcast = async () => {
    const title = document.getElementById('broadcast-title').value;
    const message = document.getElementById('broadcast-message').value;
    const type = document.getElementById('broadcast-type').value;
    
    if (!title || !message) {
        showToast('Mohon isi title dan message', 'error');
        return;
    }
    
    try {
        // Save to notifications collection
        await addDoc(collection(db, "notifications"), {
            title,
            message,
            type,
            createdAt: serverTimestamp(),
            sentBy: 'admin'
        });
        
        // TODO: Implement FCM untuk push notification ke user apps
        // Ini memerlukan Firebase Cloud Messaging
        
        showToast('Broadcast berhasil dikirim!', 'success');
        
        document.getElementById('broadcast-title').value = '';
        document.getElementById('broadcast-message').value = '';
        
        loadBroadcastMessages();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    }
};

// Setup realtime listeners untuk new chats
function setupRealtimeListeners() {
    // Listen untuk new chat rooms
    const chatsRef = collection(db, "chats");
    onSnapshot(query(chatsRef, orderBy("lastMessageAt", "desc")), (snapshot) => {
        loadChatUsers();
    });
    
    // Listen untuk new broadcast notifications
    const notifRef = collection(db, "notifications");
    onSnapshot(query(notifRef, orderBy("createdAt", "desc"), limit(1)), (snapshot) => {
        snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
                const data = change.doc.data();
                showToast(`Notifikasi baru: ${data.title}`, 'info');
            }
        });
    });
}

// Toast notification helper
window.showToast = (message, type = 'info') => {
    const container = document.querySelector('.toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// Chat Widget Toggle
window.toggleChatWidget = () => {
    document.getElementById('chat-window').classList.toggle('active');
};

window.closeChatWidget = () => {
    document.getElementById('chat-window').classList.remove('active');
};
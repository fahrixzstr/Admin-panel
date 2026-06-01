// admin/js/users.js
import { db } from "./firebase.js";
import { collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export const initUsers = async () => {
    await loadUsers();
};

async function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Loading...</td></tr>';
    
    // Catatan: Untuk mengambil semua user, Anda perlu membuat collection 'users' 
    // saat user mendaftar atau gunakan Firebase Auth Admin SDK (server-side)
    // Ini hanya contoh jika Anda menyimpan data user di Firestore
    
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Belum ada pengguna</td></tr>';
        return;
    }
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.email || '-'}</td>
            <td><code style="font-size:0.7rem">${user.uid}</code></td>
            <td>${user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString('id-ID') : '-'}</td>
            <td>
                <button class="btn-action btn-delete" onclick="deleteUser('${user.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.deleteUser = async (id) => {
    const result = await Swal.fire({
        title: 'Hapus pengguna?',
        text: 'Data tidak bisa dikembalikan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
        await deleteDoc(doc(db, "users", id));
        Swal.fire('Berhasil', 'Pengguna dihapus', 'success');
        loadUsers();
    }
};
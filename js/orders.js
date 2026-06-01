// admin/js/orders.js
import { db } from "./firebase.js";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

let orders = [];

export const initOrders = async () => {
    await loadOrders();
};

async function loadOrders() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Loading...</td></tr>';
    
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    renderOrders(orders);
}

function renderOrders(data) {
    const tbody = document.getElementById('orders-table-body');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Belum ada pesanan</td></tr>';
        return;
    }

    data.forEach(order => {
        const statusHtml = getStatusBadge(order.status);
        const date = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('id-ID') : '-';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code>${order.orderCode || order.id.substring(0, 8)}</code></td>
            <td>${order.customerName || '-'}<br><small>${order.customerPhone || ''}</small></td>
            <td>${formatRupiah(order.total)}</td>
            <td>${date}</td>
            <td>${statusHtml}</td>
            <td>
                <button class="btn-action btn-edit" onclick="updateOrderStatus('${order.id}')"><i class="fas fa-sync-alt"></i></button>
                <button class="btn-action btn-delete" onclick="deleteOrder('${order.id}')"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getStatusBadge(status) {
    const colors = {
        'Menunggu Pembayaran': '#f59e0b',
        'Diproses': '#3b82f6',
        'Selesai': '#10b981',
        'Dibatalkan': '#ef4444'
    };
    const color = colors[status] || '#6b7280';
    return `<span class="badge" style="background:${color};color:#fff">${status}</span>`;
}

function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number || 0);
}

window.filterOrders = () => {
    const filter = document.getElementById('order-status-filter').value;
    if (filter === 'all') {
        renderOrders(orders);
    } else {
        const filtered = orders.filter(o => o.status === filter);
        renderOrders(filtered);
    }
};

window.updateOrderStatus = async (id) => {
    const order = orders.find(o => o.id === id);
    const { value: status } = await Swal.fire({
        title: 'Ubah Status Pesanan',
        input: 'select',
        inputOptions: {
            'Menunggu Pembayaran': 'Menunggu Pembayaran',
            'Diproses': 'Diproses',
            'Selesai': 'Selesai',
            'Dibatalkan': 'Dibatalkan'
        },
        inputValue: order.status,
        showCancelButton: true
    });

    if (status) {
        try {
            await updateDoc(doc(db, "orders", id), { status });
            Swal.fire('Berhasil', 'Status diperbarui', 'success');
            loadOrders();
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }
};

window.deleteOrder = async (id) => {
    const result = await Swal.fire({
        title: 'Hapus pesanan?',
        text: 'Data tidak bisa dikembalikan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
        try {
            await deleteDoc(doc(db, "orders", id));
            Swal.fire('Berhasil', 'Pesanan dihapus', 'success');
            loadOrders();
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    }
};
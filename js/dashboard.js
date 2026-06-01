// admin/js/dashboard.js
import { db } from "./firebase.js";
import { collection, getDocs, query, orderBy, limit, getCountFromServer } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { Chart, registerables } from "https://cdn.jsdelivr.net/npm/chart.js/+esm";

Chart.register(...registerables);

export const initDashboard = async () => {
    await loadStats();
    initChart();
};

async function loadStats() {
    try {
        // Hitung Produk
        const productsSnap = await getDocs(collection(db, "products"));
        document.getElementById('total-products').textContent = productsSnap.size;

        // Hitung Pesanan
        const ordersSnap = await getDocs(collection(db, "orders"));
        document.getElementById('total-orders').textContent = ordersSnap.size;

        // Hitung Pendapatan (Status Selesai)
        let income = 0;
        ordersSnap.forEach(doc => {
            const data = doc.data();
            if (data.status === 'Selesai') {
                income += parseInt(data.total || 0);
            }
        });
        document.getElementById('total-income').textContent = formatRupiah(income);

    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumSignificantDigits: 3 }).format(number);
}

function initChart() {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    // Dummy Data Contoh (Ganti dengan data real dari Firestore jika perlu)
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Penjualan (Rp)',
                data: [1200000, 1900000, 3000000, 5000000, 2000000, 3000000],
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
// admin/js/products.js
import { db, storage } from "./firebase.js";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

let products = [];
window.currentEditId = null;

export const initProducts = async () => {
    await loadProducts();
};

async function loadProducts() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Loading...</td></tr>';
    
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    renderProducts(products);
}

function renderProducts(data) {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Belum ada produk</td></tr>';
        return;
    }

    data.forEach(product => {
        const badgeHtml = getBadgeHtml(product.badge);
        const imageUrl = product.image || 'https://via.placeholder.com/40?text=Img';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${imageUrl}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/40?text=Img'" style="width:40px;height:40px;object-fit:cover;border-radius:4px"></td>
            <td><strong>${product.name}</strong><br><small style="color:#6b7280">${product.description?.substring(0, 40) || ''}...</small></td>
            <td>${formatRupiah(product.price)}</td>
            <td>${product.category || '-'}</td>
            <td>${badgeHtml}</td>
            <td>
                <button class="btn-action btn-edit" onclick="openProductModal('${product.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-action btn-delete" onclick="deleteProduct('${product.id}')" title="Hapus"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function getBadgeHtml(badge) {
    if (!badge) return '<span class="badge" style="background:#e2e8f0;color:#64748b">-</span>';
    const badges = {
        'Best Seller': '<span class="badge best-seller">Best Seller</span>',
        'Popular': '<span class="badge popular">Popular</span>',
        'Promo': '<span class="badge promo">Promo</span>'
    };
    return badges[badge] || `<span class="badge" style="background:#e2e8f0;color:#64748b">${badge}</span>`;
}

function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumSignificantDigits: 3 }).format(number || 0);
}

window.loadProductForEdit = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category || 'Fashion';
    document.getElementById('product-badge').value = product.badge || '';
    document.getElementById('product-description').value = product.description || '';
};

// Handle Form Submit
document.getElementById('product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
    btn.disabled = true;
    
    const name = document.getElementById('product-name').value;
    const price = parseInt(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const badge = document.getElementById('product-badge').value;
    const description = document.getElementById('product-description').value;
    const imageFile = document.getElementById('product-image').files[0];
    
    let imageUrl = null;
    
    try {
        if (imageFile) {
            const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
            await uploadBytes(storageRef, imageFile);
            imageUrl = await getDownloadURL(storageRef);
        }
        
        const productData = {
            name,
            price,
            category,
            badge,
            description,
            updatedAt: serverTimestamp()
        };
        
        if (imageUrl) productData.image = imageUrl;
        
        if (window.currentEditId) {
            await updateDoc(doc(db, "products", window.currentEditId), productData);
            showToast('Produk diperbarui!', 'success');
        } else {
            productData.createdAt = serverTimestamp();
            await addDoc(collection(db, "products"), productData);
            showToast('Produk ditambahkan!', 'success');
        }
        
        closeProductModal();
        await loadProducts();
    } catch (error) {
        showToast('Error: ' + error.message, 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

window.deleteProduct = async (id) => {
    const result = await Swal.fire({
        title: 'Hapus produk?',
        text: 'Data tidak bisa dikembalikan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    });
    
    if (result.isConfirmed) {
        try {
            await deleteDoc(doc(db, "products", id));
            showToast('Produk dihapus!', 'success');
            loadProducts();
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    }
};

window.closeProductModal = () => {
    document.getElementById('product-modal').classList.remove('active');
    window.currentEditId = null;
};

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
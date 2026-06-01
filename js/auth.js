// admin/js/auth.js
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { auth } from "./firebase.js";

const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = loginForm.querySelector('button');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        btn.disabled = true;

        try {
            // TODO: Ganti dengan email admin asli Anda
            if (!email.includes('fahriiandriansaputra@gmail.com')) {
                Swal.fire('Error', 'Hanya admin yang boleh masuk', 'error');
                btn.innerHTML = originalText;
                btn.disabled = false;
                return;
            }

            await signInWithEmailAndPassword(auth, email, password);
            Swal.fire('Berhasil', 'Login berhasil', 'success').then(() => {
                window.location.href = 'index.html';
            });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', error.message, 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

onAuthStateChanged(auth, (user) => {
    if (!user && window.location.pathname !== '/admin/login.html') {
        // window.location.href = 'login.html'; // Uncomment untuk proteksi
    }
});

export const logout = async () => {
    const result = await Swal.fire({
        title: 'Logout?',
        text: 'Anda yakin ingin keluar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Keluar!'
    });

    if (result.isConfirmed) {
        await signOut(auth);
        window.location.href = 'login.html';
    }
};
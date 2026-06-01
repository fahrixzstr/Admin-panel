import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

import {
  getDatabase,
  ref,
  set
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

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
const db = getDatabase(app);

async function seedDatabase() {

  // WEBSITE SETTINGS
  await set(ref(db, "settings"), {
    storeName: "FahriXZ Store",
    logo: "assets/logo.png",
    favicon: "assets/favicon.png",
    maintenance: false,

    theme: {
      primaryColor: "#6d28d9",
      secondaryColor: "#06b6d4",
      backgroundColor: "#0f172a",
      textColor: "#ffffff",
      borderRadius: "16px"
    },

    layout: {
      navbarPosition: "top",
      floatingButtonPosition: "right-bottom",
      productLayout: "grid",
      missionLayout: "card",
      showBanner: true,
      showMission: true,
      showNotification: true,
      showProducts: true
    }
  });

  // CATEGORIES
  await set(ref(db, "categories"), {
    subscription: {
      name: "Subscription",
      icon: "crown",
      active: true
    },

    ewallet: {
      name: "E-Wallet",
      icon: "wallet",
      active: true
    },

    jasa: {
      name: "Jasa",
      icon: "briefcase",
      active: true
    }
  });

  // PRODUCTS
  await set(ref(db, "products"), {
    product1: {
      name: "Canva Pro",
      category: "subscription",
      badge: "Best Seller",
      description: "Canva Pro Premium",
      price: 15000,
      stock: 999,
      thumbnail: "assets/products/canva.jpg",
      active: true,
      createdAt: Date.now()
    }
  });

  // MISSIONS
  await set(ref(db, "missions"), {
    mission1: {
      title: "Misi Pertama",
      description: "Selesaikan tugas pertama",
      terms: "Harus login terlebih dahulu",
      reward: 1000,
      duration: 7,
      thumbnail: "assets/missions/mission1.jpg",
      badge: "Easy",
      active: true,
      createdAt: Date.now()
    }
  });

  // MISSIONS SALDO
  await set(ref(db, "missionsSaldo"), 0);

  // BANNERS
  await set(ref(db, "banners"), {
    banner1: {
      title: "Promo Canva",
      description: "Diskon spesial",
      image: "assets/banner/banner1.jpg",
      active: true
    }
  });

  // NOTIFICATIONS
  await set(ref(db, "notifications"), {
    notif1: {
      title: "Selamat Datang",
      message: "Terima kasih telah bergabung",
      type: "info",
      active: true,
      createdAt: Date.now()
    }
  });

  // USERS
  await set(ref(db, "users"), {});

  // ORDERS
  await set(ref(db, "orders"), {});

  // ADMINS
  await set(ref(db, "admins"), {});

  console.log("✅ Database berhasil dibuat");
}

seedDatabase();

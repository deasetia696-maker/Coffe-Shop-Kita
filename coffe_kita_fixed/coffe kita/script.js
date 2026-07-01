// ==========================================
// 1. UTILITY FUNCTION (FORMAT RUPIAH)
// ==========================================
function formatRupiah(angka) {
  return "Rp " + Number(angka).toLocaleString('id-ID');
}

// ==========================================
// 2. FUNGSI LOGIN SISTEM
// ==========================================
function loginUser() {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const message = document.getElementById("message");

  const accounts = [
    {username: "pelanggan", password: "1234", role: "menu"},
    {username: "dea", password: "coffee", role: "menu"},
    {username: "kasir", password: "admin123", role: "kasir"}
  ];

  const found = accounts.find(acc => acc.username === user && acc.password === pass);

  if(found){
    message.textContent = `Selamat datang, ${user}!`;
    message.style.color = "#4caf50"; 
    localStorage.setItem("role", found.role);

    if(found.role === "menu"){
      setTimeout(() => window.location.href = "menu.html", 1500);
    } else if(found.role === "kasir"){
      setTimeout(() => window.location.href = "kasir.html", 1500);
    }
  } else {
    message.textContent = "Login gagal! Username/Password salah.";
    message.style.color = "#f44336"; 
  }
  return false;
}

// ==========================================
// 3. MANAJEMEN PESANAN PER MEJA (LOCALSTORAGE)
// ==========================================
function getNomorMejaAktif() {
  return localStorage.getItem("nomorMejaGlobal") || "";
}

function getOrders() {
  const noMeja = getNomorMejaAktif();
  if (!noMeja) return []; 
  return JSON.parse(localStorage.getItem(`orders_meja_${noMeja}`)) || [];
}

function saveOrders(orders) {
  const noMeja = getNomorMejaAktif();
  if (!noMeja) return;
  localStorage.setItem(`orders_meja_${noMeja}`, JSON.stringify(orders));
}

function addToOrder(name, price) {
  const noMeja = getNomorMejaAktif();
  if (!noMeja || noMeja.trim() === "") {
    alert("Silakan masukkan Nomor Meja Anda terlebih dahulu di bagian bawah sebelum memesan menu!");
    const inputMeja = document.getElementById("nomorMeja");
    if (inputMeja) {
      inputMeja.scrollIntoView({ behavior: 'smooth' });
      inputMeja.focus();
    }
    return;
  }

  let orders = getOrders();
  orders.push({ name: name, price: price });
  saveOrders(orders);
  
  alert(`${name} ditambahkan ke pesanan Meja ${noMeja}!`);
  renderSemuaHalaman();
}

function removeOrder(index) {
  let orders = getOrders();
  orders.splice(index, 1);
  saveOrders(orders);
  
  renderSemuaHalaman();
}

function rekapPesanan(orders) {
  const rekap = {};
  orders.forEach(item => {
    if (rekap[item.name]) {
      rekap[item.name].qty += 1;
      rekap[item.name].subtotal += item.price;
    } else {
      rekap[item.name] = {
        name: item.name,
        qty: 1,
        price: item.price,
        subtotal: item.price
      };
    }
  });
  return Object.values(rekap);
}

// ==========================================
// 4. INTERFACE UI UNTUK HALAMAN: menu.html
// ==========================================
function updateMenuCartUI() {
  const cartCount = document.getElementById("cartCount");
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  
  const orders = getOrders();
  const noMeja = getNomorMejaAktif();
  
  if (cartCount) cartCount.textContent = orders.length;
  
  if (cartItems && cartTotal) {
    cartItems.innerHTML = "";
    let total = 0;
    
    if (orders.length === 0) {
      cartItems.innerHTML = `<li style="padding:10px; color:#999; text-align:center;">Keranjang kosong ${noMeja ? '(Meja ' + noMeja + ')' : ''}</li>`;
    } else {
      orders.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `${item.name} - ${formatRupiah(item.price)} 
          <button class="remove-btn" onclick="removeOrder(${index})" style="background:none; border:none; cursor:pointer;">❌</button>`;
        cartItems.appendChild(li);
        total += item.price;
      });
    }
    cartTotal.textContent = formatRupiah(total);
  }

  const inputMeja = document.getElementById("nomorMeja");
  if (inputMeja && noMeja) {
    inputMeja.value = noMeja;
  }
}

function toggleCart() {
  const popup = document.getElementById("cartPopup");
  if (popup) {
    popup.style.display = popup.style.display === "block" ? "none" : "block";
  }
}

function goToOrder() {
  window.location.href = "order.html";
}

// ==========================================
// 5. INTERFACE UI UNTUK HALAMAN: order.html
// ==========================================
function displayUserOrderPage() {
  const orderList = document.getElementById("orderList");
  const totalPrice = document.getElementById("totalPrice");
  if (!orderList || !totalPrice) return;

  const orders = getOrders();
  orderList.innerHTML = "";
  let total = 0;
  
  if (orders.length === 0) {
    orderList.innerHTML = `<li style="text-align:center; color:#999; padding: 20px;">Belum ada pesanan yang dipilih.</li>`;
  } else {
    orders.forEach((order, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${order.name} <strong>${formatRupiah(order.price)}</strong></span> 
        <button class="remove-btn" onclick="removeOrder(${index})">Hapus</button>`;
      orderList.appendChild(li);
      total += order.price;
    });
  }
  totalPrice.textContent = formatRupiah(total);
}

function payOrder() {
  const orders = getOrders();
  const nomorMeja = getNomorMejaAktif();

  if (orders.length === 0) {
    alert("Keranjang belanja kamu masih kosong!");
    return;
  }

  alert(`Pesanan Meja ${nomorMeja} sudah dikunci dan dikirim ke kasir!`);
  localStorage.removeItem("nomorMejaGlobal"); 
  window.location.href = "menu.html"; 
}

// ==========================================
// 6. INTERFACE UI UNTUK HALAMAN: kasir.html
// ==========================================
let totalBelanjaGlobal = 0;

function updateDropdownMejaKasir() {
  const dropdownMeja = document.getElementById("pilihMejaKasir");
  if (!dropdownMeja) return;

  const mejaSaatIni = dropdownMeja.value;
  dropdownMeja.innerHTML = '<option value="" style="background: white; color: #333;">-- Pilih Meja --</option>';

  let daftarMeja = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("orders_meja_")) {
      const nomorMeja = key.replace("orders_meja_", "");
      const dataMenu = JSON.parse(localStorage.getItem(key)) || [];
      if (dataMenu.length > 0) {
        daftarMeja.push(nomorMeja);
      }
    }
  }

  daftarMeja.sort((a, b) => parseInt(a) - parseInt(b));

  daftarMeja.forEach(meja => {
    const option = document.createElement("option");
    option.value = meja;
    option.textContent = `Meja ${meja}`;
    option.style.background = "white";
    option.style.color = "#333";
    dropdownMeja.appendChild(option);
  });

  if (daftarMeja.includes(mejaSaatIni)) {
    dropdownMeja.value = mejaSaatIni;
  }
}

function pilihMetodePembayaran() {
  const metodeSelect = document.getElementById("metodeBayar");
  const metode = metodeSelect ? metodeSelect.value : "cash";
  
  const areaCash = document.getElementById("areaCash");
  const areaQris = document.getElementById("areaQris");
  const gambarQris = document.getElementById("gambarQris");

  if (!areaCash || !areaQris) return;

  if (metode === "qris") {
    areaCash.style.display = "none";
    areaQris.style.display = "block";
    if (gambarQris) {
      gambarQris.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=CoffeeShopKita_Meja_Total_${totalBelanjaGlobal}`;
    }
  } else {
    areaCash.style.display = "block";
    areaQris.style.display = "none";
  }
}

function tampilkanKasir() {
  const tbody = document.getElementById("tabelKasirItems");
  const totalEl = document.getElementById("kasirTotal");
  const dropdownMeja = document.getElementById("pilihMejaKasir");
  if (!tbody || !totalEl) return;

  const mejaTerpilih = dropdownMeja ? dropdownMeja.value : "";

  if (!mejaTerpilih) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#999; padding: 20px;">Silakan pilih nomor meja terlebih dahulu.</td></tr>`;
    totalEl.textContent = formatRupiah(0);
    totalBelanjaGlobal = 0;
    hitungKembalianKasir();
    pilihMetodePembayaran();
    return;
  }

  const ordersMeja = JSON.parse(localStorage.getItem(`orders_meja_${mejaTerpilih}`)) || [];
  
  if (ordersMeja.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#999; padding: 20px;">Tidak ada pesanan aktif di Meja ${mejaTerpilih}.</td></tr>`;
    totalEl.textContent = formatRupiah(0);
    totalBelanjaGlobal = 0;
    hitungKembalianKasir();
    pilihMetodePembayaran();
    return;
  }

  const itemsTerbaca = rekapPesanan(ordersMeja);
  tbody.innerHTML = "";
  let total = 0;

  itemsTerbaca.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.name}</strong><br><small style="color:#888;">@${formatRupiah(item.price)}</small></td>
      <td>x${item.qty}</td>
      <td>${formatRupiah(item.subtotal)}</td>
    `;
    tbody.appendChild(tr);
    total += item.subtotal;
  });

  totalBelanjaGlobal = total;
  totalEl.textContent = formatRupiah(total);
  
  hitungKembalianKasir();
  pilihMetodePembayaran();
}

function hitungKembalianKasir() {
  const uangBayarInput = document.getElementById("uangBayar");
  const kembalianEl = document.getElementById("kasirKembalian");
  if (!uangBayarInput || !kembalianEl) return;

  const uangBayar = parseFloat(uangBayarInput.value) || 0;
  
  if (uangBayar === 0) {
    kembalianEl.textContent = formatRupiah(0);
    kembalianEl.style.color = "#634d35";
    return;
  }

  const kembalian = uangBayar - totalBelanjaGlobal;
  kembalianEl.textContent = formatRupiah(kembalian);

  if (kembalian < 0) {
    kembalianEl.textContent = "Uang Kurang! (" + formatRupiah(Math.abs(kembalian)) + ")";
    kembalianEl.style.color = "#e74c3c";
  } else {
    kembalianEl.style.color = "#27ae60";
  }
}

function prosesSelesaiTransaksi() {
  const dropdownMeja = document.getElementById("pilihMejaKasir");
  const mejaTerpilih = dropdownMeja ? dropdownMeja.value : "";
  const metodeSelect = document.getElementById("metodeBayar");
  const metode = metodeSelect ? metodeSelect.value : "cash";
  
  if (!mejaTerpilih) {
    alert("Pilih meja terlebih dahulu!");
    return;
  }

  const ordersMeja = JSON.parse(localStorage.getItem(`orders_meja_${mejaTerpilih}`)) || [];
  if (ordersMeja.length === 0) {
    alert(`Gagal memproses! Keranjang Meja ${mejaTerpilih} kosong.`);
    return;
  }

  let infoNota = "";

  if (metode === "cash") {
    const uangBayarInput = document.getElementById("uangBayar");
    const uangBayar = parseFloat(uangBayarInput ? uangBayarInput.value : 0) || 0;

    if (uangBayar < totalBelanjaGlobal) {
      alert("Transaksi gagal. Uang tunai kurang!");
      return;
    }

    const kembalian = uangBayar - totalBelanjaGlobal;
    infoNota = `Metode Bayar  : CASH / TUNAI\n` +
               `Tunai / Bayar : ${formatRupiah(uangBayar)}\n` +
               `Kembalian     : ${formatRupiah(kembalian)}`;
               
    if (uangBayarInput) uangBayarInput.value = "";
  } else {
    infoNota = `Metode Bayar  : QRIS ELEKTRONIK\n` +
               `Status QRIS   : LUNAS / BERHASIL`;
  }

  alert(
    `=== NOTA PEMBAYARAN SUKSES ===\n` +
    `Nomor Meja    : Meja ${mejaTerpilih}\n` +
    `Total Belanja : ${formatRupiah(totalBelanjaGlobal)}\n` +
    `${infoNota}\n\n` +
    `Terima kasih! Transaksi Selesai.`
  );

  localStorage.removeItem(`orders_meja_${mejaTerpilih}`);
  
  if (dropdownMeja) dropdownMeja.value = "";
  if (metodeSelect) metodeSelect.value = "cash";
  
  updateDropdownMejaKasir();
  tampilkanKasir();
}

// ==========================================
// 7. SINKRONISASI AKTIVASI HALAMAN GLOBAL
// ==========================================
function renderSemuaHalaman() {
  updateMenuCartUI();
  displayUserOrderPage();
  updateDropdownMejaKasir();
  tampilkanKasir();
  pilihMetodePembayaran();
}
function displayUserOrderPage() {
  const orderList = document.getElementById("orderList");
  const totalPrice = document.getElementById("totalPrice");
  const cartMeja = document.getElementById("cartMeja"); // ambil elemen nomor meja
  if (!orderList || !totalPrice) return;

  const orders = getOrders();
  const noMeja = getNomorMejaAktif(); // ambil nomor meja aktif
  orderList.innerHTML = "";
  let total = 0;
  
  if (orders.length === 0) {
    orderList.innerHTML = `<li style="text-align:center; color:#999; padding: 20px;">Belum ada pesanan yang dipilih.</li>`;
  } else {
    orders.forEach((order, index) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${order.name} <strong>${formatRupiah(order.price)}</strong></span> 
        <button class="remove-btn" onclick="removeOrder(${index})">Hapus</button>`;
      orderList.appendChild(li);
      total += order.price;
    });
  }
  totalPrice.textContent = formatRupiah(total);

  // Tambahan: isi nomor meja di UI
  if (cartMeja) {
    cartMeja.textContent = noMeja ? noMeja : "-";
  }
}


window.addEventListener("DOMContentLoaded", () => {
  renderSemuaHalaman();
});


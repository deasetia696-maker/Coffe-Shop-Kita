// ==========================================================================
// 1. FUNGSI UNTUK MENAMPILKAN PESANAN & NOMOR MEJA DI KASIR
// ==========================================================================
function tampilPesananKasir() {
  // Mengambil data pesanan terpadu yang dikirim dari halaman menu
  const pesananMasuk = JSON.parse(localStorage.getItem("pesananTerbaru"));
  
  // Sesuaikan dengan ID tbody di HTML kasir kamu (tabelKasirItems)
  const tbody = document.getElementById("tabelKasirItems");
  const kasirTotal = document.getElementById("kasirTotal");
  const tampilanMeja = document.getElementById("tampilanMejaKasir");

  if (!tbody || !kasirTotal) return;

  // 1. Tampilkan Nomor Meja jika ada datanya
  if (pesananMasuk && pesananMasuk.nomor_meja) {
    tampilanMeja.innerText = `Meja: ${pesananMasuk.nomor_meja}`;
  } else {
    tampilanMeja.innerText = `Meja: -`;
  }

  // 2. Kosongkan tabel sebelum memuat data baru
  tbody.innerHTML = "";

  // JIKA TIDAK ADA PESANAN AKTIF
  if (!pesananMasuk || !pesananMasuk.item || pesananMasuk.item.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#999;">Tidak ada pesanan aktif.</td></tr>`;
    kasirTotal.textContent = "Rp 0";
    return;
  }

  // 3. Looping untuk menampilkan item menu (Menyesuaikan desain tabel kasir kamu yang berisi 3 kolom)
  let total = 0;
  pesananMasuk.item.forEach((order, index) => {
    const tr = document.createElement("tr");
    
    // Hitung subtotal per item (jika ada qty, misal: price * qty. Kalau tidak ada qty, pakai price saja)
    const qty = order.qty || 1; 
    const subtotal = order.price * qty;

    tr.innerHTML = `
      <td>
        <strong>${order.name}</strong><br>
        <small style="color: #888;">@Rp ${order.price.toLocaleString('id-ID')}</small>
      </td>
      <td>x${qty}</td>
      <td>Rp ${subtotal.toLocaleString('id-ID')}</td>
    `;
    tbody.appendChild(tr);
    total += subtotal;
  });

  // 4. Tampilkan Total Belanja
  kasirTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

// ==========================================================================
// 2. FUNGSI HITUNG KEMBALIAN OTOMATIS
// ==========================================================================
function hitungKembalianKasir() {
  const kasirTotalText = document.getElementById("kasirTotal").textContent;
  // Ambil angka total belanja saja menghilangkan teks "Rp" dan titik
  const totalBelanja = parseInt(kasirTotalText.replace(/[^0-9]/g, "")) || 0;
  
  const uangBayar = parseInt(document.getElementById("uangBayar").value) || 0;
  const kasirKembalian = document.getElementById("kasirKembalian");

  if (uangBayar >= totalBelanja) {
    const kembalian = uangBayar - totalBelanja;
    kasirKembalian.textContent = `Rp ${kembalian.toLocaleString('id-ID')}`;
    kasirKembalian.style.color = "#e67e22"; // Warna orange bawaan temamu
  } else {
    kasirKembalian.textContent = "Rp 0 (Uang Kurang)";
    kasirKembalian.style.color = "#red";
  }
}

// ==========================================================================
// 3. FUNGSI TOMBOL SELESAIKAN TRANSAKSI
// ==========================================================================
function prosesSelesaiTransaksi() {
  const kasirTotalText = document.getElementById("kasirTotal").textContent;
  const totalBelanja = parseInt(kasirTotalText.replace(/[^0-9]/g, "")) || 0;
  const uangBayar = parseInt(document.getElementById("uangBayar").value) || 0;

  if (totalBelanja === 0) {
    alert("Tidak ada transaksi yang bisa diselesaikan!");
    return;
  }

  if (uangBayar < totalBelanja) {
    alert("Transaksi gagal! Uang tunai yang dibayarkan kurang.");
    return;
  }

  alert("Pesanan selesai diproses dan berhasil dibayar! Menuju cetak struk...");
  
  // Hapus pesanan terbaru setelah selesai bayar agar kasir bersih kembali
  localStorage.removeItem("pesananTerbaru");
  
  // Refresh tampilan kasir menjadi kosong kembali
  tampilPesananKasir();
  document.getElementById("uangBayar").value = "";
  document.getElementById("kasirKembalian").textContent = "Rp 0";
}

// ==========================================================================
// 4. TRIGER SAAT HALAMAN KASIR DI-LOAD
// ==========================================================================
window.onload = () => {
  tampilPesananKasir(); 
};
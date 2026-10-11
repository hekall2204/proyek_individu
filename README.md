# Dokumentasi Interaktivitas DOM, Event, & Web Storage (Tugas 5)

## 1. Arsitektur State & Web Storage
Aplikasi mengelola data non-sensitif menggunakan `localStorage` (Web Storage):
- `riwayat_cek_trx` (`Array`): Menyimpan hingga 5 kode transaksi pencarian terakhir agar pengguna dapat melakukan pengecekan ulang secara instan.

## 2. Rincian Interaksi Bermakna
1. **Kalkulator Estimasi Biaya Real-time (`input` & `change`):** Mengalkulasi estimasi biaya pesanan saat pengguna memilih jenis layanan dan menginput luas (m²).
2. **Pengiriman Form Pemesanan (`submit`):** Mengolah input form dan hasil kalkulasi biaya menjadi format pesan langsung ke API WhatsApp.
3. **Monitoring Status & Riwayat Search (`submit` & `click` Delegation):** Menampilkan timeline progress pesanan dan menyimpan riwayat pencarian dalam bentuk badge/chip interaktif menggunakan `localStorage`.


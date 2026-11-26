# TEST PLAN

| ID | Fitur / Modul | Skenario Uji | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 | Register (`POST /api/register.php`) | Registrasi dengan `nama`, `email` baru, dan `password` >= 6 karakter | HTTP 201, pesan `"Registrasi berhasil"`, role `pelanggan` | | |
| TC-02 | Register (`POST /api/register.php`) | Registrasi dengan `nama` kosong atau `password` < 6 karakter | HTTP 400, pesan validasi muncul, data tidak tersimpan | | |
| TC-03 | Register (`POST /api/register.php`) | Registrasi memakai `email` yang sudah terdaftar | HTTP 409, pesan `"Email sudah terdaftar."` | | |
| TC-04 | Login (`POST /api/login.php`) | Login memakai `email` dan `password` valid | HTTP 200, sesi aktif, data `user` (`id`, `nama`, `role`) dikembalikan | | |
| TC-05 | Login (`POST /api/login.php`) | Login memakai `password` yang salah | HTTP 401, pesan generik `"Email atau password salah"` | | |
| TC-06 | Login Lockout (`POST /api/login.php`) | Gagal login 3 kali beruntun lalu coba login ke-4 dalam 60 detik | HTTP 429, pesan `"Too Many Requests..."` dengan sisa detik | | |
| TC-07 | RBAC Layanan (`POST /api/layanan.php`) | Akses `POST /api/layanan.php` tanpa login | HTTP 401, pesan `"Unauthorized: Silakan login terlebih dahulu."` | | |
| TC-08 | RBAC Layanan (`DELETE /api/layanan.php`) | User non-admin (`pelanggan`/`petugas`) mencoba `DELETE /api/layanan.php?id=1` | HTTP 403, pesan `"Forbidden: Role Anda tidak memiliki akses."` | | |
| TC-09 | CRUD Layanan (`POST /api/layanan.php`) | Admin/petugas menambah layanan valid (`nama_layanan`, `kategori`, `harga >= 0`) | HTTP 201, data tersimpan dan mengembalikan `id` baru | | |
| TC-10 | Validasi Layanan (`POST /api/layanan.php`) | Tambah layanan dengan `nama_layanan` kosong atau `harga` negatif | HTTP 422, pesan `"Data input tidak valid atau melebihi batas"` | | |
| TC-11 | Detail Layanan (`GET /api/layanan.php`) | Request `GET /api/layanan.php?id=99999` (ID tidak ada) | HTTP 404, JSON error `"Data layanan tidak ditemukan"` | | |
| TC-12 | Form Pemesanan (`main.js` & `layanan.js`) | Isi nama valid, WA valid, pilih layanan, dan isi luas `10` m², lalu submit | Estimasi `Rp 4.500.000` muncul dan tautan `wa.me` terbuka dengan detail pesanan | | |
| TC-13 | Validasi Form (`layanan.js` & `main.js`) | Submit form dengan nomor WA tidak valid atau luas `<= 0` | Error tampil pada field terkait, pengiriman dibatalkan | | |
| TC-14 | Monitoring & API (`main.js` & `api.js`) | Cek kode transaksi tidak ada (`TRX-9999`) dan uji *empty state* / *error* API | Pesan kode tidak ditemukan muncul; Dashboard API tampilkan *empty/error state* + tombol coba lagi | | |
| TC-15 | Responsive (`styles.css`) | Buka halaman pada lebar viewport `320px` di DevTools | Tata letak menyesuaikan tanpa *horizontal scroll* | | |
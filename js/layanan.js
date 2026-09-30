import { tarifLayanan } from './data.js';

/**
 * Memvalidasi format nomor WhatsApp Indonesia.
 */
export const validasiWhatsApp = (nomor) => {
  if (!nomor || typeof nomor !== 'string') return false;
  const cleanNumber = nomor.trim().replace(/[\s-]/g, '');
  const pattern = /^(08|628|\+628)[0-9]{8,11}$/;
  return pattern.test(cleanNumber);
};

/**
 * Memvalidasi format Kode Transaksi (harus TRX-XXXX).
 */
export const validasiKodeTrx = (kode) => {
  if (!kode || typeof kode !== 'string') return false;
  const pattern = /^TRX-[0-9]{4}$/i;
  return pattern.test(kode.trim());
};

export const cariPesananByKode = (daftarPesanan, kodeTrx) => {
  if (!Array.isArray(daftarPesanan)) {
    throw new TypeError("Data pesanan harus berupa Array");
  }

  if (!kodeTrx || typeof kodeTrx !== "string" || !kodeTrx.trim()) {
    throw new Error("Kode transaksi tidak boleh kosong");
  }

  const kodeClean = kodeTrx.trim().toUpperCase();

  if (!validasiKodeTrx(kodeClean)) {
    throw new Error("Format kode transaksi tidak valid. Gunakan format TRX-XXXX (misal: TRX-7701)");
  }

  const hasil = daftarPesanan.find(item => item.kodeTrx.toUpperCase() === kodeClean);

  if (!hasil) {
    throw new Error(`Pesanan dengan kode "${kodeClean}" tidak ditemukan dalam sistem`);
  }

  return hasil;
};

export const simpanRiwayatCek = (kodeTrx) => {
  if (!kodeTrx) return;
  const kodeClean = kodeTrx.trim().toUpperCase();
  let riwayat = JSON.parse(localStorage.getItem('riwayat_cek_trx')) || [];

  if (!riwayat.includes(kodeClean)) {
    riwayat.unshift(kodeClean);
    if (riwayat.length > 5) riwayat.pop();
    localStorage.setItem('riwayat_cek_trx', JSON.stringify(riwayat));
  }
};

export const ambilRiwayatCek = () => {
  return JSON.parse(localStorage.getItem('riwayat_cek_trx')) || [];
};

export const hitungEstimasiBiaya = (jenisLayanan, LuasSqm) => {
  const hargaPerM2 = tarifLayanan[jenisLayanan] || 0;
  const luas = parseFloat(LuasSqm) || 0;
  if (luas < 0) return 0;
  return hargaPerM2 * luas;
};

export const buatPesanWhatsApp = (dataForm) => {
  const { nama, whatsapp, jenisLayanan, ukuran, catatan, estimasi } = dataForm;

  if (!nama || !nama.trim()) {
    throw new Error("Nama lengkap wajib diisi.");
  }
  if (nama.trim().length < 3) {
    throw new Error("Nama lengkap minimal 3 karakter.");
  }
  if (!validasiWhatsApp(whatsapp)) {
    throw new Error("Nomor WhatsApp tidak valid. Gunakan format diawali 08 atau 628.");
  }
  if (!jenisLayanan) {
    throw new Error("Pilih jenis layanan terlebih dahulu.");
  }
  if (!ukuran || isNaN(parseFloat(ukuran)) || parseFloat(ukuran) <= 0) {
    throw new Error("Luas/Volume harus berupa angka positif.");
  }

  const formatEstimasi = `Rp ${Number(estimasi).toLocaleString('id-ID')}`;

  const teksPesan = `Halo 3 Putra Si 77, saya ingin memesan jasa las:\n\n` +
    `• Nama: ${nama.trim()}\n` +
    `• No. WA: ${whatsapp.trim()}\n` +
    `• Layanan: ${jenisLayanan}\n` +
    `• Estimasi Luas: ${ukuran} m²\n` +
    `• Estimasi Biaya: ${formatEstimasi}\n` +
    `• Catatan/Desain: ${catatan ? catatan.trim() : '-'}\n\n` +
    `Mohon info tindak lanjut dan jadwal survei lokasi. Terima kasih!`;

  return `https://wa.me/6285654509932?text=${encodeURIComponent(teksPesan)}`;
};
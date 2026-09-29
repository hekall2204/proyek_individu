import { tarifLayanan } from './data.js';

export const cariPesananByKode = (daftarPesanan, kodeTrx) => {
  if (!Array.isArray(daftarPesanan)) {
    throw new TypeError("Data pesanan harus berupa Array");
  }
  
  if (!kodeTrx || typeof kodeTrx !== "string") {
    throw new Error("Kode transaksi tidak valid");
  }

  const kodeClean = kodeTrx.trim().toUpperCase();
  const hasil = daftarPesanan.find(item => item.kodeTrx.toUpperCase() === kodeClean);

  if (!hasil) {
    throw new Error(`Pesanan dengan kode "${kodeTrx}" tidak ditemukan`);
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
  return hargaPerM2 * luas;
};

export const buatPesanWhatsApp = (dataForm) => {
  const { nama, whatsapp, jenisLayanan, ukuran, catatan } = dataForm;

  if (!nama || !whatsapp || !jenisLayanan || !ukuran) {
    throw new Error("Mohon lengkapi semua bidang formulir yang wajib diisi");
  }

  const teksPesan = `Halo 3 Putra Si 77, saya ingin memesan jasa las:\n\n` +
    `• Nama: ${nama}\n` +
    `• No. WA: ${whatsapp}\n` +
    `• Layanan: ${jenisLayanan}\n` +
    `• Ukuran: ${ukuran}\n` +
    `• Catatan/Desain: ${catatan || '-'}\n\n` +
    `Mohon info estimasi biaya dan waktunya. Terima kasih!`;

  return `https://wa.me/6285654509932?text=${encodeURIComponent(teksPesan)}`;
};
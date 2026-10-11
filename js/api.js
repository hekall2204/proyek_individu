// js/api.js

const BASE_URL = 'https://jsonplaceholder.typicode.com';

/**
 * Mengambil data dari REST API dengan Async/Await
 * Menangani state: Loading, Success, Empty, dan Error.
 */
export async function fetchMaterialProjects(endpointUrl, containerElement, statusElement) {
  // Pastikan statusElement ada sebelum memanipulasi DOM
  if (!statusElement) return null;

  // 1. LOADING STATE
  statusElement.innerHTML = `
    <div class="api-state loading" style="padding: 15px; text-align: center; background: #fef3c7; border-radius: 8px; margin-bottom: 15px;">
      <p>⏳ <strong>Memuat data dari server...</strong> Mohon tunggu sebentar.</p>
    </div>
  `;
  if (containerElement) containerElement.innerHTML = '';

  try {
    const response = await fetch(`${BASE_URL}/${endpointUrl}`);

    // Validasi Status Code HTTP (jika server merespons dengan error seperti 404/500)
    if (!response.ok) {
      throw new Error(`HTTP Error! Status Code: ${response.status} (${response.statusText})`);
    }

    const data = await response.json();

    // 2. EMPTY STATE
    if (!Array.isArray(data) || data.length === 0) {
      statusElement.innerHTML = `
        <div class="api-state empty" style="padding: 15px; text-align: center; background: #e2e8f0; border-radius: 8px; margin-bottom: 15px;">
          <p>⚠️ <strong>Data Kosong (Empty State):</strong> Belum ada data material atau proyek yang tersedia dari server.</p>
        </div>
      `;
      return [];
    }

    // 3. SUCCESS STATE
    statusElement.innerHTML = `
      <div class="api-state success" style="padding: 15px; text-align: center; background: #d1fae5; color: #065f46; border-radius: 8px; margin-bottom: 15px;">
        <p>✅ <strong>Berhasil (Success State):</strong> Data berhasil dimuat dari server (Status: ${response.status} OK).</p>
      </div>
    `;
    
    return data;

  } catch (error) {
    // 4. ERROR STATE (Menangkap error jaringan, offline, atau URL salah)
    statusElement.innerHTML = `
      <div class="api-state error" style="padding: 15px; text-align: center; background: #fee2e2; color: #991b1b; border-radius: 8px; margin-bottom: 15px;">
        <p>❌ <strong>Gagal (Error State):</strong> Terjadi kesalahan koneksi ke server. (${error.message})</p>
        <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 10px;">Coba Lagi</button>
      </div>
    `;
    console.error("Fetch API Error:", error);
    return null;
  }
}
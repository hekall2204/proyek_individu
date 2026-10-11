// js/main.js

import { dataPesanan, tarifLayanan } from './data.js';
import { 
  cariPesananByKode, 
  buatPesanWhatsApp,
  simpanRiwayatCek, 
  ambilRiwayatCek, 
  hitungEstimasiBiaya,
  validasiWhatsApp,
  validasiKodeTrx
} from './layanan.js';
import { fetchMaterialProjects } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. INISIALISASI VARIABEL & ELEMEN DOM ---
  const formPemesanan = document.getElementById('formPemesananWA');
  const formMonitoring = document.getElementById('formCekStatus');
  const inputKode = document.getElementById('kode_trx');
  const jenisLayananSelect = document.getElementById('jenis_layanan');
  const ukuranInput = document.getElementById('ukuran');
  const namaInput = document.getElementById('nama');
  const waInput = document.getElementById('whatsapp');

  // Mini Dashboard API Elements
  const btnLoadPosts = document.getElementById('btnLoadPosts');
  const btnLoadUsers = document.getElementById('btnLoadUsers');
  const apiStatusMessage = document.getElementById('apiStatusMessage');
  const apiDataGrid = document.getElementById('apiDataGrid');

  setupDynamicUI();

  // --- 2. HELPER ERROR HANDLING ---
  function showError(inputElement, errorElementId, message) {
    const errorContainer = document.getElementById(errorElementId);
    if (inputElement) {
      inputElement.setAttribute('aria-invalid', 'true');
      inputElement.classList.add('is-invalid');
    }
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = 'block';
    }
  }

  function clearError(inputElement, errorElementId) {
    const errorContainer = document.getElementById(errorElementId);
    if (inputElement) {
      inputElement.removeAttribute('aria-invalid');
      inputElement.classList.remove('is-invalid');
    }
    if (errorContainer) {
      errorContainer.textContent = '';
      errorContainer.style.display = 'none';
    }
  }

  // --- 3. REAL-TIME ESTIMASI BIAYA ---
  function updateEstimasi() {
    const jenis = jenisLayananSelect ? jenisLayananSelect.value : '';
    const volume = ukuranInput ? ukuranInput.value : '';
    const displayEstimasi = document.getElementById('estimasiDisplay');
    
    if (jenis && volume && !isNaN(volume) && parseFloat(volume) > 0) {
      const total = hitungEstimasiBiaya(jenis, volume);
      if (displayEstimasi) displayEstimasi.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    } else if (displayEstimasi) {
      displayEstimasi.textContent = 'Rp 0';
    }
  }

  if (jenisLayananSelect && ukuranInput) {
    jenisLayananSelect.addEventListener('change', () => {
      clearError(jenisLayananSelect, 'layananError');
      updateEstimasi();
    });
    
    ukuranInput.addEventListener('input', () => {
      clearError(ukuranInput, 'ukuranError');
      updateEstimasi();
    });
  }

  if (namaInput) {
    namaInput.addEventListener('input', () => clearError(namaInput, 'namaError'));
  }

  if (waInput) {
    waInput.addEventListener('input', () => clearError(waInput, 'whatsappError'));
  }

  if (inputKode) {
    inputKode.addEventListener('input', () => clearError(inputKode, 'kodeError'));
  }

  // --- 4. VALIDASI & SUBMIT FORM PEMESANAN ---
  if (formPemesanan) {
    formPemesanan.addEventListener('submit', (event) => {
      event.preventDefault();

      let isFormValid = true;
      let firstInvalidInput = null;

      // Validasi Nama
      const valNama = namaInput ? namaInput.value.trim() : '';
      if (!valNama) {
        showError(namaInput, 'namaError', 'Nama lengkap wajib diisi.');
        isFormValid = false;
        if (!firstInvalidInput) firstInvalidInput = namaInput;
      } else if (valNama.length < 3) {
        showError(namaInput, 'namaError', 'Nama lengkap minimal 3 karakter.');
        isFormValid = false;
        if (!firstInvalidInput) firstInvalidInput = namaInput;
      } else {
        clearError(namaInput, 'namaError');
      }

      // Validasi WhatsApp
      const valWA = waInput ? waInput.value.trim() : '';
      if (!valWA) {
        showError(waInput, 'whatsappError', 'Nomor WhatsApp wajib diisi.');
        isFormValid = false;
        if (!firstInvalidInput) firstInvalidInput = waInput;
      } else if (!validasiWhatsApp(valWA)) {
        showError(waInput, 'whatsappError', 'Format nomor WhatsApp tidak valid. Contoh: 08123456789 atau 628123456789');
        isFormValid = false;
        if (!firstInvalidInput) firstInvalidInput = waInput;
      } else {
        clearError(waInput, 'whatsappError');
      }

      // Validasi Jenis Layanan
      const valLayanan = jenisLayananSelect ? jenisLayananSelect.value : '';
      if (!valLayanan) {
        showError(jenisLayananSelect, 'layananError', 'Silakan pilih salah satu jenis layanan.');
        isFormValid = false;
        if (!firstInvalidInput) firstInvalidInput = jenisLayananSelect;
      } else {
        clearError(jenisLayananSelect, 'layananError');
      }

      // Validasi Ukuran/Volume
      const valUkuran = ukuranInput ? ukuranInput.value.trim() : '';
      if (!valUkuran) {
        showError(ukuranInput, 'ukuranError', 'Estimasi luas/volume wajib diisi.');
        isFormValid = false;
        if (!firstInvalidInput) firstInvalidInput = ukuranInput;
      } else if (isNaN(valUkuran) || parseFloat(valUkuran) <= 0) {
        showError(ukuranInput, 'ukuranError', 'Masukkan nilai luas berupa angka lebih besar dari 0.');
        isFormValid = false;
        if (!firstInvalidInput) firstInvalidInput = ukuranInput;
      } else if (parseFloat(valUkuran) > 500) {
        showError(ukuranInput, 'ukuranError', 'Estimasi luas maksimal 500 m² untuk pengajuan via web.');
        isFormValid = false;
        if (!firstInvalidInput) firstInvalidInput = ukuranInput;
      } else {
        clearError(ukuranInput, 'ukuranError');
      }

      if (!isFormValid) {
        if (firstInvalidInput) firstInvalidInput.focus();
        const summaryAlert = document.getElementById('formSummaryAlert');
        if (summaryAlert) summaryAlert.textContent = "Pengiriman formulir gagal.";
        return;
      }

      try {
        const totalEstimasi = hitungEstimasiBiaya(valLayanan, valUkuran);
        const formData = {
          nama: valNama,
          whatsapp: valWA,
          jenisLayanan: valLayanan,
          ukuran: valUkuran,
          catatan: document.getElementById('catatan') ? document.getElementById('catatan').value : '',
          estimasi: totalEstimasi
        };

        const urlWA = buatPesanWhatsApp(formData);
        
        const summaryAlert = document.getElementById('formSummaryAlert');
        if (summaryAlert) summaryAlert.textContent = "Formulir berhasil diproses. Membuka tautan WhatsApp...";

        window.open(urlWA, '_blank');
      } catch (error) {
        showError(namaInput, 'namaError', error.message);
      }
    });
  }

  // --- 5. FORM MONITORING & TRACKING STATUS ---
  if (formMonitoring) {
    renderRiwayatBadges();

    formMonitoring.addEventListener('submit', (event) => {
      event.preventDefault();
      const valKode = inputKode ? inputKode.value.trim() : '';

      if (!valKode) {
        showError(inputKode, 'kodeError', 'Kode transaksi tidak boleh kosong.');
        if (inputKode) inputKode.focus();
        return;
      }

      if (!validasiKodeTrx(valKode)) {
        showError(inputKode, 'kodeError', 'Format kode salah. Gunakan format TRX-XXXX (contoh: TRX-7701).');
        if (inputKode) inputKode.focus();
        return;
      }

      clearError(inputKode, 'kodeError');
      prosesPencarian(valKode);
    });

    const riwayatContainer = document.getElementById('riwayatContainer');
    if (riwayatContainer) {
      riwayatContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('badge-history')) {
          const kode = e.target.textContent;
          if (inputKode) {
            inputKode.value = kode;
            clearError(inputKode, 'kodeError');
          }
          prosesPencarian(kode);
        }
      });
    }
  }

  function prosesPencarian(kode) {
    const statusResultDiv = document.getElementById('statusResult');
    try {
      const pesanan = cariPesananByKode(dataPesanan, kode);

      simpanRiwayatCek(kode);
      renderRiwayatBadges();

      document.getElementById('resNama').textContent = pesanan.nama;
      document.getElementById('resKode').textContent = pesanan.kodeTrx;
      document.getElementById('resStatus').textContent = pesanan.statusText;

      const timelineSteps = document.querySelectorAll('.tracking-timeline .timeline-step');
      timelineSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('completed', 'active');

        if (stepNumber < pesanan.statusStep) {
          step.classList.add('completed');
        } else if (stepNumber === pesanan.statusStep) {
          step.classList.add('active');
        }
      });

      if (statusResultDiv) {
        statusResultDiv.style.display = 'block';
        statusResultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (error) {
      if (statusResultDiv) statusResultDiv.style.display = 'none';
      showError(inputKode, 'kodeError', error.message);
      if (inputKode) inputKode.focus();
    }
  }

  function renderRiwayatBadges() {
    const riwayatContainer = document.getElementById('riwayatContainer');
    const riwayat = ambilRiwayatCek();

    if (!riwayatContainer) return;

    if (riwayat.length === 0) {
      riwayatContainer.innerHTML = '';
      return;
    }

    riwayatContainer.innerHTML = `
      <small style="display:block; margin-bottom:5px; font-weight:bold;">Riwayat Pencarian Terakhir:</small>
      ${riwayat.map(kode => `<button type="button" class="badge-history" style="cursor:pointer; margin-right:5px; padding:4px 8px; background:#e2e8f0; border:1px solid #cbd5e1; border-radius:4px; font-size:12px; display:inline-block; margin-bottom:4px;">${kode}</button>`).join('')}
    `;
  }

  function setupDynamicUI() {
    if (inputKode && formMonitoring) {
      const riwayatDiv = document.createElement('div');
      riwayatDiv.id = 'riwayatContainer';
      riwayatDiv.style.marginTop = '10px';
      formMonitoring.appendChild(riwayatDiv);
    }
  }

  // --- 6. MINI DASHBOARD REST API (DENGAN LIMIT 3 & BAHASA INDONESIA) ---
  const logAktivitasIndo = [
    { title: "Pengelasan Rangka Pagar Minimalis", body: "Proses pemotongan dan perakitan besi hollow galvanis tahan karat area Nunukan." },
    { title: "Fabrikasi Kanopi Garasi Rumah", body: "Pemasangan rangka besi kokoh dan atap spandek lapis peredam suara." },
    { title: "Pembuatan Teralis Jendela Modern", body: "Pengelasan presisi teralis motif minimalis untuk keamanan hunian pelanggan." }
  ];

  if (btnLoadPosts && btnLoadUsers) {
    btnLoadPosts.addEventListener('click', async () => {
      // Menggunakan _limit=3 agar pas 3 item
      const posts = await fetchMaterialProjects('posts?_limit=3', apiDataGrid, apiStatusMessage);
      
      if (posts) {
        apiDataGrid.innerHTML = posts.map((post, index) => {
          const item = logAktivitasIndo[index] || { title: post.title, body: post.body };

          return `
            <article class="card">
              <div class="card-body">
                <span class="badge badge-warning">ID: TRX-API-${post.id}</span>
                <h3>${item.title}</h3>
                <p>${item.body}</p>
              </div>
            </article>
          `;
        }).join('');
      }
    });

    btnLoadUsers.addEventListener('click', async () => {
      const users = await fetchMaterialProjects('users?_limit=3', apiDataGrid, apiStatusMessage);
      
      if (users) {
        apiDataGrid.innerHTML = users.map(user => `
          <article class="card">
            <div class="card-body">
              <span class="badge badge-warning">Vendor / Mitra</span>
              <h3>${user.name}</h3>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Kota:</strong> ${user.address.city}</p>
            </div>
          </article>
        `).join('');
      }
    });
  }
});
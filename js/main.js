import { dataPesanan } from './data.js';
import { 
  cariPesananByKode, 
  buatPesanWhatsApp,
  simpanRiwayatCek, 
  ambilRiwayatCek, 
  hitungEstimasiBiaya
} from './layanan.js';

document.addEventListener('DOMContentLoaded', () => {
  const formPemesanan = document.getElementById('formPemesananWA');
  const formMonitoring = document.getElementById('formCekStatus');
  const inputKode = document.getElementById('kode_trx');
  const jenisLayananSelect = document.getElementById('jenis_layanan');
  const ukuranInput = document.getElementById('ukuran');

  setupDynamicUI();

  function updateEstimasi() {
    const jenis = jenisLayananSelect.value;
    const volume = ukuranInput.value;
    const displayEstimasi = document.getElementById('estimasiDisplay');
    
    if (jenis && volume && displayEstimasi) {
      const total = hitungEstimasiBiaya(jenis, volume);
      displayEstimasi.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    } else if (displayEstimasi) {
      displayEstimasi.textContent = 'Rp 0';
    }
  }

  if (jenisLayananSelect && ukuranInput) {
    jenisLayananSelect.addEventListener('change', updateEstimasi);
    ukuranInput.addEventListener('input', updateEstimasi);
  }

  if (formPemesanan) {
    formPemesanan.addEventListener('submit', (event) => {
      event.preventDefault();
      
      try {
        const jenis = jenisLayananSelect ? jenisLayananSelect.value : '';
        const volume = ukuranInput ? ukuranInput.value : '';
        const totalEstimasi = hitungEstimasiBiaya(jenis, volume);

        const formData = {
          nama: document.getElementById('nama').value,
          whatsapp: document.getElementById('whatsapp').value,
          jenisLayanan: jenis,
          ukuran: `${volume} m² / unit`,
          catatan: document.getElementById('catatan').value,
          estimasi: totalEstimasi
        };

        const urlWA = buatPesanWhatsApp(formData);
        window.open(urlWA, '_blank');
      } catch (error) {
        alert(error.message);
      }
    });
  }

  if (formMonitoring) {
    renderRiwayatBadges();

    formMonitoring.addEventListener('submit', (event) => {
      event.preventDefault();
      if (inputKode) {
        prosesPencarian(inputKode.value);
      }
    });

    const riwayatContainer = document.getElementById('riwayatContainer');
    if (riwayatContainer) {
      riwayatContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('badge-history')) {
          const kode = e.target.textContent;
          if (inputKode) inputKode.value = kode;
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

      if (statusResultDiv) statusResultDiv.style.display = 'block';
    } catch (error) {
      if (statusResultDiv) statusResultDiv.style.display = 'none';
      alert(error.message);
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
      ${riwayat.map(kode => `<span class="badge-history" style="cursor:pointer; margin-right:5px; padding:4px 8px; background:#e0e0e0; border-radius:4px; font-size:12px; display:inline-block; margin-bottom:4px;">${kode}</span>`).join('')}
    `;
  }

  function setupDynamicUI() {
    if (ukuranInput) {
      ukuranInput.placeholder = "Masukkan estimasi luas (contoh: 12)";
      ukuranInput.type = "number";
      ukuranInput.min = "1";
      
      const labelUkuran = document.querySelector('label[for="ukuran"]');
      if (labelUkuran) labelUkuran.textContent = "Estimasi Luas / Volume (m²)";

      const estimasiDiv = document.createElement('div');
      estimasiDiv.className = 'form-group';
      estimasiDiv.innerHTML = `
        <label>Estimasi Biaya Awal:</label>
        <h3 id="estimasiDisplay" style="color: #2e7d32; margin: 5px 0;">Rp 0</h3>
      `;
      ukuranInput.parentElement.after(estimasiDiv);
    }

    if (inputKode && formMonitoring) {
      const riwayatDiv = document.createElement('div');
      riwayatDiv.id = 'riwayatContainer';
      riwayatDiv.style.marginTop = '10px';
      formMonitoring.appendChild(riwayatDiv);
    }
  }
});
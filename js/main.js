import { dataPesanan } from './data.js';
import { cariPesananByKode, buatPesanWhatsApp } from './layanan.js';

document.addEventListener('DOMContentLoaded', () => {
  const formPemesanan = document.getElementById('formPemesananWA');
  const formMonitoring = document.getElementById('formCekStatus');

  if (formPemesanan) {
    formPemesanan.addEventListener('submit', (event) => {
      event.preventDefault();
      
      try {
        const formData = {
          nama: document.getElementById('nama').value,
          whatsapp: document.getElementById('whatsapp').value,
          jenisLayanan: document.getElementById('jenis_layanan').value,
          ukuran: document.getElementById('ukuran').value,
          catatan: document.getElementById('catatan').value
        };

        const urlWA = buatPesanWhatsApp(formData);
        window.open(urlWA, '_blank');
      } catch (error) {
        alert(error.message);
      }
    });
  }

  if (formMonitoring) {
    formMonitoring.addEventListener('submit', (event) => {
      event.preventDefault();

      const inputKode = document.getElementById('kode_trx').value;
      const statusResultDiv = document.getElementById('statusResult');

      try {
        const pesanan = cariPesananByKode(dataPesanan, inputKode);

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

        statusResultDiv.style.display = 'block';
      } catch (error) {
        statusResultDiv.style.display = 'none';
        alert(error.message);
      }
    });
  }
});
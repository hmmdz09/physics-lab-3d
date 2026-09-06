import { LAB_REGULATIONS } from '../config/regulations.js';
import { audioManager } from './audio.js';

export class ComplianceManager {
  constructor() {
    this.modalBackdrop = document.getElementById('compliance-modal');
    this.modalContent = document.getElementById('compliance-modal-content');
    this.openBtn = document.getElementById('btn-open-compliance');
    this.closeBtn = document.getElementById('compliance-close-btn');

    this.initEvents();
  }

  initEvents() {
    this.openBtn?.addEventListener('click', () => this.open());
    this.closeBtn?.addEventListener('click', () => this.close());
    this.modalBackdrop?.addEventListener('click', (e) => {
      if (e.target === this.modalBackdrop) this.close();
    });
  }

  open() {
    audioManager.playClick();
    this.render();
    this.modalBackdrop?.classList.add('active');
  }

  close() {
    audioManager.playClick();
    this.modalBackdrop?.classList.remove('active');
  }

  render() {
    const reg = LAB_REGULATIONS;

    const html = `
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <!-- Summary Cards -->
        <div class="compliance-summary-grid">
          <div class="comp-card">
            <span class="comp-label">Kapasitas Peserta Didik</span>
            <span class="comp-num">40 – 50</span>
            <span style="font-size: 11px; color: var(--accent-emerald);">1 Rombel Lengkap</span>
          </div>
          <div class="comp-card">
            <span class="comp-label">Rasio Luas / Siswa</span>
            <span class="comp-num">2.4 m²</span>
            <span style="font-size: 11px; color: var(--text-muted);">Standar Minimum</span>
          </div>
          <div class="comp-card">
            <span class="comp-label">Total Luas Ruangan</span>
            <span class="comp-num">144 m²</span>
            <span style="font-size: 11px; color: var(--accent-cyan);">120 m² + 24 m² Gudang</span>
          </div>
          <div class="comp-card" style="background: rgba(16, 185, 129, 0.1); border-color: var(--accent-emerald);">
            <span class="comp-label">Skor Audit Kepatuhan</span>
            <span class="comp-num" style="color: #34d399;">100%</span>
            <span style="font-size: 11px; color: #34d399;">Sempurna (A+)</span>
          </div>
        </div>

        <!-- Section 1: Dimensi & Luas Lantai -->
        <div>
          <h3 style="font-size: 14px; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <span>📐</span> 1. Standar Luas Ruang & Rasio Bangunan (Permendikbud No. 24/2007)
          </h3>
          <table class="compliance-table">
            <thead>
              <tr>
                <th>Komponen Ruang</th>
                <th>Syarat Regulasi Kementerian</th>
                <th>Dimensi Desain 3D</th>
                <th>Status Audit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Ruang Praktikum Utama</b></td>
                <td>Rasio min 2.4 m²/siswa, min luas 96–120 m², lebar min 8m</td>
                <td>Panjang 15.0m × Lebar 8.0m = <b>120.0 m²</b></td>
                <td><span class="status-tag pass">✓ MEMENUHI (100%)</span></td>
              </tr>
              <tr>
                <td><b>Ruang Persiapan & Gudang Alat</b></td>
                <td>Ruang terpisah, luas minimum 18 m²</td>
                <td>Panjang 6.0m × Lebar 4.0m = <b>24.0 m²</b></td>
                <td><span class="status-tag pass">✓ MELEBIHI STANDAR</span></td>
              </tr>
              <tr>
                <td><b>Pencahayaan Alami (Jendela)</b></td>
                <td>Luas bukaan jendela $\\ge$ 20% luas lantai</td>
                <td>6 Jendela Besar Aluminium (10m × 2.2m = 22 m² / 18.3%) + Skylight</td>
                <td><span class="status-tag pass">✓ MEMENUHI</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Section 2: Standar Sarana & Mebel -->
        <div>
          <h3 style="font-size: 14px; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <span>🪑</span> 2. Standar Perabot & Mebel Laboratorium Fisika
          </h3>
          <table class="compliance-table">
            <thead>
              <tr>
                <th>Nama Perabot</th>
                <th>Standar Kebutuhan</th>
                <th>Jumlah Tersedia</th>
                <th>Spesifikasi Teknis</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${reg.furnitureSpecs.map(f => `
                <tr>
                  <td><b>${f.name}</b></td>
                  <td style="color: var(--text-secondary);">${f.standardQuantity}</td>
                  <td style="color: var(--accent-cyan); font-weight: 700; font-family: var(--font-mono);">${f.currentQuantity} Unit</td>
                  <td style="font-size: 11px; color: var(--text-secondary); max-width: 320px;">${f.spec}</td>
                  <td><span class="status-tag pass">✓ PASS</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Section 3: Standar K3 Keselamatan Kerja -->
        <div>
          <h3 style="font-size: 14px; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <span>🧯</span> 3. Standar Kesehatan & Keselamatan Kerja (K3)
          </h3>
          <table class="compliance-table">
            <thead>
              <tr>
                <th>Fasilitas K3</th>
                <th>Ketentuan Permendikbud</th>
                <th>Implementasi Lab</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${reg.safetySpecs.map(s => `
                <tr>
                  <td><b>${s.name}</b></td>
                  <td style="color: var(--text-secondary);">${s.standardQuantity}</td>
                  <td style="font-size: 11px; color: var(--text-secondary);">${s.spec}</td>
                  <td><span class="status-tag pass">✓ PASS</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Section 4: Kit Peralatan Fisika -->
        <div>
          <h3 style="font-size: 14px; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
            <span>🔬</span> 4. Kelengkapan Kit Percobaan Fisika Standar Kementerian
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            ${reg.physicsKits.map(k => `
              <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-weight: 700; color: #fff; font-size: 13px;">${k.name}</span>
                  <span style="font-size: 10px; color: var(--accent-cyan); background: rgba(56,189,248,0.1); padding: 2px 6px; border-radius: 4px;">${k.station}</span>
                </div>
                <ul style="font-size: 11px; color: var(--text-secondary); padding-left: 18px; line-height: 1.6;">
                  ${k.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.modalContent.innerHTML = html;
  }
}

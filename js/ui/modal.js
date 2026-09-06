import { audioManager } from './audio.js';

export class ModalManager {
  constructor() {
    this.modalBackdrop = document.getElementById('inspector-modal');
    this.modalTitle = document.getElementById('modal-station-name');
    this.modalIcon = document.getElementById('modal-station-icon');
    this.modalCategory = document.getElementById('modal-station-category');
    this.modalContent = document.getElementById('modal-station-content');
    this.closeBtn = document.getElementById('modal-close-btn');

    this.activeSimInterval = null;

    this.initEvents();
  }

  initEvents() {
    this.closeBtn?.addEventListener('click', () => this.close());
    this.modalBackdrop?.addEventListener('click', (e) => {
      if (e.target === this.modalBackdrop) this.close();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) this.close();
    });
  }

  isOpen() {
    return this.modalBackdrop?.classList.contains('active');
  }

  close() {
    audioManager.playClick();
    this.modalBackdrop?.classList.remove('active');
    if (this.activeSimInterval) {
      clearInterval(this.activeSimInterval);
      this.activeSimInterval = null;
    }
  }

  open(data) {
    if (!data) return;
    audioManager.playClick();

    this.modalTitle.textContent = data.name || data.title || "Detail Stasiun";
    this.modalCategory.textContent = data.category || data.type || "Fasilitas Lab";

    let icon = "🔬";
    if (data.id === 'oscilloscope') icon = "📈";
    else if (data.id === 'optics') icon = "💡";
    else if (data.id === 'mechanics') icon = "⚙️";
    else if (data.id === 'thermo') icon = "🔥";
    else if (data.id === 'apar') icon = "🧯";
    else if (data.id === 'p3k') icon = "🩹";
    else if (data.id === 'eyewash') icon = "🚿";
    else if (data.id === 'emergency_stop') icon = "🚨";
    else if (data.type === 'student_table') icon = "🪑";
    else if (data.type === 'demo_station') icon = "👨‍🏫";
    else if (data.type === 'storage_cabinet') icon = "🗄️";

    this.modalIcon.textContent = icon;

    // Build modal body according to data type
    this.modalContent.innerHTML = '';

    if (data.id === 'oscilloscope') {
      this.buildOscilloscopeModal(data);
    } else if (data.id === 'optics') {
      this.buildOpticsModal(data);
    } else if (data.id === 'emergency_stop') {
      this.buildEmergencyStopModal(data);
    } else {
      this.buildStandardModal(data);
    }

    this.modalBackdrop?.classList.add('active');
  }

  buildStandardModal(data) {
    const html = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px;">
          <h4 style="color: var(--accent-cyan); font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Deskripsi & Fungsi</h4>
          <p style="font-size: 14px; line-height: 1.6; color: var(--text-primary);">${data.description || data.specs || 'Sarana prasarana penunjang praktikum fisika sekolah.'}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 12px; padding: 14px;">
            <span style="font-size: 11px; font-weight: 700; color: #34d399; text-transform: uppercase;">Kapasitas / Standar</span>
            <div style="font-size: 14px; font-weight: 700; color: #fff; margin-top: 4px;">${data.capacity || 'Sesuai Rombel 40-50 Siswa'}</div>
          </div>
          <div style="background: rgba(56, 189, 248, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 12px; padding: 14px;">
            <span style="font-size: 11px; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase;">Status Regulasi</span>
            <div style="font-size: 14px; font-weight: 700; color: #fff; margin-top: 4px;">100% Memenuhi Standar</div>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.02); border-left: 3px solid var(--accent-amber); padding: 12px 16px; border-radius: 0 8px 8px 0;">
          <div style="font-size: 11px; font-weight: 700; color: var(--accent-amber); text-transform: uppercase;">Rujukan Regulasi Kementerian</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            ${data.regulationCitation || 'Permendikbud No. 24 Tahun 2007 (Standar Sarana dan Prasarana SMA/MA) Lampiran Ruang Laboratorium Fisika.'}
          </div>
        </div>
      </div>
    `;
    this.modalContent.innerHTML = html;
  }

  buildOscilloscopeModal(data) {
    const html = `
      <div style="display: flex; flex-direction: column; gap: 18px;">
        <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5;">
          ${data.description}
        </p>

        <!-- Interactive Virtual Oscilloscope Screen -->
        <div class="osc-tuner-container">
          <canvas id="osc-canvas-preview" width="600" height="180"></canvas>
          
          <div class="osc-controls-row">
            <div class="osc-slider-group">
              <label>Frekuensi: <span id="val-freq">250 Hz</span></label>
              <input type="range" id="input-freq" min="50" max="1000" step="10" value="250">
            </div>
            <div class="osc-slider-group">
              <label>Amplitudo: <span id="val-amp">5.0 V</span></label>
              <input type="range" id="input-amp" min="1" max="10" step="0.5" value="5.0">
            </div>
            <div class="osc-slider-group">
              <label>Bentuk Gelombang</label>
              <select id="select-wave" style="background: #064e3b; color: #fff; border: 1px solid #10b981; padding: 4px 8px; border-radius: 6px; font-family: monospace;">
                <option value="sine">Sinusoidal</option>
                <option value="square">Kotak (Square)</option>
                <option value="triangle">Segitiga (Triangle)</option>
              </select>
            </div>
          </div>

          <button id="btn-play-tone" class="btn-glass" style="background: rgba(16, 185, 129, 0.2); border-color: #10b981; color: #34d399; width: 100%; justify-content: center;">
            🔊 Dengarkan Frekuensi Suara Gelombang (Web Audio)
          </button>
        </div>

        <div style="background: rgba(255,255,255,0.02); border-left: 3px solid var(--accent-cyan); padding: 12px 16px; border-radius: 0 8px 8px 0;">
          <div style="font-size: 11px; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase;">Standar Sarpras Kemendikbud</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            Permendikbud No. 24/2007 mensyaratkan setiap laboratorium fisika dilengkapi minimal 1 set Osiloskop 20–50 MHz dan Generator Frekuensi Audio.
          </div>
        </div>
      </div>
    `;

    this.modalContent.innerHTML = html;

    // Hook up real-time canvas simulator in modal
    const canvas = document.getElementById('osc-canvas-preview');
    const ctx = canvas?.getContext('2d');
    const inFreq = document.getElementById('input-freq');
    const inAmp = document.getElementById('input-amp');
    const selWave = document.getElementById('select-wave');
    const valFreq = document.getElementById('val-freq');
    const valAmp = document.getElementById('val-amp');
    const btnTone = document.getElementById('btn-play-tone');

    let simTime = 0;

    btnTone?.addEventListener('click', () => {
      const f = parseFloat(inFreq.value);
      audioManager.playOscilloscopeTone(f);
    });

    inFreq?.addEventListener('input', () => {
      valFreq.textContent = `${inFreq.value} Hz`;
    });
    inAmp?.addEventListener('input', () => {
      valAmp.textContent = `${parseFloat(inAmp.value).toFixed(1)} V`;
    });

    this.activeSimInterval = setInterval(() => {
      if (!ctx || !canvas) return;
      simTime += 0.05;
      const f = parseFloat(inFreq.value) * 0.01;
      const a = parseFloat(inAmp.value) * 12;
      const type = selWave.value;

      ctx.fillStyle = '#01130d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = '#064e3b';
      ctx.lineWidth = 1;
      for (let x = 0; x <= canvas.width; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y <= canvas.height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Waveform
      ctx.strokeStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 3;
      ctx.beginPath();

      const midY = canvas.height / 2;
      for (let x = 0; x < canvas.width; x++) {
        let y = midY;
        if (type === 'sine') {
          y = midY + Math.sin(x * f * 0.1 + simTime) * a;
        } else if (type === 'square') {
          y = midY + (Math.sin(x * f * 0.1 + simTime) > 0 ? a : -a);
        } else if (type === 'triangle') {
          y = midY + (Math.asin(Math.sin(x * f * 0.1 + simTime)) * (2 / Math.PI)) * a;
        }
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }, 30);
  }

  buildOpticsModal(data) {
    const html = `
      <div style="display: flex; flex-direction: column; gap: 18px;">
        <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5;">
          ${data.description}
        </p>

        <div style="background: #0c1527; border: 1px solid #1e40af; border-radius: 12px; padding: 18px; display: flex; flex-direction: column; gap: 12px;">
          <h4 style="color: #60a5fa; font-size: 13px; text-transform: uppercase;">Simulasi Hukum Snellius Pembiasan Cahaya</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div>
              <label style="font-size: 12px; color: var(--text-secondary);">Sudut Datang (θ₁): <b id="val-theta1" style="color: #fff;">45°</b></label>
              <input type="range" id="slider-theta1" min="0" max="85" value="45" style="width: 100%; accent-color: var(--accent-cyan); margin-top: 6px;">
            </div>
            <div>
              <label style="font-size: 12px; color: var(--text-secondary);">Medium Pembias: <b id="val-medium" style="color: #fff;">Kaca (n = 1.52)</b></label>
              <select id="select-medium" style="width: 100%; background: #1e293b; color: #fff; border: 1px solid #38bdf8; padding: 6px; border-radius: 6px; margin-top: 6px;">
                <option value="1.33">Air (n = 1.33)</option>
                <option value="1.52" selected>Kaca Flinta (n = 1.52)</option>
                <option value="2.42">Berlian (n = 2.42)</option>
              </select>
            </div>
          </div>

          <div style="background: rgba(0,0,0,0.4); padding: 12px; border-radius: 8px; font-family: monospace; font-size: 13px; color: #38bdf8; display: flex; justify-content: space-between;">
            <span>Rumus: n₁·sin(θ₁) = n₂·sin(θ₂)</span>
            <span>Sudut Bias (θ₂): <b id="val-theta2" style="color: #34d399;">27.7°</b></span>
          </div>

          <button id="btn-fire-laser" class="btn-glass" style="background: rgba(220, 38, 38, 0.2); border-color: #ef4444; color: #f87171; justify-content: center;">
            🔴 Tembakkan Sinar Laser Merah (SFX)
          </button>
        </div>
      </div>
    `;

    this.modalContent.innerHTML = html;

    const slider = document.getElementById('slider-theta1');
    const select = document.getElementById('select-medium');
    const valT1 = document.getElementById('val-theta1');
    const valT2 = document.getElementById('val-theta2');
    const btnLaser = document.getElementById('btn-fire-laser');

    btnLaser?.addEventListener('click', () => {
      audioManager.playLaserHum();
    });

    const updateSnellius = () => {
      const theta1Deg = parseFloat(slider.value);
      const n2 = parseFloat(select.value);
      valT1.textContent = `${theta1Deg}°`;

      const theta1Rad = (theta1Deg * Math.PI) / 180;
      const sinTheta2 = (1.0 * Math.sin(theta1Rad)) / n2;
      const theta2Deg = (Math.asin(sinTheta2) * 180) / Math.PI;

      valT2.textContent = `${theta2Deg.toFixed(1)}°`;
    };

    slider?.addEventListener('input', updateSnellius);
    select?.addEventListener('change', updateSnellius);
  }

  buildEmergencyStopModal(data) {
    const html = `
      <div style="display: flex; flex-direction: column; gap: 18px;">
        <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 12px; padding: 18px; text-align: center;">
          <h3 style="color: #ef4444; font-size: 18px; margin-bottom: 8px;">🚨 SAKLAR PEMUTUS DAYA SENTRAL LABORATORIUM</h3>
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; max-width: 550px; margin: 0 auto 16px;">
            Tombol ini memutus aliran listrik AC 220V dan catu daya DC ke seluruh 10 meja praktikum siswa (50 peserta didik) secara serentak bila terjadi insiden darurat sengatan listrik atau kebakaran.
          </p>

          <button id="btn-trigger-estop" style="background: linear-gradient(135deg, #ef4444, #b91c1c); border: 2px solid #f87171; color: #fff; padding: 12px 28px; border-radius: 30px; font-weight: 800; font-size: 14px; cursor: pointer; box-shadow: 0 0 25px rgba(239, 68, 68, 0.5); transition: all 0.2s;">
            🛑 TEKAN TOMBOL E-STOP (UJI DRILL K3)
          </button>
          <div id="estop-status-text" style="font-size: 12px; color: #34d399; margin-top: 10px; font-weight: 600;">
            Status Instalasi: NORMAL & TERHUBUNG
          </div>
        </div>
      </div>
    `;

    this.modalContent.innerHTML = html;

    const btnEstop = document.getElementById('btn-trigger-estop');
    const statusText = document.getElementById('estop-status-text');
    let isOff = false;

    btnEstop?.addEventListener('click', () => {
      isOff = !isOff;
      if (isOff) {
        audioManager.playEmergencyAlarm();
        btnEstop.style.background = '#475569';
        btnEstop.textContent = '🔄 RESET DAYA LISTRIK LAB';
        statusText.style.color = '#ef4444';
        statusText.textContent = '⚠️ STATUS: DAYA LISTRIK DISELURUH MEJA SISWA TERPUTUS (TRIPPED)';
      } else {
        audioManager.playClick();
        btnEstop.style.background = 'linear-gradient(135deg, #ef4444, #b91c1c)';
        btnEstop.textContent = '🛑 TEKAN TOMBOL E-STOP (UJI DRILL K3)';
        statusText.style.color = '#34d399';
        statusText.textContent = 'Status Instalasi: NORMAL & TERHUBUNG';
      }
    });
  }
}

import * as THREE from 'three';
import { EngineScene } from './engine/scene.js';
import { LightingSystem } from './engine/lighting.js';
import { ControllerManager } from './engine/controls.js';
import { RoomBuilder } from './world/room.js';
import { FurnitureBuilder } from './world/furniture.js';
import { EquipmentBuilder } from './world/equipment.js';
import { SafetyBuilder } from './world/safety.js';
import { MarkerManager } from './world/markers.js';
import { ModalManager } from './ui/modal.js';
import { ComplianceManager } from './ui/compliance.js';
import { HudManager } from './ui/hud.js';
import { audioManager } from './ui/audio.js';

class PhysicsLabApplication {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this._prevTime = performance.now();
    this._frameCount = 0;
    this.currentHoverData = null;

    // Show loading overlay
    this._showLoading(true);

    try {
      this.init();
      this._showLoading(false);
    } catch (err) {
      console.error('[PhysicsLab] Init failed:', err);
      this._showError(err.message || String(err));
    }
  }

  _showLoading(visible) {
    const el = document.getElementById('loading-overlay');
    if (el) el.style.display = visible ? 'flex' : 'none';
  }

  _showError(msg) {
    this._showLoading(false);
    const div = document.createElement('div');
    div.style.cssText =
      'position:fixed;inset:0;background:#0a0f1d;display:flex;flex-direction:column;' +
      'align-items:center;justify-content:center;z-index:9999;color:#fff;font-family:monospace;padding:2rem;';
    div.innerHTML = `
      <div style="font-size:2.5rem;margin-bottom:1rem">⚠️</div>
      <div style="font-size:1.1rem;color:#ef4444;margin-bottom:.5rem">Gagal memuat scene 3D</div>
      <div style="font-size:.8rem;color:#94a3b8;max-width:600px;text-align:center">${msg}</div>
      <button onclick="location.reload()" style="margin-top:1.5rem;padding:.6rem 1.5rem;
        background:#2563eb;color:#fff;border:none;border-radius:.5rem;cursor:pointer;font-size:1rem">
        🔄 Coba Lagi
      </button>`;
    document.body.appendChild(div);
  }

  init() {
    this.engine = new EngineScene(this.canvas);
    this.lighting = new LightingSystem(this.engine.scene);
    this.controls = new ControllerManager(this.engine.camera, this.canvas, this.engine.scene);

    // Build world — each wrapped so one failure doesn't kill everything
    this._safeRun('RoomBuilder',      () => new RoomBuilder(this.engine.scene).build());
    this.furniture = this._safeRun('FurnitureBuilder', () => {
      const f = new FurnitureBuilder(this.engine.scene, this.controls);
      f.build(); return f;
    });
    this.equipment = this._safeRun('EquipmentBuilder', () => {
      const e = new EquipmentBuilder(this.engine.scene);
      e.build(); return e;
    });
    this._safeRun('SafetyBuilder',    () => new SafetyBuilder(this.engine.scene).build());

    // Markers & UI
    this.markers = new MarkerManager(this.engine.scene, this.engine.camera);
    this._setupHotspots();

    this.modal      = new ModalManager();
    this.compliance = new ComplianceManager();
    this.hud        = new HudManager(this.controls, this.lighting, this.modal);

    this._setupFpsCounter();
    this._initInteraction();
    this._startProximityCheck();
    this.animate();
  }

  _safeRun(name, fn) {
    try { return fn(); }
    catch (e) { console.warn(`[PhysicsLab] ${name} error:`, e); return null; }
  }

  _setupHotspots() {
    const M = (id, title, pos, data) => this.markers.addMarker(id, title, pos, data);
    M('demo',        'Meja Demo Guru',        {x:0,    y:1.12,z:-5.8}, {type:'demo_station', name:'Meja Demonstrasi Guru', capacity:'Instruktur', specs:'Meja demo 2.8m di atas panggung, instalasi listrik sentral.'});
    M('mechanics',   'Kit Mekanika',           {x:-2.0, y:1.12,z:-3.8}, {id:'mechanics',  type:'equipment', name:'Rel Dinamika & Ticker Timer',  category:'Kit Mekanika', description:'Eksperimen Hukum II Newton F=ma, GLB, GLBB dengan pita ketik 50Hz.'});
    M('oscilloscope','Osiloskop & Listrik',    {x:-2.0, y:1.12,z:1.9 }, {id:'oscilloscope',type:'equipment', name:'Osiloskop Digital Dual Channel',category:'Kit Listrik', description:'Visualisasi gelombang AC/DC, pengukuran frekuensi dan Vp-p.'});
    M('optics',      'Bangku Optik & Laser',   {x:-2.0, y:1.12,z:3.8 }, {id:'optics',     type:'equipment', name:'Bangku Optik & Percobaan Prisma',category:'Kit Optik', description:'Pembiasan Snellius, dispersi cahaya prisma, sudut deviasi minimum.'});
    M('thermo',      'Kalorimeter Joule',      {x:2.0,  y:1.12,z:3.8 }, {id:'thermo',     type:'equipment', name:'Kalorimeter Joule & Termofisika', category:'Kit Termofisika', description:'Asas Black, kalor jenis tembaga/aluminium/kuningan.'});
    M('prep',        'Ruang Persiapan',         {x:-7.5, y:1.12,z:0   }, {type:'storage_cabinet', name:'Ruang Persiapan Guru', capacity:'24 m²', specs:'4 lemari kaca terkunci untuk kit Mekanika, Optik, Listrik, Termofisika.'});
    M('apar',        'Titik K3 & APAR',         {x:3.2,  y:1.4, z:7.0 }, {id:'apar', type:'safety', name:'APAR ABC 6kg', category:'K3 Wajib', description:'Tabung pemadam serbuk kimia kering untuk kebakaran listrik dan bahan kimia.'});
    M('estop',       'Saklar Darurat Listrik',  {x:3.2,  y:1.5, z:-7.2}, {id:'emergency_stop', type:'safety', name:'Master Emergency Power Cut-off', category:'Proteksi Kelistrikan', description:'Pemutus daya seketika ke 10 meja praktikum (50 siswa).'});
  }

  _initInteraction() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE' && this.currentHoverData && !this.modal?.isOpen()) {
        audioManager.playClick?.();
        this.modal?.open(this.currentHoverData);
      }
    });

    this.canvas.addEventListener('click', () => {
      audioManager.init?.();
      if (this.currentHoverData && !this.modal?.isOpen()) {
        this.modal?.open(this.currentHoverData);
      }
    });
  }

  _startProximityCheck() {
    setInterval(() => {
      if (this.modal?.isOpen()) return;
      const cp = this.engine.camera.position;
      let nearest = null, minD = 3.2;
      for (const m of (this.markers?.markers ?? [])) {
        const mp = m.group.position;
        const d = Math.hypot(cp.x - mp.x, cp.z - mp.z);
        if (d < minD) { minD = d; nearest = m.group.userData; }
      }
      const cross = document.getElementById('crosshair');
      if (nearest) {
        this.currentHoverData = nearest.targetData ?? nearest;
        this.hud?.showToast(`Tekan [E] atau Klik: ${nearest.title ?? this.currentHoverData?.name}`);
        cross?.classList.add('interactable');
      } else {
        this.currentHoverData = null;
        this.hud?.hideToast();
        cross?.classList.remove('interactable');
      }
    }, 200);
  }

  _setupFpsCounter() {
    const el = document.createElement('div');
    el.id = 'fps-counter';
    el.style.cssText =
      'position:fixed;bottom:16px;right:20px;background:rgba(0,0,0,0.6);' +
      'color:#38bdf8;font:bold 11px monospace;padding:4px 10px;border-radius:6px;' +
      'z-index:200;pointer-events:none;border:1px solid rgba(56,189,248,0.3)';
    document.body.appendChild(el);
    this._fpsEl = el;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const delta = Math.min((now - this._prevTime) / 1000, 0.05);
    this._prevTime = now;
    const elapsed = this.engine.clock.getElapsedTime();

    this.controls?.update(delta);
    this.equipment?.update(delta);
    this.markers?.update(delta, elapsed);
    this.hud?.update(this.engine.camera.position, this.controls?.euler ?? {y:0});
    this.engine.render();

    // FPS display every 30 frames
    this._frameCount++;
    if (this._frameCount % 30 === 0 && this._fpsEl) {
      const fps = Math.round(1 / delta);
      this._fpsEl.textContent = `${fps} FPS`;
      this._fpsEl.style.color = fps >= 50 ? '#10b981' : fps >= 30 ? '#f59e0b' : '#ef4444';
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Minimal WebGL check before starting
  const testCanvas = document.createElement('canvas');
  const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
  if (!gl) {
    document.body.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
        height:100vh;background:#0a0f1d;color:#fff;font-family:sans-serif;text-align:center;padding:2rem;">
        <div style="font-size:3rem">🖥️</div>
        <h2 style="color:#ef4444">WebGL Tidak Tersedia</h2>
        <p style="color:#94a3b8">Browser kamu tidak mendukung WebGL.<br>
        Coba gunakan Chrome/Firefox terbaru dan aktifkan hardware acceleration.</p>
      </div>`;
    return;
  }
  new PhysicsLabApplication();
});

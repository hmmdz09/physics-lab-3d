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
    this._fpsEl = null;
    this.currentHoverData = null;
    this._proximityFrameCount = 0;

    this.init();
  }

  init() {
    this.engine = new EngineScene(this.canvas);

    this.lighting = new LightingSystem(this.engine.scene);
    // Force shadow recompute once after scene is built
    this.engine.markShadowsDirty();

    this.controls = new ControllerManager(
      this.engine.camera, this.canvas, this.engine.scene
    );

    // Build world
    new RoomBuilder(this.engine.scene).build();
    this.furniture = new FurnitureBuilder(this.engine.scene, this.controls);
    this.furniture.build();
    this.equipment = new EquipmentBuilder(this.engine.scene);
    this.equipment.build();
    this.safety = new SafetyBuilder(this.engine.scene);
    this.safety.build();

    // Markers
    this.markers = new MarkerManager(this.engine.scene, this.engine.camera);
    this.setupHotspots();

    // UI
    this.modal = new ModalManager();
    this.compliance = new ComplianceManager();
    this.hud = new HudManager(this.controls, this.lighting, this.modal);

    // After world is built, push a single shadow update
    this.engine.markShadowsDirty();

    // FPS display (optional debug — comment out for release)
    this._setupFpsCounter();

    this.initInteractionEvents();
    this.animate();
  }

  setupHotspots() {
    const H = (id, title, pos, data) => this.markers.addMarker(id, title, pos, data);

    H('demo', 'Meja Demo Guru', { x: 0, y: 1.12, z: -5.8 }, {
      type: 'demo_station',
      name: 'Meja Demonstrasi Guru & Panggung Elevasi',
      capacity: 'Instruktur / Guru Fisika',
      specs: 'Meja demo 2.8m di atas panggung elevasi 15cm, menghadap seluruh siswa. Dilengkapi catu daya sentral dan wastafel demonstrasi.'
    });
    H('mechanics', 'Kit Mekanika', { x: -2.0, y: 1.12, z: -3.8 }, {
      id: 'mechanics', type: 'equipment',
      name: 'Rel Dinamika Presisi & Ticker Timer',
      category: 'Kit Mekanika',
      description: 'Eksperimen Hukum II Newton (F=ma), GLB, dan GLBB dengan pita ketik 50 Hz.'
    });
    H('oscilloscope', 'Osiloskop & Listrik', { x: -2.0, y: 1.12, z: 1.9 }, {
      id: 'oscilloscope', type: 'equipment',
      name: 'Osiloskop Digital Dual Channel & Catu Daya',
      category: 'Kit Listrik & Elektronika',
      description: 'Visualisasi gelombang AC/DC, pengukuran frekuensi, periode, dan tegangan Vp-p.'
    });
    H('optics', 'Bangku Optik & Laser', { x: -2.0, y: 1.12, z: 3.8 }, {
      id: 'optics', type: 'equipment',
      name: 'Bangku Optik Presisi & Percobaan Prisma Laser',
      category: 'Kit Optik & Gelombang',
      description: 'Pembiasan Snellius, dispersi cahaya prisma, penentuan sudut deviasi minimum.'
    });
    H('thermo', 'Kalorimeter Joule', { x: 2.0, y: 1.12, z: 3.8 }, {
      id: 'thermo', type: 'equipment',
      name: 'Kalorimeter Joule & Termofisika',
      category: 'Kit Termofisika',
      description: 'Asas Black, kalor jenis tembaga/aluminium/kuningan, dan tara kalor mekanik.'
    });
    H('prep', 'Ruang Persiapan', { x: -7.5, y: 1.12, z: 0 }, {
      type: 'storage_cabinet',
      name: 'Ruang Persiapan Guru & Lemari Alat',
      capacity: 'Luas 24 m² (min 18 m²)',
      specs: '4 lemari kaca terkunci untuk kit Mekanika, Optik, Listrik, dan Termofisika.'
    });
    H('apar', 'Titik K3 & APAR', { x: 3.2, y: 1.35, z: 7.2 }, {
      id: 'apar', type: 'safety',
      name: 'APAR ABC 6kg — Alat Pemadam Api Ringan',
      category: 'Fasilitas K3 Wajib',
      description: 'Tabung serbuk kimia kering untuk kebakaran listrik dan bahan kimia lab. Min 1 unit/100m².'
    });
    H('estop', 'Saklar Darurat Listrik', { x: 3.2, y: 1.45, z: -7.3 }, {
      id: 'emergency_stop', type: 'safety',
      name: 'Master Emergency Power Cut-off (E-Stop)',
      category: 'Proteksi Kelistrikan Lab',
      description: 'Pemutus daya seketika ke 10 meja praktikum siswa (50 siswa) untuk kedaruratan sengatan listrik.'
    });
  }

  initInteractionEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE' && this.currentHoverData && !this.modal.isOpen()) {
        this.modal.open(this.currentHoverData);
      }
    });

    this.canvas.addEventListener('click', (e) => {
      audioManager.init();
      const sx = this.controls.isPointerLocked ? window.innerWidth / 2 : e.clientX;
      const sy = this.controls.isPointerLocked ? window.innerHeight / 2 : e.clientY;
      const hit = this.markers.checkRaycast(sx, sy, window.innerWidth, window.innerHeight);
      if (hit) this.modal.open(hit.targetData || hit);
    });

    // Proximity check throttled to every 10 frames (~6 fps check = fine for UX)
    this._proximityInterval = null;
    setInterval(() => this._checkProximity(), 200); // 5 checks/sec is plenty
  }

  _checkProximity() {
    if (this.modal.isOpen()) return;
    const camPos = this.engine.camera.position;
    let nearest = null;
    let minDist = 3.2;
    for (const m of this.markers.markers) {
      const mp = m.group.position;
      const d = Math.sqrt((camPos.x - mp.x) ** 2 + (camPos.z - mp.z) ** 2);
      if (d < minDist) { minDist = d; nearest = m.group.userData; }
    }
    const crosshair = document.getElementById('crosshair');
    if (nearest) {
      this.currentHoverData = nearest.targetData || nearest;
      this.hud.showToast(`Tekan [E] atau Klik: ${nearest.title || this.currentHoverData.name}`);
      crosshair?.classList.add('interactable');
    } else {
      this.currentHoverData = null;
      this.hud.hideToast();
      crosshair?.classList.remove('interactable');
    }
  }

  _setupFpsCounter() {
    const div = document.createElement('div');
    div.style.cssText =
      'position:fixed;bottom:16px;right:20px;background:rgba(0,0,0,0.5);' +
      'color:#38bdf8;font:bold 11px monospace;padding:4px 8px;border-radius:6px;' +
      'z-index:999;pointer-events:none;border:1px solid rgba(56,189,248,0.3)';
    document.body.appendChild(div);
    this._fpsEl = div;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const now = performance.now();
    const delta = Math.min((now - this._prevTime) / 1000, 0.05); // Cap at 50ms (20 FPS min)
    this._prevTime = now;
    const elapsed = this.engine.clock.getElapsedTime();

    this.controls.update(delta);
    this.equipment.update(delta);
    this.markers.update(delta, elapsed);
    this.hud.update(this.engine.camera.position, this.controls.euler);
    this.engine.render();

    // FPS counter update every 30 frames
    this._frameCount++;
    if (this._frameCount % 30 === 0 && this._fpsEl) {
      const fps = Math.round(1 / delta);
      this._fpsEl.textContent = `${fps} FPS`;
      this._fpsEl.style.color = fps >= 50 ? '#10b981' : fps >= 30 ? '#f59e0b' : '#ef4444';
    }
  }
}

window.addEventListener('DOMContentLoaded', () => new PhysicsLabApplication());

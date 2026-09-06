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
    this.engine = null;
    this.lighting = null;
    this.controls = null;
    this.room = null;
    this.furniture = null;
    this.equipment = null;
    this.safety = null;
    this.markers = null;
    this.modal = null;
    this.compliance = null;
    this.hud = null;

    this.currentHoverData = null;

    this.init();
  }

  init() {
    // 1. Engine & Scene
    this.engine = new EngineScene(this.canvas);

    // 2. Lighting System
    this.lighting = new LightingSystem(this.engine.scene);

    // 3. Controls
    this.controls = new ControllerManager(this.engine.camera, this.canvas, this.engine.scene);

    // 4. World Builders
    this.room = new RoomBuilder(this.engine.scene);
    this.room.build();

    this.furniture = new FurnitureBuilder(this.engine.scene, this.controls);
    this.furniture.build();

    this.equipment = new EquipmentBuilder(this.engine.scene);
    this.equipment.build();

    this.safety = new SafetyBuilder(this.engine.scene);
    this.safety.build();

    // 5. Markers & Hotspots
    this.markers = new MarkerManager(this.engine.scene, this.engine.camera);
    this.setupHotspots();

    // 6. UI Managers
    this.modal = new ModalManager();
    this.compliance = new ComplianceManager();
    this.hud = new HudManager(this.controls, this.lighting, this.modal);

    // 7. Interaction Event Listeners
    this.initInteractionEvents();

    // 8. Start Loop
    this.animate();
  }

  setupHotspots() {
    // Holographic Beacons over primary stations
    this.markers.addMarker('demo', 'Meja Demonstrasi Guru', { x: 0, y: 1.15, z: -5.8 }, {
      type: 'demo_station',
      name: 'Meja Demonstrasi Guru & Panggung Elevasi',
      capacity: 'Instruktur / Guru Fisika',
      specs: 'Meja demo 2.8m di atas panggung 15cm, dilengkapi panel audio-visual proyektor, catu daya sentral, dan wastafel demonstrasi.'
    });

    this.markers.addMarker('mechanics', 'Kit Percobaan Mekanika', { x: -2.0, y: 1.15, z: -3.8 }, {
      id: 'mechanics',
      type: 'equipment',
      name: 'Rel Dinamika Presisi & Ticker Timer',
      category: 'Kit Mekanika',
      description: 'Eksperimen pembuktian Hukum II Newton (F = m·a), GLB, dan GLBB dengan pita ketik frekuensi 50 Hz.'
    });

    this.markers.addMarker('oscilloscope', 'Osiloskop & Elektronika', { x: -2.0, y: 1.15, z: 1.9 }, {
      id: 'oscilloscope',
      type: 'equipment',
      name: 'Osiloskop Digital Dual Channel & Catu Daya',
      category: 'Kit Listrik & Elektronika',
      description: 'Instrumen visualisasi bentuk gelombang listrik AC/DC, pengukuran frekuensi, periode, dan tegangan puncak-ke-puncak (Vp-p).'
    });

    this.markers.addMarker('optics', 'Bangku Optik & Prisma Laser', { x: -2.0, y: 1.15, z: 3.8 }, {
      id: 'optics',
      type: 'equipment',
      name: 'Bangku Optik Presisi & Percobaan Prisma Laser',
      category: 'Kit Optik & Gelombang',
      description: 'Menyelidiki hukum pembiasan Snellius, dispersi cahaya putih/laser menjadi spektrum spektral prisma kaca.'
    });

    this.markers.addMarker('thermo', 'Kalorimeter Joule', { x: 2.0, y: 1.15, z: 3.8 }, {
      id: 'thermo',
      type: 'equipment',
      name: 'Kalorimeter Joule & Termofisika',
      category: 'Kit Termofisika',
      description: 'Eksperimen Asas Black, penentuan kalor jenis tembaga, aluminium, kuningan, dan tara kalor mekanik.'
    });

    this.markers.addMarker('prep', 'Ruang Persiapan & Alat (24 m²)', { x: -7.5, y: 1.2, z: 0 }, {
      type: 'storage_cabinet',
      name: 'Ruang Persiapan Guru & Lemari Alat Terkunci',
      capacity: 'Luas 24 m² (Standar min 18 m²)',
      specs: 'Menyimpan 4 unit lemari kaca terkunci untuk kit Mekanika, Optik, Listrik, dan Termofisika.'
    });

    this.markers.addMarker('apar', 'Stasiun K3 & APAR', { x: 3.2, y: 1.4, z: 7.2 }, {
      id: 'apar',
      type: 'safety',
      name: 'APAR Tabung Pemadam Api Ringan 6kg',
      category: 'Fasilitas K3 Wajib',
      description: 'Tabung serbuk kimia kering jenis ABC untuk pencegahan dan tanggap darurat kebakaran laboratorium.'
    });

    this.markers.addMarker('estop', 'Master Saklar Darurat Listrik', { x: 3.2, y: 1.5, z: -7.3 }, {
      id: 'emergency_stop',
      type: 'safety',
      name: 'Master Emergency Power Cut-off (E-Stop)',
      category: 'Proteksi Kelistrikan Lab',
      description: 'Saklar jamur merah pemutus daya listrik seketika ke seluruh 10 meja praktikum siswa (kapasitas 50 siswa).'
    });
  }

  initInteractionEvents() {
    // Keyboard [E] to inspect hovered object
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyE') {
        if (this.currentHoverData && !this.modal.isOpen()) {
          this.modal.open(this.currentHoverData);
        }
      }
    });

    // Mouse click on canvas
    this.canvas.addEventListener('click', (e) => {
      audioManager.init();
      const rect = this.canvas.getBoundingClientRect();
      // If walk mode pointer locked, raycast from screen center
      const screenX = this.controls.isPointerLocked ? window.innerWidth / 2 : (e.clientX - rect.left);
      const screenY = this.controls.isPointerLocked ? window.innerHeight / 2 : (e.clientY - rect.top);

      const hit = this.markers.checkRaycast(screenX, screenY, window.innerWidth, window.innerHeight);
      if (hit) {
        this.modal.open(hit.targetData || hit);
      }
    });

    // Periodic proximity check for walk mode toast
    setInterval(() => {
      if (this.modal.isOpen()) return;

      const camPos = this.engine.camera.position;
      let nearest = null;
      let minDist = 3.2;

      this.markers.markers.forEach(m => {
        const mPos = m.group.position;
        const d = Math.sqrt((camPos.x - mPos.x) ** 2 + (camPos.z - mPos.z) ** 2);
        if (d < minDist) {
          minDist = d;
          nearest = m.group.userData;
        }
      });

      const crosshair = document.getElementById('crosshair');
      if (nearest) {
        this.currentHoverData = nearest.targetData || nearest;
        this.hud.showToast(`Tekan [E] atau Klik untuk memeriksa: ${nearest.title || this.currentHoverData.name}`);
        if (crosshair) crosshair.classList.add('interactable');
      } else {
        this.currentHoverData = null;
        this.hud.hideToast();
        if (crosshair) crosshair.classList.remove('interactable');
      }
    }, 150);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = Math.min(this.engine.clock.getDelta(), 0.1);
    const elapsedTime = this.engine.clock.getElapsedTime();

    // 1. Update Controls
    this.controls.update(delta);

    // 2. Update Dynamic Equipment (oscilloscope wave animation)
    this.equipment.update(delta);

    // 3. Update 3D Beacon Animations
    this.markers.update(delta, elapsedTime);

    // 4. Update HUD Minimap Radar
    this.hud.update(this.engine.camera.position, this.controls.euler);

    // 5. Render Three.js Scene
    this.engine.render();
  }
}

// Instantiate on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  new PhysicsLabApplication();
});

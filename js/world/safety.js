import * as THREE from 'three';
import { audioManager } from '../ui/audio.js';

export class SafetyBuilder {
  constructor(scene) {
    this.scene = scene;
    this.safetyObjects = [];

    this.mat = {
      red:    new THREE.MeshLambertMaterial({ color: 0xdc2626 }),
      metal:  new THREE.MeshLambertMaterial({ color: 0x1e293b }),
      white:  new THREE.MeshLambertMaterial({ color: 0xffffff }),
      yellow: new THREE.MeshLambertMaterial({ color: 0xfacc15 }),
      blue:   new THREE.MeshLambertMaterial({ color: 0x1e3a8a }),
    };
  }

  build() {
    const g = new THREE.Group();

    // APAR #1 near back exit
    const apar1 = this.createApar();
    apar1.position.set(3.2, 1.2, 7.35);
    g.add(apar1);
    this.safetyObjects.push(apar1);

    // APAR #2 near prep room entry
    const apar2 = this.createApar();
    apar2.position.set(-3.85, 1.2, 2.4);
    apar2.rotation.y = Math.PI / 2;
    g.add(apar2);
    this.safetyObjects.push(apar2);

    // P3K Box
    const p3k = this.createP3KBox();
    p3k.position.set(1.8, 1.5, 7.38);
    g.add(p3k);
    this.safetyObjects.push(p3k);

    // Eye Wash Station
    const ew = this.createEyeWashStation();
    ew.position.set(3.6, 0, 5.5);
    g.add(ew);
    this.safetyObjects.push(ew);

    // E-Stop switch on front wall
    const estop = this.createEmergencyPowerSwitch();
    estop.position.set(3.2, 1.4, -7.38);
    g.add(estop);
    this.safetyObjects.push(estop);

    // Exit doors
    const exits = this.createExitDoors();
    exits.position.set(0, 0, 7.4);
    g.add(exits);

    this.scene.add(g);
    return g;
  }

  createApar() {
    const g = new THREE.Group();
    // Cylinder body (6-seg for performance)
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 0.52, 8),
      this.mat.red
    );
    g.add(cyl);

    // Valve & hose (cheap boxes)
    const valve = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.07, 0.04), this.mat.metal);
    valve.position.set(0, 0.3, 0);
    g.add(valve);

    const hose = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.40, 0.015), this.mat.metal);
    hose.position.set(0.08, 0.08, 0);
    g.add(hose);

    // APAR label
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('APAR', 32, 30);
    ctx.font = '10px sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('6 KG ABC', 32, 50);
    const lm = new THREE.Mesh(
      new THREE.PlaneGeometry(0.10, 0.10),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) })
    );
    lm.position.set(0, 0.04, 0.077);
    g.add(lm);

    g.userData = {
      id: 'apar', type: 'safety',
      name: 'APAR ABC 6kg — Alat Pemadam Api Ringan',
      category: 'Fasilitas K3 Wajib',
      description: 'Tabung pemadam serbuk kimia kering jenis ABC untuk penanganan kebakaran listrik dan bahan kimia lab. Standar: min 1 unit / 100 m².',
      regulationCitation: 'Permendikbud No. 24/2007 Bagian K3 Laboratorium.'
    };
    return g;
  }

  createP3KBox() {
    const g = new THREE.Group();
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.48, 0.13), this.mat.white);
    g.add(box);

    // Green cross label
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(53, 15, 22, 98);
    ctx.fillRect(15, 53, 98, 22);
    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KOTAK P3K', 64, 120);
    const lm = new THREE.Mesh(
      new THREE.PlaneGeometry(0.36, 0.46),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) })
    );
    lm.position.set(0, 0, 0.066);
    g.add(lm);

    g.userData = {
      id: 'p3k', type: 'safety',
      name: 'Kotak P3K & Tanggap Darurat Medis Lab',
      category: 'Fasilitas K3 Wajib',
      description: 'Berisi perban steril, antiseptik, plester luka bakar, saline pencuci mata, dan panduan SOP P3K kemendikbud.',
      regulationCitation: 'Permendikbud No. 24/2007 Lampiran IV Butir D (Kesehatan & Keselamatan Kerja).'
    };
    return g;
  }

  createEyeWashStation() {
    const g = new THREE.Group();
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });

    // Pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.92, 8), poleMat);
    pole.position.y = 0.46;
    g.add(pole);

    // Basin
    const basin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.13, 0.12, 12),
      this.mat.yellow
    );
    basin.position.y = 0.94;
    g.add(basin);

    // 2 nozzle heads (one box each)
    [-0.05, 0.05].forEach(hx => {
      const n = new THREE.Mesh(
        new THREE.BoxGeometry(0.025, 0.05, 0.025),
        new THREE.MeshLambertMaterial({ color: 0x10b981 })
      );
      n.position.set(hx, 1.04, 0);
      g.add(n);
    });

    g.userData = {
      id: 'eyewash', type: 'safety',
      name: 'Pancuran Bilas Mata Darurat (Emergency Eye Wash)',
      category: 'Fasilitas K3 Wajib',
      description: 'Stasiun bilas mata darurat untuk menangani percikan serbuk logam, zat kimia, atau partikel panas ke mata.',
      regulationCitation: 'Standar Sanitasi dan Keselamatan Lab IPA/Fisika Kemendikbudristek.'
    };
    return g;
  }

  createEmergencyPowerSwitch() {
    const g = new THREE.Group();
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.07), this.mat.yellow);
    g.add(box);

    // Big red button
    const btn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.046, 0.032, 0.035, 12),
      this.mat.red
    );
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0, 0, 0.046);
    g.add(btn);

    // Signage label
    const c = document.createElement('canvas');
    c.width = 128; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EMERGENCY', 64, 22);
    ctx.fillText('POWER OFF', 64, 42);
    const lm = new THREE.Mesh(
      new THREE.PlaneGeometry(0.20, 0.10),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) })
    );
    lm.position.set(0, 0.12, 0.01);
    g.add(lm);

    g.userData = {
      id: 'emergency_stop', type: 'safety',
      name: 'Master Emergency Power Cut-off (E-Stop)',
      category: 'Proteksi Kelistrikan Lab',
      description: 'Saklar tombol jamur merah pemutus daya seketika ke seluruh 10 meja praktikum siswa untuk melindungi dari sengatan listrik.',
      regulationCitation: 'Permendikbud No. 24/2007 (Instalasi Daya Listrik Terpusat).'
    };
    return g;
  }

  createExitDoors() {
    const g = new THREE.Group();

    // Two door leaves (simple boxes)
    [-0.45, 0.45].forEach(dx => {
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.82, 2.32, 0.04), this.mat.blue);
      door.position.set(dx, 1.16, 0);
      g.add(door);

      // Push bar
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.68, 0.035, 0.035),
        new THREE.MeshLambertMaterial({ color: 0xe2e8f0 })
      );
      bar.position.set(dx, 1.02, -0.035);
      g.add(bar);
    });

    // EXIT sign
    const c = document.createElement('canvas');
    c.width = 128; c.height = 48;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#065f46';
    ctx.fillRect(0, 0, 128, 48);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT / KELUAR', 64, 32);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(0.78, 0.28),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) })
    );
    sign.position.set(0, 2.55, -0.03);
    g.add(sign);

    return g;
  }
}

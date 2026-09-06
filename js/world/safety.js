import * as THREE from 'three';
import { audioManager } from '../ui/audio.js';

export class SafetyBuilder {
  constructor(scene, controls = null) {
    this.scene = scene;
    this.controls = controls;
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

    // Large Multi-Basin Handwashing Station on back wall (X: -3.7 to -1.1, Z: 7.15)
    const washStation = this.createLargeWashStation();
    washStation.position.set(-2.4, 0, 7.15);
    g.add(washStation);
    this.safetyObjects.push(washStation);

    // Collision box for the wide wash station counter
    if (this.controls) {
      this.controls.addCollisionBox(-3.75, -1.05, 6.75, 7.5);
    }

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

  createLargeWashStation() {
    const g = new THREE.Group();

    // Shared materials
    const graniteMat = new THREE.MeshLambertMaterial({ color: 0x334155 }); // Dark granite countertop
    const cabinetMat = new THREE.MeshLambertMaterial({ color: 0x0f172a }); // Dark navy slate base
    const sinkMat    = new THREE.MeshLambertMaterial({ color: 0x94a3b8 }); // Stainless steel sink basin
    const chromeMat  = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }); // Chrome faucets & handles
    const mirrorMat  = new THREE.MeshBasicMaterial({ color: 0xdbeafe }); // Reflective clean mirror

    // 1. Lower cabinet base: 2.6m wide, 0.62m deep, 0.82m high
    const base = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.82, 0.60), cabinetMat);
    base.position.set(0, 0.41, 0);
    g.add(base);

    // Cabinet door panels (3 pairs = 6 doors)
    [-1.05, -0.65, -0.2, 0.2, 0.65, 1.05].forEach(dx => {
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.72, 0.02), graniteMat);
      door.position.set(dx, 0.41, -0.31);
      g.add(door);

      // Handle
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.12, 6), chromeMat);
      handle.position.set(dx + (dx < 0 ? 0.14 : -0.14), 0.55, -0.33);
      g.add(handle);
    });

    // 2. Countertop: 2.64m wide, 0.66m deep, 0.05m thick with slight overhang
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.64, 0.05, 0.66), graniteMat);
    top.position.set(0, 0.845, 0);
    g.add(top);

    // 3. Three Large Stainless Sinks (each 0.62m wide x 0.44m deep)
    const sinkOffsets = [-0.85, 0, 0.85];
    sinkOffsets.forEach(sx => {
      // Sink rim / outer border
      const basinOuter = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.06, 0.48), sinkMat);
      basinOuter.position.set(sx, 0.865, 0);
      g.add(basinOuter);

      // Sink basin depth (recessed interior visual)
      const basinInner = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.14, 0.40), new THREE.MeshLambertMaterial({ color: 0x64748b }));
      basinInner.position.set(sx, 0.81, 0);
      g.add(basinInner);

      // Drain hole
      const drain = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), chromeMat);
      drain.position.set(sx, 0.885, 0);
      g.add(drain);

      // 4. Chrome Gooseneck Faucets
      const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.08, 8), chromeMat);
      faucetBase.position.set(sx, 0.91, 0.22);
      g.add(faucetBase);

      const faucetStem = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.28, 8), chromeMat);
      faucetStem.position.set(sx, 1.05, 0.22);
      g.add(faucetStem);

      const faucetArch = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.016, 8, 12, Math.PI), chromeMat);
      faucetArch.rotation.y = Math.PI / 2;
      faucetArch.position.set(sx, 1.19, 0.14);
      g.add(faucetArch);

      const faucetSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.06, 8), chromeMat);
      faucetSpout.position.set(sx, 1.15, 0.06);
      g.add(faucetSpout);

      // Tap Knobs (Dual controls: hot/pure water & cold)
      [-0.06, 0.06].forEach(kx => {
        const knob = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.04), chromeMat);
        knob.position.set(sx + kx, 0.94, 0.22);
        g.add(knob);
      });

      // Liquid soap dispenser for each sink
      const soap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
      soap.position.set(sx + 0.25, 0.95, 0.22);
      g.add(soap);
    });

    // 5. Ceramic Tile Backsplash: 2.64m wide, 0.65m high
    const splash = new THREE.Mesh(
      new THREE.PlaneGeometry(2.64, 0.65),
      this._makeTileMat()
    );
    splash.position.set(0, 1.195, 0.325);
    g.add(splash);

    // 6. Large Mirror above the sinks: 2.4m wide, 0.55m high
    const mirror = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.55), mirrorMat);
    mirror.position.set(0, 1.82, 0.326);
    g.add(mirror);

    // Mirror chrome frame
    const mirrorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(2.46, 0.61, 0.02),
      chromeMat
    );
    mirrorFrame.position.set(0, 1.82, 0.32);
    g.add(mirrorFrame);

    // 7. Wall Hand Dryer / Paper Towel Dispenser
    const dryer = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.32, 0.12), chromeMat);
    dryer.position.set(1.42, 1.45, 0.26);
    g.add(dryer);

    // 8. Overhead Illuminated Sign
    const signTex = this._makeWashSignTexture();
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(2.4, 0.32),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    sign.position.set(0, 2.22, 0.327);
    g.add(sign);

    g.userData = {
      id: 'wash_station',
      type: 'safety',
      name: 'Wastafel Cuci Tangan & Sterilisasi Alat (3 Keran)',
      category: 'Fasilitas Sanitasi & Higienitas Lab',
      description: 'Stasiun cuci tangan luas 2.6m dengan 3 bak cuci stainless steel, keran leher angsa, dispenser sabun antiseptik, cermin, dan saluran pembuangan terpusat.',
      regulationCitation: 'Permendikbud No. 24/2007 Lampiran IV Butir A (Instalasi Air Bersih & Wastafel Laboratorium).'
    };

    return g;
  }

  _makeTileMat() {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 128, 128);
    ctx.strokeRect(0, 0, 64, 64);
    ctx.strokeRect(64, 64, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 2);
    return new THREE.MeshLambertMaterial({ map: tex });
  }

  _makeWashSignTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 72;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#082f49';
    ctx.fillRect(0, 0, 512, 72);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 508, 68);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚰  WASTAFEL CUCI TANGAN & PEMBERSIHAN ALAT', 256, 30);

    ctx.fillStyle = '#bae6fd';
    ctx.font = '11px monospace';
    ctx.fillText('3 KERAN STAINLESS STEEL · SABUN ANTISEPTIK · PERMENDIKBUD 24/2007', 256, 52);

    return new THREE.CanvasTexture(c);
  }
}

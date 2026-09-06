import * as THREE from 'three';

export class EquipmentBuilder {
  constructor(scene) {
    this.scene = scene;
    this.interactiveEquipments = [];

    // Shared cheap materials
    this.mat = {
      dark:     new THREE.MeshLambertMaterial({ color: 0x334155 }),
      steel:    new THREE.MeshLambertMaterial({ color: 0x94a3b8 }),
      red:      new THREE.MeshLambertMaterial({ color: 0xdc2626 }),
      blue:     new THREE.MeshLambertMaterial({ color: 0x0284c7 }),
      green:    new THREE.MeshBasicMaterial({ color: 0x10b981 }),
      yellow:   new THREE.MeshLambertMaterial({ color: 0xf59e0b }),
      chrome:   new THREE.MeshLambertMaterial({ color: 0xe2e8f0 }),
      glass:    new THREE.MeshBasicMaterial({ color: 0xbfdbfe, transparent: true, opacity: 0.5 }),
    };

    // Oscilloscope animated canvas
    this._oscCanvas = null;
    this._oscCtx = null;
    this._oscTex = null;
    this._oscTime = 0;
    this._oscFreq = 2;
    this._oscAmp = 50;

    // Frame counter for oscilloscope throttling
    this._oscFrameCount = 0;
  }

  _box(w, h, d) { return new THREE.BoxGeometry(w, h, d); }
  _cyl(rt, rb, h, seg = 8) { return new THREE.CylinderGeometry(rt, rb, h, seg); }

  _m(geo, mat, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    return m;
  }

  build() {
    const equipGroup = new THREE.Group();

    // 1. Oscilloscope Station  (Table #7: X=-2, Z=1.9)
    const osc = this.createOscilloscopeStation();
    osc.position.set(-2.0, 0.8, 1.9);
    equipGroup.add(osc);
    this.interactiveEquipments.push(osc);

    // 2. Optics Station  (Table #5: X=-2, Z=3.8)
    const opt = this.createOpticsStation();
    opt.position.set(-2.0, 0.8, 3.8);
    equipGroup.add(opt);
    this.interactiveEquipments.push(opt);

    // 3. Mechanics Station  (Table #1: X=-2, Z=-3.8)
    const mech = this.createMechanicsStation();
    mech.position.set(-2.0, 0.8, -3.8);
    equipGroup.add(mech);
    this.interactiveEquipments.push(mech);

    // 4. Thermodynamics Station  (Table #9: X=2, Z=3.8)
    const thermo = this.createThermodynamicsStation();
    thermo.position.set(2.0, 0.8, 3.8);
    equipGroup.add(thermo);
    this.interactiveEquipments.push(thermo);

    this.scene.add(equipGroup);
    return equipGroup;
  }

  createOscilloscopeStation() {
    const g = new THREE.Group();

    // Chassis body
    const body = this._m(this._box(0.36, 0.20, 0.24), this.mat.dark, -0.4, 0.10, 0);
    body.castShadow = true;
    g.add(body);

    // Screen with animated canvas texture
    this._oscCanvas = document.createElement('canvas');
    this._oscCanvas.width = 128;   // Smaller canvas = less GPU upload
    this._oscCanvas.height = 96;
    this._oscCtx = this._oscCanvas.getContext('2d');
    this._oscTex = new THREE.CanvasTexture(this._oscCanvas);

    const screen = this._m(
      new THREE.PlaneGeometry(0.22, 0.14),
      new THREE.MeshBasicMaterial({ map: this._oscTex }),
      -0.45, 0.12, 0.122
    );
    g.add(screen);

    // Power supply next to it (simple box)
    g.add(Object.assign(
      this._m(this._box(0.26, 0.16, 0.20), this.mat.dark, 0.28, 0.08, 0)
    ));

    // DC readout (static canvas, only created once)
    const psCanvas = document.createElement('canvas');
    psCanvas.width = 64; psCanvas.height = 32;
    const psCtx = psCanvas.getContext('2d');
    psCtx.fillStyle = '#022c22';
    psCtx.fillRect(0, 0, 64, 32);
    psCtx.fillStyle = '#10b981';
    psCtx.font = 'bold 13px monospace';
    psCtx.fillText('12.0V', 6, 20);

    const psTex = new THREE.CanvasTexture(psCanvas);
    g.add(this._m(
      new THREE.PlaneGeometry(0.10, 0.05),
      new THREE.MeshBasicMaterial({ map: psTex }),
      0.28, 0.12, 0.102
    ));

    // 4 knobs (InstancedMesh, one call)
    const knobGeo = this._cyl(0.012, 0.012, 0.018, 8);
    const knobMat = new THREE.MeshLambertMaterial({ color: 0x0284c7 });
    const knobInst = new THREE.InstancedMesh(knobGeo, knobMat, 4);
    const dummy = new THREE.Object3D();
    [[-0.28, 0.08], [-0.25, 0.14], [-0.54, 0.08], [-0.54, 0.14]].forEach(([kx, ky], i) => {
      dummy.position.set(kx, ky, 0.125);
      dummy.rotation.x = Math.PI / 2;
      dummy.updateMatrix();
      knobInst.setMatrixAt(i, dummy.matrix);
    });
    knobInst.instanceMatrix.needsUpdate = true;
    g.add(knobInst);

    g.userData = {
      id: 'oscilloscope', type: 'equipment',
      name: 'Osiloskop Digital Dual Channel & Catu Daya',
      category: 'Kit Listrik & Elektronika',
      description: 'Instrumen visualisasi bentuk gelombang listrik AC/DC, pengukuran frekuensi, periode, dan tegangan puncak-ke-puncak (Vp-p). Dilengkapi catu daya DC stabil 0–12V.',
      regulationCitation: 'Permendikbud No. 24/2007 Lampiran IV Butir C (Peralatan Pendidikan Fisika).'
    };
    return g;
  }

  createOpticsStation() {
    const g = new THREE.Group();

    // Rail track
    g.add(Object.assign(
      this._m(new THREE.BoxGeometry(1.4, 0.025, 0.07), this.mat.steel, 0, 0.012, 0)
    ));

    // Laser source (red box)
    g.add(this._m(this._box(0.11, 0.07, 0.07), this.mat.red, -0.55, 0.06, 0));

    // Prism (low-poly cylinder, 3-sided)
    const prism = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.10, 3),
      this.mat.glass
    );
    prism.position.set(0, 0.08, 0);
    prism.rotation.y = Math.PI / 6;
    g.add(prism);

    // Incident beam (Line)
    const incGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.49, 0.065, 0),
      new THREE.Vector3(-0.01, 0.065, 0)
    ]);
    g.add(new THREE.Line(incGeo, new THREE.LineBasicMaterial({ color: 0xff0044 })));

    // 5 refracted rainbow lines (reduced from 7)
    const rainbowColors = [0xff0000, 0xffff00, 0x00ff00, 0x00ffff, 0x8800ff];
    rainbowColors.forEach((c, idx) => {
      const angle = (idx - 2) * 0.04;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.065, 0),
        new THREE.Vector3(0.55, 0.065, 0.16 + angle * 1.2)
      ]);
      g.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: c })));
    });

    // Projection screen at +0.55m
    g.add(this._m(this._box(0.02, 0.16, 0.30), this.mat.chrome, 0.55, 0.10, 0.16));

    g.userData = {
      id: 'optics', type: 'equipment',
      name: 'Bangku Optik Presisi & Percobaan Prisma Laser',
      category: 'Kit Optik & Gelombang',
      description: 'Menyelidiki hukum pembiasan Snellius, dispersi cahaya putih menjadi spektrum pelangi prisma kaca, dan penentuan sudut deviasi minimum.',
      regulationCitation: 'Permendikbud No. 24/2007 Lampiran IV Butir C (Alat Percobaan Optik).'
    };
    return g;
  }

  createMechanicsStation() {
    const g = new THREE.Group();
    const purple = new THREE.MeshLambertMaterial({ color: 0x9333ea });

    // Track
    g.add(this._m(new THREE.BoxGeometry(1.3, 0.035, 0.10), purple, 0, 0.017, 0));

    // Cart
    g.add(this._m(this._box(0.18, 0.055, 0.09), this.mat.blue, -0.1, 0.063, 0));

    // Cart wheels (4, InstancedMesh)
    const wGeo = this._cyl(0.018, 0.018, 0.012, 8);
    const wMat = new THREE.MeshLambertMaterial({ color: 0x0f172a });
    const wInst = new THREE.InstancedMesh(wGeo, wMat, 4);
    const dummy = new THREE.Object3D();
    [[-0.16, -0.04], [-0.16, 0.04], [-0.04, -0.04], [-0.04, 0.04]].forEach(([wx, wz], i) => {
      dummy.position.set(wx, 0.035, wz);
      dummy.rotation.z = Math.PI / 2;
      dummy.updateMatrix();
      wInst.setMatrixAt(i, dummy.matrix);
    });
    wInst.instanceMatrix.needsUpdate = true;
    g.add(wInst);

    // Ticker timer
    g.add(this._m(this._box(0.09, 0.07, 0.07), this.mat.dark, -0.55, 0.05, 0));

    // Hanging mass + string lines
    const strGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.0, 0.06, 0),
      new THREE.Vector3(0.65, 0.06, 0),
      new THREE.Vector3(0.65, -0.14, 0)
    ]);
    g.add(new THREE.Line(strGeo, new THREE.LineBasicMaterial({ color: 0xffffff })));
    g.add(this._m(this._cyl(0.018, 0.018, 0.045, 10), this.mat.yellow, 0.65, -0.16, 0));

    g.userData = {
      id: 'mechanics', type: 'equipment',
      name: 'Rel Dinamika Presisi & Pewaktu Ketik (Ticker Timer)',
      category: 'Kit Mekanika',
      description: 'Eksperimen Hukum II Newton (F = m·a), GLB, dan GLBB dengan rekaman pita ketik 50 Hz.',
      regulationCitation: 'Permendikbud No. 24/2007 Lampiran IV Butir C (Alat Percobaan Mekanika).'
    };
    return g;
  }

  createThermodynamicsStation() {
    const g = new THREE.Group();

    // Joule calorimeter vessel (low-poly 12-seg)
    const outer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.16, 12),
      this.mat.steel
    );
    outer.position.set(-0.2, 0.08, 0);
    g.add(outer);

    // Lid
    g.add(this._m(new THREE.CylinderGeometry(0.09, 0.09, 0.018, 12),
      this.mat.dark, -0.2, 0.178, 0));

    // Thermometer probe
    g.add(this._m(this._cyl(0.005, 0.005, 0.20, 6),
      new THREE.MeshLambertMaterial({ color: 0xef4444 }), -0.23, 0.24, 0));

    // 3 metal cylinders (InstancedMesh)
    const cylGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.065, 10);
    const metalColors = [0xb45309, 0xd1d5db, 0xeab308];
    metalColors.forEach((c, i) => {
      const cyl = new THREE.Mesh(
        cylGeo,
        new THREE.MeshLambertMaterial({ color: c })
      );
      cyl.position.set(0.1 + i * 0.1, 0.033, 0);
      g.add(cyl);
    });

    g.userData = {
      id: 'thermo', type: 'equipment',
      name: 'Kalorimeter Joule & Silinder Kalor Jenis',
      category: 'Kit Termofisika',
      description: 'Eksperimen Asas Black: Q_lepas = Q_terima, penentuan kalor jenis tembaga, aluminium, dan kuningan.',
      regulationCitation: 'Permendikbud No. 24/2007 Lampiran IV Butir C (Alat Percobaan Kalor).'
    };
    return g;
  }

  update(delta) {
    // Throttle oscilloscope canvas to every 3rd frame (~20 FPS update)
    this._oscFrameCount++;
    if (this._oscFrameCount % 3 !== 0) return;
    if (!this._oscCtx || !this._oscCanvas) return;

    this._oscTime += delta * this._oscFreq * 8;
    const ctx = this._oscCtx;
    const w = this._oscCanvas.width;
    const h = this._oscCanvas.height;

    ctx.fillStyle = '#01130d';
    ctx.fillRect(0, 0, w, h);

    // Simplified grid (fewer lines for small canvas)
    ctx.strokeStyle = '#064326';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= w; x += 16) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y <= h; y += 16) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Waveform
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const mid = h / 2;
    for (let x = 0; x < w; x++) {
      const y = mid + Math.sin((x * 0.08) + this._oscTime) * this._oscAmp;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#34d399';
    ctx.font = '9px monospace';
    ctx.fillText('CH1  250Hz', 3, 11);

    this._oscTex.needsUpdate = true;
  }
}

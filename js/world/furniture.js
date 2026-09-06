import * as THREE from 'three';

// ---------------------------------------------------------------
// Shared geometry & material pools to avoid redundant GPU uploads
// ---------------------------------------------------------------
const _GEO = {
  box1: new THREE.BoxGeometry(1, 1, 1),          // scaled per use
  cyl8: new THREE.CylinderGeometry(1, 1, 1, 8),  // low-poly 8-seg
  cyl12: new THREE.CylinderGeometry(1, 1, 1, 12),
  plane: new THREE.PlaneGeometry(1, 1)
};

function box(w, h, d) { return new THREE.BoxGeometry(w, h, d); }
function cyl(rt, rb, h, seg = 8) { return new THREE.CylinderGeometry(rt, rb, h, seg); }

// Build a MeshBasicMaterial (zero lighting cost)
function basic(color) {
  return new THREE.MeshBasicMaterial({ color });
}

// Build cheap flat-shaded MeshLambertMaterial
function lamb(color, roughness = 0.7) {
  return new THREE.MeshLambertMaterial({ color });
}

function mesh(geo, mat, castShadow = false, receiveShadow = false) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = castShadow;
  m.receiveShadow = receiveShadow;
  return m;
}

// ---------------------------------------------------------------
export class FurnitureBuilder {
  constructor(scene, controls) {
    this.scene = scene;
    this.controls = controls;

    // Shared materials (avoid creating duplicate GPU buffers)
    this.mat = {
      benchTop:    lamb(0x1e293b),
      steel:       lamb(0x475569),
      sink:        lamb(0x94a3b8),
      chrome:      lamb(0xe2e8f0),
      console:     lamb(0x0f172a),
      chairSeat:   lamb(0x2563eb),
      cabinet:     lamb(0x334155),
      cabGlass:    new THREE.MeshBasicMaterial({ color: 0x9dceff, transparent: true, opacity: 0.35 }),
      tableBadge:  null, // set per table via canvas
    };
  }

  build() {
    const furnitureGroup = new THREE.Group();

    const xColumns = [-2.0, 2.0];
    const zRows    = [-3.8, -1.9, 0.0, 1.9, 3.8];

    // -----------------------------------------------------------
    // 1. 10 Student Island Tables – using InstancedMesh for bodies
    // -----------------------------------------------------------
    // Table top (all 10 tops as one InstancedMesh)
    const topGeo = box(2.0, 0.05, 1.0);
    const topInst = new THREE.InstancedMesh(topGeo, this.mat.benchTop, 10);
    topInst.castShadow = true;
    topInst.receiveShadow = true;

    const dummy = new THREE.Object3D();
    let idx = 0;
    for (let c = 0; c < 2; c++) {
      for (let r = 0; r < 5; r++) {
        dummy.position.set(xColumns[c], 0.775, zRows[r]);
        dummy.updateMatrix();
        topInst.setMatrixAt(idx++, dummy.matrix);
      }
    }
    topInst.instanceMatrix.needsUpdate = true;
    furnitureGroup.add(topInst);

    // Table legs (40 legs as one InstancedMesh)
    const legGeo = cyl(0.03, 0.03, 0.77);
    const legInst = new THREE.InstancedMesh(legGeo, this.mat.steel, 40);
    idx = 0;
    const legOffsets = [[-0.92, -0.42], [0.92, -0.42], [-0.92, 0.42], [0.92, 0.42]];
    for (let c = 0; c < 2; c++) {
      for (let r = 0; r < 5; r++) {
        for (const [lx, lz] of legOffsets) {
          dummy.position.set(xColumns[c] + lx, 0.385, zRows[r] + lz);
          dummy.updateMatrix();
          legInst.setMatrixAt(idx++, dummy.matrix);
        }
      }
    }
    legInst.instanceMatrix.needsUpdate = true;
    furnitureGroup.add(legInst);

    // Sinks (10) as InstancedMesh
    const sinkGeo = box(0.35, 0.12, 0.28);
    const sinkInst = new THREE.InstancedMesh(sinkGeo, this.mat.sink, 10);
    idx = 0;
    for (let c = 0; c < 2; c++) {
      for (let r = 0; r < 5; r++) {
        dummy.position.set(xColumns[c], 0.82, zRows[r]);
        dummy.updateMatrix();
        sinkInst.setMatrixAt(idx++, dummy.matrix);
      }
    }
    sinkInst.instanceMatrix.needsUpdate = true;
    furnitureGroup.add(sinkInst);

    // Power consoles (10) InstancedMesh
    const consoleGeo = box(0.38, 0.10, 0.13);
    const consoleInst = new THREE.InstancedMesh(consoleGeo, this.mat.console, 10);
    idx = 0;
    for (let c = 0; c < 2; c++) {
      for (let r = 0; r < 5; r++) {
        dummy.position.set(xColumns[c], 0.855, zRows[r] - 0.14);
        dummy.updateMatrix();
        consoleInst.setMatrixAt(idx++, dummy.matrix);
      }
    }
    consoleInst.instanceMatrix.needsUpdate = true;
    furnitureGroup.add(consoleInst);

    // LED indicators (10) – MeshBasicMaterial, zero cost
    const ledGeo = new THREE.SphereGeometry(0.013, 6, 6);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const ledInst = new THREE.InstancedMesh(ledGeo, ledMat, 10);
    idx = 0;
    for (let c = 0; c < 2; c++) {
      for (let r = 0; r < 5; r++) {
        dummy.position.set(xColumns[c] + 0.11, 0.875, zRows[r] - 0.073);
        dummy.updateMatrix();
        ledInst.setMatrixAt(idx++, dummy.matrix);
      }
    }
    ledInst.instanceMatrix.needsUpdate = true;
    furnitureGroup.add(ledInst);

    // -----------------------------------------------------------
    // 2. 50 Stool Chairs — InstancedMesh (seats + shafts)
    // -----------------------------------------------------------
    this.buildStools(furnitureGroup, xColumns, zRows);

    // -----------------------------------------------------------
    // 3. Individual labels (only for first and last table)
    //    Avoid creating 10 canvas textures — just 2
    // -----------------------------------------------------------
    this.addTableLabel(furnitureGroup, xColumns[0], zRows[0], 0.51, '01');
    this.addTableLabel(furnitureGroup, xColumns[1], zRows[4], 0.51, '10');

    // -----------------------------------------------------------
    // 4. Collision boxes for all 10 tables
    // -----------------------------------------------------------
    for (let c = 0; c < 2; c++) {
      for (let r = 0; r < 5; r++) {
        this.controls.addCollisionBox(
          xColumns[c] - 1.05, xColumns[c] + 1.05,
          zRows[r] - 0.58, zRows[r] + 0.58
        );
      }
    }

    // -----------------------------------------------------------
    // 5. Teacher Demonstration Station
    // -----------------------------------------------------------
    const demoStation = this.createTeacherDemoStation();
    furnitureGroup.add(demoStation);
    this.controls.addCollisionBox(-2.3, 2.3, -6.6, -5.0);

    // -----------------------------------------------------------
    // 6. Preparation Room furniture (simplified)
    // -----------------------------------------------------------
    const prepFurniture = this.createPreparationFurniture();
    furnitureGroup.add(prepFurniture);

    this.scene.add(furnitureGroup);
    return furnitureGroup;
  }

  buildStools(group, xColumns, zRows) {
    // 50 seats — InstancedMesh
    const seatGeo = cyl(0.17, 0.17, 0.03, 10);
    const seatInst = new THREE.InstancedMesh(seatGeo, this.mat.chairSeat, 50);

    // 50 shafts — InstancedMesh
    const shaftGeo = cyl(0.018, 0.018, 0.50, 6);
    const shaftInst = new THREE.InstancedMesh(shaftGeo, this.mat.steel, 50);

    const dummy = new THREE.Object3D();
    const stoolOffsets = [
      { sx: -0.5, sz: -0.65 }, { sx: 0.5, sz: -0.65 },
      { sx: -0.5, sz:  0.65 }, { sx: 0.5, sz:  0.65 },
      { sx: 0,   sz:  0 } // center aisle seat
    ];

    let si = 0;
    for (let c = 0; c < 2; c++) {
      for (let r = 0; r < 5; r++) {
        // Override 5th stool: outer aisle direction
        const offsets = [
          { sx: -0.5, sz: -0.65 }, { sx: 0.5, sz: -0.65 },
          { sx: -0.5, sz:  0.65 }, { sx: 0.5, sz:  0.65 },
          { sx: xColumns[c] > 0 ? 1.1 : -1.1, sz: 0 }
        ];
        for (const o of offsets) {
          const wx = xColumns[c] + o.sx;
          const wz = zRows[r] + o.sz;
          dummy.position.set(wx, 0.515, wz);
          dummy.updateMatrix();
          seatInst.setMatrixAt(si, dummy.matrix);

          dummy.position.set(wx, 0.26, wz);
          dummy.updateMatrix();
          shaftInst.setMatrixAt(si, dummy.matrix);
          si++;
        }
      }
    }
    seatInst.instanceMatrix.needsUpdate = true;
    shaftInst.instanceMatrix.needsUpdate = true;
    group.add(seatInst);
    group.add(shaftInst);
  }

  addTableLabel(group, x, z, zOffset, num) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 252, 60);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`MEJA PRAKTIKUM #${num}  (5 SISWA)`, 128, 38);
    const tex = new THREE.CanvasTexture(c);
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.1),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    m.position.set(x, 0.83, z + zOffset);
    group.add(m);
  }

  createTeacherDemoStation() {
    const g = new THREE.Group();
    g.position.set(0, 0, -5.8);

    // Podium (flat)
    g.add(Object.assign(mesh(box(4.6, 0.15, 2.0), lamb(0x0f172a), false, true),
      { position: new THREE.Vector3(0, 0.075, 0) }));

    // Desk top
    const top = mesh(box(2.8, 0.06, 0.9), this.mat.benchTop, true, true);
    top.position.set(0, 0.15 + 0.85, 0);
    g.add(top);

    // Desk base
    const base = mesh(box(2.7, 0.82, 0.8), this.mat.cabinet, true, false);
    base.position.set(0, 0.15 + 0.41, 0);
    g.add(base);

    // Laptop (simple boxes, basic material)
    const laptop = mesh(box(0.35, 0.02, 0.25), basic(0x1e293b));
    laptop.position.set(-0.7, 1.02, 0);
    g.add(laptop);

    const screen = mesh(box(0.34, 0.20, 0.012), basic(0x38bdf8));
    screen.position.set(-0.7, 1.12, -0.13);
    g.add(screen);

    // Demo sink
    const dSink = mesh(box(0.38, 0.16, 0.32), this.mat.sink);
    dSink.position.set(0.9, 0.94, 0);
    g.add(dSink);

    // E-Stop box
    const eStop = mesh(box(0.18, 0.11, 0.12), basic(0xdc2626));
    eStop.position.set(0.2, 1.01, -0.22);
    g.add(eStop);

    g.userData = {
      type: 'demo_station',
      name: 'Meja Demonstrasi Guru & Panggung Elevasi',
      capacity: 'Stasiun Guru & Instruktur',
      specs: 'Ukuran 2.8m x 0.9m di atas panggung elevasi 15cm. Dilengkapi instalasi listrik master, panel audio-visual, dan wastafel demonstrasi.'
    };
    return g;
  }

  createPreparationFurniture() {
    const g = new THREE.Group();

    // Prep desk (one simple box)
    const d = mesh(box(2.0, 0.8, 0.9), this.mat.cabinet, true, false);
    d.position.set(-7.5, 0.4, 0);
    g.add(d);
    this.controls.addCollisionBox(-8.6, -6.4, -0.5, 0.5);

    // 4 Storage Cabinets as InstancedMesh
    const cabBody = box(0.5, 2.0, 0.78);
    const cabInst = new THREE.InstancedMesh(cabBody, this.mat.cabinet, 4);
    const dummy = new THREE.Object3D();
    const zs = [-1.3, -0.4, 0.5, 1.4];
    zs.forEach((z, i) => {
      dummy.position.set(-9.4, 1.0, z);
      dummy.updateMatrix();
      cabInst.setMatrixAt(i, dummy.matrix);
      this.controls.addCollisionBox(-9.8, -9.0, z - 0.4, z + 0.4);
    });
    cabInst.instanceMatrix.needsUpdate = true;
    g.add(cabInst);

    // Cabinet glass fronts as InstancedMesh (cheap MeshBasic)
    const glassGeo = new THREE.PlaneGeometry(0.72, 1.8);
    const glassInst = new THREE.InstancedMesh(glassGeo, this.mat.cabGlass, 4);
    zs.forEach((z, i) => {
      dummy.position.set(-9.15, 1.0, z);
      dummy.rotation.set(0, Math.PI / 2, 0);
      dummy.updateMatrix();
      glassInst.setMatrixAt(i, dummy.matrix);
    });
    dummy.rotation.set(0, 0, 0); // reset rotation
    glassInst.instanceMatrix.needsUpdate = true;
    g.add(glassInst);

    return g;
  }
}

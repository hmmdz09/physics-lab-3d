import * as THREE from 'three';

function box(w, h, d) { return new THREE.BoxGeometry(w, h, d); }
function cyl(rt, rb, h, seg = 8) { return new THREE.CylinderGeometry(rt, rb, h, seg); }
function lamb(color) { return new THREE.MeshLambertMaterial({ color }); }

function addMesh(parent, geo, mat, x, y, z, shadow = false) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (shadow) { m.castShadow = true; m.receiveShadow = true; }
  parent.add(m);
  return m;
}

export class FurnitureBuilder {
  constructor(scene, controls) {
    this.scene    = scene;
    this.controls = controls;
    this.mat = {
      benchTop:  lamb(0x1e293b),
      steel:     lamb(0x64748b),
      sink:      lamb(0x94a3b8),
      console:   lamb(0x0f172a),
      chairSeat: lamb(0x2563eb),
      cabinet:   lamb(0x334155),
    };
  }

  build() {
    const g = new THREE.Group();
    const xCols = [-2.0, 2.0];
    const zRows = [-3.8, -1.9, 0.0, 1.9, 3.8];
    const dummy = new THREE.Object3D();

    // ── Table tops (10 instances) ──────────────────────────────
    const topInst = new THREE.InstancedMesh(box(2.0, 0.06, 1.0), this.mat.benchTop, 10);
    topInst.castShadow = true; topInst.receiveShadow = true;
    let idx = 0;
    for (const xc of xCols) for (const zr of zRows) {
      dummy.position.set(xc, 0.78, zr); dummy.rotation.set(0,0,0);
      dummy.updateMatrix(); topInst.setMatrixAt(idx++, dummy.matrix);
    }
    topInst.instanceMatrix.needsUpdate = true; g.add(topInst);

    // ── Table legs (40 instances) ─────────────────────────────
    const legInst = new THREE.InstancedMesh(cyl(0.03,0.03,0.77), this.mat.steel, 40);
    idx = 0;
    const offs = [[-0.9,-0.42],[0.9,-0.42],[-0.9,0.42],[0.9,0.42]];
    for (const xc of xCols) for (const zr of zRows) for (const [lx,lz] of offs) {
      dummy.position.set(xc+lx, 0.385, zr+lz); dummy.updateMatrix();
      legInst.setMatrixAt(idx++, dummy.matrix);
    }
    legInst.instanceMatrix.needsUpdate = true; g.add(legInst);

    // ── Sinks (10 instances) ──────────────────────────────────
    const sinkInst = new THREE.InstancedMesh(box(0.35,0.12,0.28), this.mat.sink, 10);
    idx = 0;
    for (const xc of xCols) for (const zr of zRows) {
      dummy.position.set(xc, 0.84, zr); dummy.updateMatrix();
      sinkInst.setMatrixAt(idx++, dummy.matrix);
    }
    sinkInst.instanceMatrix.needsUpdate = true; g.add(sinkInst);

    // ── Power consoles (10 instances) ─────────────────────────
    const conInst = new THREE.InstancedMesh(box(0.36,0.10,0.12), this.mat.console, 10);
    idx = 0;
    for (const xc of xCols) for (const zr of zRows) {
      dummy.position.set(xc, 0.855, zr-0.14); dummy.updateMatrix();
      conInst.setMatrixAt(idx++, dummy.matrix);
    }
    conInst.instanceMatrix.needsUpdate = true; g.add(conInst);

    // ── LED indicators (10, MeshBasic = zero cost) ───────────
    const ledInst = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.013, 6, 4),
      new THREE.MeshBasicMaterial({ color: 0x10b981 }), 10
    );
    idx = 0;
    for (const xc of xCols) for (const zr of zRows) {
      dummy.position.set(xc+0.11, 0.878, zr-0.073); dummy.updateMatrix();
      ledInst.setMatrixAt(idx++, dummy.matrix);
    }
    ledInst.instanceMatrix.needsUpdate = true; g.add(ledInst);

    // ── Collision for 10 tables ───────────────────────────────
    for (const xc of xCols) for (const zr of zRows)
      this.controls.addCollisionBox(xc-1.05, xc+1.05, zr-0.58, zr+0.58);

    // ── Stool chairs (50) ─────────────────────────────────────
    this._buildStools(g, xCols, zRows);

    // ── Table number labels (canvas, only 2 to save memory) ──
    this._addLabel(g, xCols[0], zRows[0], '01');
    this._addLabel(g, xCols[1], zRows[4], '10');

    // ── Teacher Demo Station ──────────────────────────────────
    g.add(this._buildDemoStation());
    this.controls.addCollisionBox(-2.3, 2.3, -6.65, -5.1);

    // ── Preparation Room Furniture ────────────────────────────
    g.add(this._buildPrepRoom());

    this.scene.add(g);
    return g;
  }

  _buildStools(g, xCols, zRows) {
    const d = new THREE.Object3D();
    const seatInst  = new THREE.InstancedMesh(cyl(0.17,0.17,0.03,10), this.mat.chairSeat, 50);
    const shaftInst = new THREE.InstancedMesh(cyl(0.018,0.018,0.50,6), this.mat.steel, 50);
    let si = 0;
    for (let c = 0; c < 2; c++) {
      const xc = xCols[c];
      for (const zr of zRows) {
        const stoolPos = [
          [xc-0.5, zr-0.65], [xc+0.5, zr-0.65],
          [xc-0.5, zr+0.65], [xc+0.5, zr+0.65],
          [xc + (xc > 0 ? 1.1 : -1.1), zr]
        ];
        for (const [sx, sz] of stoolPos) {
          d.position.set(sx, 0.515, sz); d.updateMatrix();
          seatInst.setMatrixAt(si, d.matrix);
          d.position.set(sx, 0.26, sz); d.updateMatrix();
          shaftInst.setMatrixAt(si, d.matrix);
          si++;
        }
      }
    }
    seatInst.instanceMatrix.needsUpdate  = true; g.add(seatInst);
    shaftInst.instanceMatrix.needsUpdate = true; g.add(shaftInst);
  }

  _addLabel(g, x, z, num) {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 252, 60);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`MEJA PRAKTIKUM #${num}  (5 SISWA)`, 128, 38);
    const lbl = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.1),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c) })
    );
    lbl.position.set(x, 0.842, z + 0.51);
    g.add(lbl);
  }

  _buildDemoStation() {
    const g = new THREE.Group();
    g.position.set(0, 0, -5.8);

    // Podium platform
    addMesh(g, box(4.6, 0.15, 2.0), lamb(0x0f172a), 0, 0.075, 0, true);
    // Desk top
    addMesh(g, box(2.8, 0.06, 0.9), this.mat.benchTop, 0, 1.01, 0, true);
    // Desk body
    addMesh(g, box(2.7, 0.82, 0.8), this.mat.cabinet, 0, 0.56, 0, true);

    // Laptop (basic material, zero shading cost)
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x1e40af });
    addMesh(g, box(0.34, 0.02, 0.26), new THREE.MeshBasicMaterial({ color: 0x1e293b }), -0.7, 1.04, 0);
    addMesh(g, box(0.33, 0.20, 0.01), screenMat, -0.7, 1.135, -0.13);

    // Demo sink
    addMesh(g, box(0.38, 0.16, 0.32), this.mat.sink, 0.9, 0.96, 0);

    // E-Stop
    addMesh(g, box(0.18, 0.11, 0.12), lamb(0xdc2626), 0.2, 1.035, -0.22);

    g.userData = {
      type: 'demo_station',
      name: 'Meja Demonstrasi Guru & Panggung Elevasi',
      capacity: 'Instruktur / Guru Fisika',
      specs: 'Meja demo 2.8m di atas panggung elevasi 15cm. Instalasi listrik sentral, panel audio-visual, wastafel demonstrasi.'
    };
    return g;
  }

  _buildPrepRoom() {
    const g = new THREE.Group();

    // Prep desk
    addMesh(g, box(2.0, 0.8, 0.9), this.mat.cabinet, -7.5, 0.4, 0);
    this.controls.addCollisionBox(-8.6, -6.4, -0.5, 0.5);

    // 4 storage cabinets
    const cabGeo = box(0.5, 2.0, 0.78);
    const cabInst = new THREE.InstancedMesh(cabGeo, this.mat.cabinet, 4);
    const d = new THREE.Object3D();
    [-1.3, -0.4, 0.5, 1.4].forEach((z, i) => {
      d.position.set(-9.4, 1.0, z); d.rotation.set(0,0,0);
      d.updateMatrix(); cabInst.setMatrixAt(i, d.matrix);
      this.controls.addCollisionBox(-9.8, -9.0, z-0.4, z+0.4);
    });
    cabInst.instanceMatrix.needsUpdate = true; g.add(cabInst);

    // Cabinet glass fronts (MeshBasic)
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x9dceff, transparent: true, opacity: 0.35 });
    const glassGeo = new THREE.PlaneGeometry(0.72, 1.8);
    const glassInst = new THREE.InstancedMesh(glassGeo, glassMat, 4);
    [-1.3, -0.4, 0.5, 1.4].forEach((z, i) => {
      d.position.set(-9.15, 1.0, z);
      d.rotation.set(0, Math.PI / 2, 0);
      d.updateMatrix(); glassInst.setMatrixAt(i, d.matrix);
    });
    glassInst.instanceMatrix.needsUpdate = true; g.add(glassInst);

    return g;
  }
}

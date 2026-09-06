import * as THREE from 'three';

export class RoomBuilder {
  constructor(scene) {
    this.scene = scene;
  }

  build() {
    const roomGroup = new THREE.Group();
    const wallMat  = new THREE.MeshLambertMaterial({ color: 0xf1f5f9 });
    const floorMat = this._makeFloorMat();
    const ceilMat  = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xbfdbfe, transparent: true, opacity: 0.35 });
    const metalMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const baseMat  = new THREE.MeshLambertMaterial({ color: 0x1e3a8a });

    const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, shadow = false) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      if (rx) m.rotation.x = rx;
      if (ry) m.rotation.y = ry;
      m.receiveShadow = shadow;
      roomGroup.add(m);
      return m;
    };

    // ============ MAIN HALL (15m × 8m × 3.8m) ============
    // Floor
    add(new THREE.PlaneGeometry(8, 15), floorMat, 0, 0, 0, -Math.PI / 2, 0, 0, true);
    // Ceiling
    add(new THREE.PlaneGeometry(8, 15), ceilMat, 0, 3.8, 0, Math.PI / 2);
    // Front wall Z=-7.5
    add(new THREE.BoxGeometry(8, 3.8, 0.18), wallMat, 0, 1.9, -7.5, 0, 0, 0, true);
    // Back wall Z=+7.5
    add(new THREE.BoxGeometry(8, 3.8, 0.18), wallMat, 0, 1.9,  7.5, 0, 0, 0, true);

    // Right exterior wall X=+4 — split into sill, header, mullions
    //  Bottom sill
    add(new THREE.BoxGeometry(0.18, 0.9, 15), wallMat, 4.0, 0.45, 0, 0, 0, 0, true);
    //  Top header
    add(new THREE.BoxGeometry(0.18, 0.7, 15), wallMat, 4.0, 3.45, 0);
    //  5 Window glass panes
    for (let i = 0; i < 5; i++) {
      const zPos = -5.0 + i * 2.5;
      add(new THREE.PlaneGeometry(2.0, 2.1), glassMat, 3.98, 2.0, zPos, 0, -Math.PI / 2);
    }
    //  Vertical mullion strips between windows
    for (let i = 0; i < 6; i++) {
      const zPos = -5.0 + i * 2.5 - 1.0;
      add(new THREE.BoxGeometry(0.18, 2.2, 0.08), wallMat, 4.0, 2.0, zPos);
    }

    // Left interior partition wall X=-4 (split for prep room doorway Z: -2.5 to +2.5)
    add(new THREE.BoxGeometry(0.18, 3.8, 5.0), wallMat, -4.0, 1.9, -5.0, 0, 0, 0, true);
    add(new THREE.BoxGeometry(0.18, 3.8, 5.0), wallMat, -4.0, 1.9,  5.0, 0, 0, 0, true);
    // Door header
    add(new THREE.BoxGeometry(0.18, 1.4, 5.0), wallMat, -4.0, 3.1, 0);
    // Glass partition panel to see prep room
    add(new THREE.PlaneGeometry(2.8, 1.5), glassMat, -3.99, 1.35, -1.0, 0, Math.PI / 2);

    // ============ PREP ROOM (6m × 4m) X:[-10,-4] Z:[-2,+2] ============
    add(new THREE.PlaneGeometry(6, 4),
      new THREE.MeshLambertMaterial({ color: 0x1e293b }), -7.0, 0.01, 0, -Math.PI / 2, 0, 0, true);
    add(new THREE.PlaneGeometry(6, 4), ceilMat, -7.0, 3.8, 0, Math.PI / 2);
    add(new THREE.BoxGeometry(0.18, 3.8, 4),  wallMat, -10.0, 1.9, 0, 0, 0, 0, true);
    add(new THREE.BoxGeometry(6,    3.8, 0.18), wallMat, -7.0, 1.9, -2.0);
    add(new THREE.BoxGeometry(6,    3.8, 0.18), wallMat, -7.0, 1.9,  2.0);

    // ============ WHITEBOARD ============
    this.buildWhiteboard(roomGroup);

    // ============ CEILING BEAMS ============
    const beamGeo = new THREE.BoxGeometry(8, 0.22, 0.12);
    const beamMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
    for (let z = -5.0; z <= 5.0; z += 2.5) {
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(0, 3.69, z);
      roomGroup.add(beam);
    }

    // ============ BASEBOARD STRIPS ============
    const bb = new THREE.MeshLambertMaterial({ color: 0x1e3a8a });
    add(new THREE.BoxGeometry(8, 0.1, 0.03), bb, 0, 0.05, -7.4);
    add(new THREE.BoxGeometry(8, 0.1, 0.03), bb, 0, 0.05,  7.4);

    // ============ SIGNAGE OVER PREP DOOR ============
    const signTex = this._makeSignTexture();
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(1.7, 0.42),
      new THREE.MeshBasicMaterial({ map: signTex })
    );
    sign.position.set(-3.87, 2.65, 0);
    sign.rotation.y = Math.PI / 2;
    roomGroup.add(sign);

    // ============ PHYSICS CONSTANTS POSTER ============
    const posterTex = this._makePosterTexture();
    const poster = new THREE.Mesh(
      new THREE.PlaneGeometry(1.3, 1.9),
      new THREE.MeshBasicMaterial({ map: posterTex })
    );
    poster.position.set(-3.88, 2.1, -4.5);
    poster.rotation.y = Math.PI / 2;
    roomGroup.add(poster);

    this.scene.add(roomGroup);
    return roomGroup;
  }

  _makeFloorMat() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(3, 3, 123, 123);
    ctx.fillRect(130, 3, 123, 123);
    ctx.fillRect(3, 130, 123, 123);
    ctx.fillRect(130, 130, 123, 123);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(12, 8); // ~60cm tiles
    return new THREE.MeshLambertMaterial({ map: tex });
  }

  _makeSignTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 128;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 5;
    ctx.strokeRect(4, 4, 504, 120);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RUANG PERSIAPAN & ALAT — 24 m²', 256, 52);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('PERMENDIKBUD No. 24/2007  ·  Min 18 m²', 256, 92);
    return new THREE.CanvasTexture(c);
  }

  _makePosterTexture() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 384;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 256, 384);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 376);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('KONSTANTA FISIKA', 128, 38);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    const lines = [
      'g  = 9.80665 m/s²', 'c  = 2.998 × 10⁸ m/s',
      'e  = 1.602 × 10⁻¹⁹ C', 'h  = 6.626 × 10⁻³⁴ J·s',
      'G  = 6.674 × 10⁻¹¹ N·m²/kg²',
      'k  = 1.381 × 10⁻²³ J/K',
      'Nₐ = 6.022 × 10²³ mol⁻¹'
    ];
    lines.forEach((l, i) => ctx.fillText(l, 18, 80 + i * 34));
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Rasio Min: 2.4 m²/Siswa', 128, 330);
    ctx.fillStyle = '#64748b';
    ctx.font = '13px sans-serif';
    ctx.fillText('Permendikbud No. 24/2007', 128, 355);
    return new THREE.CanvasTexture(c);
  }

  buildWhiteboard(group) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;  // Halved vs before
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 512, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('LABORATORIUM FISIKA — STANDAR KEMENDIKBUD RI', 20, 24);
    const fmls = [
      { c: '#0f172a', t: '1. Hukum Newton:   ΣF = m · a' },
      { c: '#2563eb', t: '2. Snellius:        n₁·sin θ₁ = n₂·sin θ₂' },
      { c: '#059669', t: '3. Ohm:             V = I · R' },
      { c: '#d97706', t: '4. Asas Black:      Q_lepas = Q_terima' },
    ];
    ctx.font = 'bold 20px monospace';
    fmls.forEach((f, i) => {
      ctx.fillStyle = f.c;
      ctx.fillText(f.t, 24, 72 + i * 44);
    });
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('⚠️ K3: Pakai Jas Lab! Matikan Listrik Sebelum Merangkai!', 24, 230);

    const tex = new THREE.CanvasTexture(c);
    const wb = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 2.2),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    wb.position.set(0, 2.0, -7.38);
    group.add(wb);

    // Frame (lambertian, no shadow needed)
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(5.3, 2.3, 0.04),
      new THREE.MeshLambertMaterial({ color: 0x334155 })
    );
    frame.position.set(0, 2.0, -7.39);
    group.add(frame);
  }
}

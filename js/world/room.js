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

    // ============ RIGHT EXTERIOR WALL X=+4 & ARCHITECTURAL WINDOWS ============
    // Bottom wall sill (Y: 0 to 0.9)
    add(new THREE.BoxGeometry(0.18, 0.9, 15), wallMat, 4.0, 0.45, 0, 0, 0, 0, true);
    // Top wall header (Y: 3.0 to 3.8)
    add(new THREE.BoxGeometry(0.18, 0.8, 15), wallMat, 4.0, 3.4, 0);

    // Interior windowsill ledge (shelf)
    const ledgeMat = new THREE.MeshLambertMaterial({ color: 0xe2e8f0 });
    add(new THREE.BoxGeometry(0.26, 0.04, 15), ledgeMat, 3.92, 0.92, 0);

    // 5 Architectural Windows with aluminum frames & double-sided sky-tinted glass
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x1e293b }); // Dark charcoal aluminum
    const winGlassMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd, transparent: true, opacity: 0.35, side: THREE.DoubleSide
    });

    for (let i = 0; i < 5; i++) {
      const zPos = -5.0 + i * 2.5;

      // Lower main glass pane (Y: 0.95 to 2.45)
      add(new THREE.PlaneGeometry(2.0, 1.45), winGlassMat, 3.99, 1.675, zPos, 0, -Math.PI / 2);

      // Upper ventilation hopper window (Permendikbud 24/2007: sirkulasi udara alami)
      add(new THREE.PlaneGeometry(2.0, 0.40), winGlassMat, 3.99, 2.75, zPos, 0, -Math.PI / 2);

      // Window Frames
      add(new THREE.BoxGeometry(0.08, 0.05, 2.08), frameMat, 4.0, 2.98, zPos); // Top
      add(new THREE.BoxGeometry(0.08, 0.05, 2.08), frameMat, 4.0, 0.92, zPos); // Bottom
      add(new THREE.BoxGeometry(0.08, 0.05, 2.08), frameMat, 4.0, 2.45, zPos); // Transom divider
      add(new THREE.BoxGeometry(0.08, 2.1, 0.05), frameMat, 4.0, 1.95, zPos - 1.02); // Left jamb
      add(new THREE.BoxGeometry(0.08, 2.1, 0.05), frameMat, 4.0, 1.95, zPos + 1.02); // Right jamb
      add(new THREE.BoxGeometry(0.06, 1.5, 0.04), frameMat, 4.0, 1.70, zPos);        // Center sash
    }

    // Vertical wall piers between windows
    for (let i = 0; i < 6; i++) {
      const zPos = -5.0 + i * 2.5 - 1.25;
      add(new THREE.BoxGeometry(0.20, 2.1, 0.42), wallMat, 4.0, 1.95, zPos, 0, 0, 0, true);
    }

    // ============ OUTDOOR SCENERY (RIGHT WINDOW VISTA) ============
    // Outdoor manicured school lawn
    const lawnMat = new THREE.MeshLambertMaterial({ color: 0x1f5424 });
    add(new THREE.PlaneGeometry(16, 26), lawnMat, 12.0, -0.01, 0, -Math.PI / 2, 0, 0);

    // Outdoor paved walkway along windows
    const paveMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    add(new THREE.PlaneGeometry(1.6, 22), paveMat, 4.9, 0.005, 0, -Math.PI / 2, 0, 0);

    // Decorative landscape garden hedges along the walkway
    const hedgeMat = new THREE.MeshLambertMaterial({ color: 0x166534 });
    add(new THREE.BoxGeometry(0.55, 0.75, 18), hedgeMat, 6.0, 0.375, 0);

    // Outdoor daylight sky panorama backdrop plane
    const skyTex = this._makeOutdoorSkyTexture();
    const skyPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 16),
      new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.DoubleSide })
    );
    skyPlane.position.set(18.0, 6.0, 0);
    skyPlane.rotation.y = -Math.PI / 2;
    roomGroup.add(skyPlane);

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

    // ============ PROSEDUR K3 WALL BOARD (TULISAN K3 DI DINDING) ============
    this.buildK3WallBoard(roomGroup);

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

  buildK3WallBoard(group) {
    const tex = this._makeK3BoardTexture();
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 1.9),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    board.position.set(-3.88, 2.0, 5.0);
    board.rotation.y = Math.PI / 2;
    board.userData = {
      id: 'k3_wall',
      type: 'safety',
      name: 'Papan SOP & Prosedur K3 Laboratorium Fisika',
      category: 'Standar Keselamatan Wajib Dinding',
      description: 'Pedoman K3 resmi: Kewajiban jas lab & APD, tata tertib praktikum, pencegahan sengatan listrik, serta SOP tanggap darurat E-Stop, APAR, dan wastafel cuci tangan.',
      regulationCitation: 'Permendikbud No. 24/2007 (Kesehatan & Keselamatan Kerja Lab Fisika).'
    };
    group.add(board);

    // Beveled frame for K3 wall board
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 2.0, 3.5),
      new THREE.MeshLambertMaterial({ color: 0x1e293b })
    );
    frame.position.set(-3.91, 2.0, 5.0);
    group.add(frame);
  }

  _makeK3BoardTexture() {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 576;
    const ctx = c.getContext('2d');

    // Deep slate background
    ctx.fillStyle = '#0a1224';
    ctx.fillRect(0, 0, 1024, 576);

    // Header safety green bar
    ctx.fillStyle = '#065f46';
    ctx.fillRect(0, 0, 1024, 76);

    // Border
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 1016, 568);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('🛡️ STANDAR OPERASIONAL PROSEDUR (SOP) K3 LAB FISIKA', 24, 46);

    // Subtitle
    ctx.fillStyle = '#6ee7b7';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('PEDOMAN KESELAMATAN KERJA & PROTOKOL TANGGAP DARURAT · PERMENDIKBUD NO. 24/2007', 26, 68);

    const drawCard = (x, y, w, h, title, titleCol, items) => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = titleCol;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Card header
      ctx.fillStyle = titleCol;
      ctx.fillRect(x, y, w, 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(title, x + 12, y + 22);

      // Card items
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px sans-serif';
      let textY = y + 54;
      items.forEach(item => {
        const words = item.split(' ');
        let line = '';
        words.forEach(w => {
          const testLine = line + (line ? ' ' : '') + w;
          if (ctx.measureText(testLine).width > w - 24) {
            ctx.fillText(line, x + 12, textY);
            line = '  ' + w;
            textY += 18;
          } else {
            line = testLine;
          }
        });
        if (line) {
          ctx.fillText(line, x + 12, textY);
          textY += 21;
        }
      });
    };

    // Col 1: APD & Tata Tertib
    drawCard(20, 94, 310, 426, '1. TATA TERTIB & APD WAJIB', '#0284c7', [
      '• Wajib memakai Jas Laboratorium terkancing rapi.',
      '• Gunakan Sepatu Tertutup (dilarang sandal).',
      '• Dilarang membawa makanan & minuman ke lab.',
      '• Dilarang berlari atau bercanda di area praktikum.',
      '• Tas dan jaket disimpan di ruang persiapan.',
      '• Pelindung mata wajib saat percobaan optik / laser.',
      '• Patuhi instruksi Guru & Pranata Laboratorium.'
    ]);

    // Col 2: Kelistrikan & Alat
    drawCard(348, 94, 328, 426, '2. KELISTRIKAN & ALAT PRAKTIKUM', '#d97706', [
      '• Pastikan CATU DAYA OFF sebelum merangkai kabel.',
      '• Periksa batas ukur multimeter, amperemeter, & osiloskop.',
      '• DILARANG menyentuh terminal kabel dengan tangan basah.',
      '• Rapikan kabel jumper agar tidak tersandung siswa lain.',
      '• Kalibrasi alat ukur sebelum mengambil data praktikum.',
      '• Matikan instrumen segera bila tercium bau gosong.',
      '• Instalasi daya meja dilindungi MCB & tombol E-Stop.'
    ]);

    // Col 3: Tanggap Darurat
    drawCard(694, 94, 310, 426, '3. TANGGAP DARURAT (EMERGENCY)', '#dc2626', [
      '• SENGATAN LISTRIK: Tekan tombol E-STOP merah seketika.',
      '• KEBAKARAN: Gunakan APAR Serbuk Kimia ABC 6kg di pintu.',
      '• IRITASI / KIMIA: Segera bilas di WASTAFEL CUCI TANGAN.',
      '• CEDERA / LUKA: Hubungi P3K lengkap di dekat pintu keluar.',
      '• EVAKUASI: Lewati pintu darurat (EXIT) ke titik kumpul.',
      '• Tetap tenang dan jangan berdesak-desakan saat evakuasi.'
    ]);

    // Footer
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(20, 528, 984, 36);
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('UTAMAKAN KESELAMATAN KERJA (ZERO ACCIDENT) — LABORATORIUM FISIKA KEMENDIKBUDRISTEK RI', 512, 551);

    return new THREE.CanvasTexture(c);
  }

  _makeOutdoorSkyTexture() {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const ctx = c.getContext('2d');

    // Natural daylight sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#38bdf8');   // Daylight bright blue
    grad.addColorStop(0.5, '#7dd3fc'); // Sky cyan
    grad.addColorStop(0.85, '#bae6fd'); // Near horizon bright
    grad.addColorStop(1, '#fef08a');   // Soft sunlight glow
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Sun glow
    const sunGrad = ctx.createRadialGradient(380, 80, 10, 380, 80, 120);
    sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    sunGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.6)');
    sunGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(380, 80, 120, 0, Math.PI * 2);
    ctx.fill();

    // Subtle clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    const drawCloud = (cx, cy, r) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.7, cy - r * 0.2, r * 0.8, 0, Math.PI * 2);
      ctx.arc(cx + r * 1.4, cy, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCloud(120, 110, 28);
    drawCloud(260, 140, 34);

    return new THREE.CanvasTexture(c);
  }
}

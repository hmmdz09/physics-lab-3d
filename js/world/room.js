import * as THREE from 'three';

export class RoomBuilder {
  constructor(scene) {
    this.scene = scene;
    this.materials = {};
    this.initMaterials();
  }

  initMaterials() {
    // 1. Procedural Floor Tile Texture
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const fctx = floorCanvas.getContext('2d');
    fctx.fillStyle = '#1e293b';
    fctx.fillRect(0, 0, 512, 512);
    // Draw 4 tiles (2x2) with light grid lines
    fctx.fillStyle = '#0f172a';
    fctx.fillRect(4, 4, 248, 248);
    fctx.fillRect(260, 4, 248, 248);
    fctx.fillRect(4, 260, 248, 248);
    fctx.fillRect(260, 260, 248, 248);
    fctx.strokeStyle = '#334155';
    fctx.lineWidth = 4;
    fctx.strokeRect(2, 2, 508, 508);

    const floorTexture = new THREE.CanvasTexture(floorCanvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(15, 8); // 60cm tiles across 15m x 8m

    this.materials.floor = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.25,
      metalness: 0.15
    });

    // 2. Wall Material
    this.materials.wall = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.85,
      metalness: 0.05
    });

    // 3. Wall Baseboard (Skirting)
    this.materials.baseboard = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.4
    });

    // 4. Ceiling Material
    this.materials.ceiling = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.95
    });

    // 5. Glass Material for Windows
    this.materials.windowGlass = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      transmission: 0.9,
      opacity: 0.6,
      transparent: true,
      roughness: 0.05,
      ior: 1.5
    });

    // 6. Metal Frame Material
    this.materials.metalFrame = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.3
    });
  }

  build() {
    const roomGroup = new THREE.Group();

    // ==========================================
    // 1. MAIN LAB ROOM (15m Length x 8m Width x 3.8m Height = 120 m²)
    // Coordinates: X: [-4, 4], Z: [-7.5, 7.5], Y: [0, 3.8]
    // ==========================================

    // Floor
    const floorGeo = new THREE.PlaneGeometry(8, 15);
    const floorMesh = new THREE.Mesh(floorGeo, this.materials.floor);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    roomGroup.add(floorMesh);

    // Ceiling
    const ceilGeo = new THREE.PlaneGeometry(8, 15);
    const ceilMesh = new THREE.Mesh(ceilGeo, this.materials.ceiling);
    ceilMesh.position.y = 3.8;
    ceilMesh.rotation.x = Math.PI / 2;
    roomGroup.add(ceilMesh);

    // Front Wall (Z = -7.5) Behind Teacher Demonstration Desk
    const frontWallGeo = new THREE.BoxGeometry(8, 3.8, 0.2);
    const frontWall = new THREE.Mesh(frontWallGeo, this.materials.wall);
    frontWall.position.set(0, 1.9, -7.5);
    frontWall.receiveShadow = true;
    roomGroup.add(frontWall);

    // Back Wall (Z = +7.5) with Outward Emergency Exit Doors
    const backWallGeo = new THREE.BoxGeometry(8, 3.8, 0.2);
    const backWall = new THREE.Mesh(backWallGeo, this.materials.wall);
    backWall.position.set(0, 1.9, 7.5);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    // Right Exterior Wall (X = +4) with Large Daylighting Windows
    // Wall sections with cutouts for windows
    this.buildWindowWall(roomGroup);

    // Left Interior Wall (X = -4) with Door to Preparation Room
    this.buildPartitionWall(roomGroup);

    // ==========================================
    // 2. PREPARATION & STORAGE ROOM (4m Length x 6m Width = 24 m²)
    // Attached on left: X: [-10, -4], Z: [-3, 3], Y: [0, 3.8]
    // ==========================================
    this.buildPreparationRoom(roomGroup);

    // ==========================================
    // 3. ARCHITECTURAL DETAILS & WALL ASSETS
    // ==========================================
    this.buildWhiteboard(roomGroup);
    this.buildWallPosters(roomGroup);
    this.buildCeilingBeams(roomGroup);
    this.buildBaseboards(roomGroup);

    this.scene.add(roomGroup);
    return roomGroup;
  }

  buildWindowWall(group) {
    // Exterior wall with 6 tall windows (X = +4.0)
    const wallLength = 15;
    const windowCount = 5;
    const pillarWidth = 0.5;
    const winWidth = 2.0;
    const winHeight = 2.2;
    const sillHeight = 0.9;

    // Bottom solid wall sill
    const bottomWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, sillHeight, wallLength),
      this.materials.wall
    );
    bottomWall.position.set(4.0, sillHeight / 2, 0);
    bottomWall.receiveShadow = true;
    group.add(bottomWall);

    // Top wall above windows
    const topWallHeight = 3.8 - (sillHeight + winHeight);
    const topWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, topWallHeight, wallLength),
      this.materials.wall
    );
    topWall.position.set(4.0, 3.8 - topWallHeight / 2, 0);
    topWall.receiveShadow = true;
    group.add(topWall);

    // Window panes and vertical mullions
    for (let i = 0; i < windowCount; i++) {
      const zPos = -5.0 + i * 2.5;

      // Window Glass
      const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(winWidth * 0.95, winHeight),
        this.materials.windowGlass
      );
      glass.position.set(3.98, sillHeight + winHeight / 2, zPos);
      glass.rotation.y = -Math.PI / 2;
      group.add(glass);

      // Window Frame Outline
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, winHeight, 0.08),
        this.materials.metalFrame
      );
      frame.position.set(3.99, sillHeight + winHeight / 2, zPos);
      group.add(frame);
    }
  }

  buildPartitionWall(group) {
    // Left interior wall (X = -4.0)
    // Wall before prep room door (Z: [-7.5, -2.5])
    const wallNorth = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 3.8, 5.0),
      this.materials.wall
    );
    wallNorth.position.set(-4.0, 1.9, -5.0);
    wallNorth.receiveShadow = true;
    group.add(wallNorth);

    // Wall after prep room door (Z: [2.5, 7.5])
    const wallSouth = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 3.8, 5.0),
      this.materials.wall
    );
    wallSouth.position.set(-4.0, 1.9, 5.0);
    wallSouth.receiveShadow = true;
    group.add(wallSouth);

    // Header above door (Z: [-2.5, 2.5], Y: [2.4, 3.8])
    const doorHeader = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 1.4, 5.0),
      this.materials.wall
    );
    doorHeader.position.set(-4.0, 3.1, 0);
    group.add(doorHeader);

    // Glass partition & door frame into prep room
    const prepDoorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 2.4, 1.8),
      this.materials.metalFrame
    );
    prepDoorFrame.position.set(-4.0, 1.2, 0);
    group.add(prepDoorFrame);

    // Glass panel for prep room view
    const prepGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 1.6),
      this.materials.windowGlass
    );
    prepGlass.position.set(-3.98, 1.4, -1.0);
    prepGlass.rotation.y = Math.PI / 2;
    group.add(prepGlass);

    // Signboard above prep room: "RUANG PERSIAPAN & GUDANG ALAT (24 m²)"
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sctx = signCanvas.getContext('2d');
    sctx.fillStyle = '#0f172a';
    sctx.fillRect(0, 0, 512, 128);
    sctx.strokeStyle = '#38bdf8';
    sctx.lineWidth = 6;
    sctx.strokeRect(4, 4, 504, 120);
    sctx.fillStyle = '#38bdf8';
    sctx.font = 'bold 30px sans-serif';
    sctx.textAlign = 'center';
    sctx.fillText('RUANG PERSIAPAN & ALAT', 256, 54);
    sctx.fillStyle = '#94a3b8';
    sctx.font = 'bold 20px monospace';
    sctx.fillText('STANDAR PERMENDIKBUD 24 M²', 256, 92);

    const signTexture = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 0.45),
      new THREE.MeshBasicMaterial({ map: signTexture })
    );
    signMesh.position.set(-3.89, 2.6, 0);
    signMesh.rotation.y = Math.PI / 2;
    group.add(signMesh);
  }

  buildPreparationRoom(group) {
    // Prep Room Dimensions: Width 6m (X: -10 to -4), Length 4m (Z: -2 to +2), Area 24 m²
    // Floor
    const prepFloorGeo = new THREE.PlaneGeometry(6, 4);
    const prepFloor = new THREE.Mesh(
      prepFloorGeo,
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
    );
    prepFloor.position.set(-7.0, 0.01, 0);
    prepFloor.rotation.x = -Math.PI / 2;
    group.add(prepFloor);

    // Ceiling
    const prepCeil = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 4),
      this.materials.ceiling
    );
    prepCeil.position.set(-7.0, 3.8, 0);
    prepCeil.rotation.x = Math.PI / 2;
    group.add(prepCeil);

    // West Wall (X = -10)
    const westWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 3.8, 4),
      this.materials.wall
    );
    westWall.position.set(-10.0, 1.9, 0);
    group.add(westWall);

    // North Wall (Z = -2.0)
    const northWall = new THREE.Mesh(
      new THREE.BoxGeometry(6, 3.8, 0.2),
      this.materials.wall
    );
    northWall.position.set(-7.0, 1.9, -2.0);
    group.add(northWall);

    // South Wall (Z = +2.0)
    const southWall = new THREE.Mesh(
      new THREE.BoxGeometry(6, 3.8, 0.2),
      this.materials.wall
    );
    southWall.position.set(-7.0, 1.9, 2.0);
    group.add(southWall);
  }

  buildWhiteboard(group) {
    // Whiteboard on Front Wall (Z = -7.38, Y = 1.9)
    const wbCanvas = document.createElement('canvas');
    wbCanvas.width = 1024;
    wbCanvas.height = 512;
    const ctx = wbCanvas.getContext('2d');

    // Ceramic white background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 1024, 512);

    // Title banner
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, 1024, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('LABORATORIUM FISIKA — SMA KEMENDIKBUDRISTEK RI', 40, 40);

    // Physics formulas written in markers
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('1. HUKUM II NEWTON:  ΣF = m · a', 60, 130);

    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('2. PEMBIASAN:       n₁·sin(θ₁) = n₂·sin(θ₂)', 60, 200);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('3. HUKUM OHM:       V = I · R  |  P = V · I', 60, 270);

    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('4. ASAS BLACK:      Q_lepas = Q_terima', 60, 340);

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('⚠️ PATUHI K3 LAB: Pakai Jas Lab, Matikan Daya Listrik Sebelum Merangkai!', 60, 440);

    const wbTexture = new THREE.CanvasTexture(wbCanvas);
    const wbMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5.2, 2.2),
      new THREE.MeshStandardMaterial({
        map: wbTexture,
        roughness: 0.15,
        metalness: 0.05
      })
    );
    wbMesh.position.set(0, 2.0, -7.38);
    group.add(wbMesh);

    // Frame for whiteboard
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(5.3, 2.3, 0.04),
      this.materials.metalFrame
    );
    frame.position.set(0, 2.0, -7.39);
    group.add(frame);
  }

  buildWallPosters(group) {
    // 1. Periodic Table / Physics Constants Poster on Left Wall
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 512;
    pCanvas.height = 768;
    const pctx = pCanvas.getContext('2d');
    pctx.fillStyle = '#0f172a';
    pctx.fillRect(0, 0, 512, 768);
    pctx.strokeStyle = '#38bdf8';
    pctx.lineWidth = 6;
    pctx.strokeRect(6, 6, 500, 756);

    pctx.fillStyle = '#38bdf8';
    pctx.font = 'bold 28px sans-serif';
    pctx.textAlign = 'center';
    pctx.fillText('KONSTANTA FISIKA', 256, 60);

    pctx.fillStyle = '#e2e8f0';
    pctx.font = '20px monospace';
    pctx.textAlign = 'left';
    pctx.fillText('g  = 9.80665 m/s²', 40, 140);
    pctx.fillText('c  = 2.99792 × 10⁸ m/s', 40, 190);
    pctx.fillText('e  = 1.60218 × 10⁻¹⁹ C', 40, 240);
    pctx.fillText('h  = 6.62607 × 10⁻³⁴ J·s', 40, 290);
    pctx.fillText('G  = 6.67430 × 10⁻¹¹ N·m²/kg²', 40, 340);
    pctx.fillText('k  = 1.38065 × 10⁻²³ J/K', 40, 390);
    pctx.fillText('Nₐ = 6.02214 × 10²³ mol⁻¹', 40, 440);

    pctx.fillStyle = '#10b981';
    pctx.font = 'bold 24px sans-serif';
    pctx.textAlign = 'center';
    pctx.fillText('STANDAR SARPRAS KEMENDIKBUD', 256, 580);
    pctx.fillStyle = '#94a3b8';
    pctx.font = '18px sans-serif';
    pctx.fillText('Permendikbud No. 24/2007', 256, 620);
    pctx.fillText('Rasio Minimum: 2.4 m² / Siswa', 256, 660);

    const posterTex = new THREE.CanvasTexture(pCanvas);
    const posterMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 2.1),
      new THREE.MeshStandardMaterial({ map: posterTex, roughness: 0.3 })
    );
    posterMesh.position.set(-3.88, 2.1, -4.5);
    posterMesh.rotation.y = Math.PI / 2;
    group.add(posterMesh);
  }

  buildCeilingBeams(group) {
    // Steel architectural beams along the 15m hall
    const beamGeo = new THREE.BoxGeometry(8, 0.25, 0.15);
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });

    for (let z = -5.0; z <= 5.0; z += 2.5) {
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(0, 3.68, z);
      group.add(beam);
    }
  }

  buildBaseboards(group) {
    // Front, Back baseboards
    const bbFront = new THREE.Mesh(new THREE.BoxGeometry(8, 0.12, 0.04), this.materials.baseboard);
    bbFront.position.set(0, 0.06, -7.38);
    group.add(bbFront);

    const bbBack = new THREE.Mesh(new THREE.BoxGeometry(8, 0.12, 0.04), this.materials.baseboard);
    bbBack.position.set(0, 0.06, 7.38);
    group.add(bbBack);
  }
}
